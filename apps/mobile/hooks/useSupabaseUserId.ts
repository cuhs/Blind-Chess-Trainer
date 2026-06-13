import { useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

function isInvalidSupabaseSession(error: { status?: number }): boolean {
  const status = error.status ?? 0;
  return status === 401 || status === 403 || status === 422;
}

async function ensureSupabaseUserId(): Promise<string | null> {
  if (!supabase) return null;

  // getSession() reads AsyncStorage only; after `supabase db reset` the JWT can
  // outlive the auth.users row and profile upserts hit profiles_id_fkey (23503).
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (user?.id) return user.id;

  if (userError && !isInvalidSupabaseSession(userError)) throw userError;

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
