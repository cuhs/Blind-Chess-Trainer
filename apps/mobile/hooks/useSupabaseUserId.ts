import { useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

async function ensureSupabaseUserId(): Promise<string | null> {
  if (!supabase) return null;

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();
  if (sessionError) throw sessionError;

  const existingId = sessionData.session?.user?.id;
  if (existingId) return existingId;

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
