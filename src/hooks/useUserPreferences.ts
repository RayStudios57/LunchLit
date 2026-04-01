import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: string | null;
  color_mode: string | null;
  school_end_date: string | null;
  use_theme_background: boolean;
  calendar_sync_enabled: boolean;
}

export function useUserPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as UserPreferences;
    },
    enabled: !!user,
  });

  const updatePreference = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('user_preferences')
        .upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
    },
  });

  return { preferences, isLoading, updatePreference };
}
