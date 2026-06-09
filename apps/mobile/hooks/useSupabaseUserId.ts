import { useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export function useSupabaseUserId() {
  return useQuery({
    queryKey: ['supabase-user-id'],
    enabled: isSupabaseConfigured && Boolean(supabase),
    queryFn: async () => {
      if (!supabase) return null;

      const { data, error } = await supabase.auth.getUser();
      if (error) return null;

      return data.user?.id ?? null;
    },
  });
}
