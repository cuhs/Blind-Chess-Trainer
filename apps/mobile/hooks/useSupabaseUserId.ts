import { useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

function isStaleOrMissingSession(error: {
  status?: number;
  message?: string;
}): boolean {
  const status = error.status ?? 0;
  if (status === 400 && error.message?.includes('Auth session missing')) {
    return true;
  }
  return status === 401 || status === 403 || status === 422;
}

async function ensureSupabaseUserId(): Promise<string | null> {
  if (!supabase) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  const sessionUserId = sessionData.session?.user?.id;

  if (sessionUserId) {
    // Validate cached JWT server-side; stale tokens survive `supabase db reset`.
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (user?.id) return user.id;
    if (userError && !isStaleOrMissingSession(userError)) throw userError;
  }

  await supabase.auth.signOut();

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;

  return data.user?.id ?? null;
}

export function useSupabaseUserId() {
  return useQuery({
    queryKey: ['supabase-user-id'],
    enabled: isSupabaseConfigured && Boolean(supabase),
    staleTime: Infinity,
    retry: 1,
    queryFn: ensureSupabaseUserId,
  });
}
