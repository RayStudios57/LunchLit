import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Suggestion {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  category: string;
  status: string;
  created_at: string;
}

export function useSuggestions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['user-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Suggestion[];
    },
  });

  const submitSuggestion = useMutation({
    mutationFn: async ({ title, description, category }: { title: string; description?: string; category?: string }) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('user_suggestions')
        .insert({
          user_id: user.id,
          title,
          description,
          category: category || 'feature',
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-suggestions'] });
      toast.success('Suggestion submitted! Thank you for your feedback.');
    },
    onError: () => toast.error('Failed to submit suggestion'),
  });

  return {
    suggestions,
    isLoading,
    submitSuggestion,
    isAuthenticated: !!user,
  };
}
