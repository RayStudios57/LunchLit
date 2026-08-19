import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface FitnessProfile {
  id: string;
  user_id: string;
  age: number;
  goal: string | null;
  days_per_week: number;
}

export function useFitnessProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['fitness_profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('fitness_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as FitnessProfile | null;
    },
    enabled: !!user,
  });

  const save = useMutation({
    mutationFn: async (patch: { age: number; goal: string; days_per_week: number }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('fitness_profiles')
        .upsert({ user_id: user.id, ...patch }, { onConflict: 'user_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fitness_profile', user?.id] });
    },
  });

  return { profile, isLoading, save };
}
