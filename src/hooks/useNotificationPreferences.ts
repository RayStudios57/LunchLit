import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface NotificationPreferences {
  id: string;
  user_id: string;
  new_menu_items: boolean;
  study_hall_availability: boolean;
  grade_progression: boolean;
  discussion_replies: boolean;
  task_reminders: boolean;
  created_at: string;
  updated_at: string;
}

const defaultPreferences = {
  new_menu_items: true,
  study_hall_availability: true,
  grade_progression: true,
  discussion_replies: true,
  task_reminders: true,
};

export function useNotificationPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification_preferences', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No preferences yet, create default ones
          const { data: newData, error: insertError } = await supabase
            .from('notification_preferences')
            .insert({ user_id: user.id, ...defaultPreferences })
            .select()
            .single();
          
          if (insertError) throw insertError;
          return newData as NotificationPreferences;
        }
        throw error;
      }
      return data as NotificationPreferences;
    },
    enabled: !!user,
  });

  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification_preferences'] });
      toast({ title: 'Notification preferences updated!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error updating preferences', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  return {
    preferences: preferences || { ...defaultPreferences, id: '', user_id: '', created_at: '', updated_at: '' },
    isLoading,
    updatePreferences,
  };
}
