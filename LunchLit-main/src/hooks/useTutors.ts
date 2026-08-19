import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Tutor {
  id: string;
  school_id: string | null;
  created_by: string;
  name: string;
  subject: string;
  availability: string | null;
  rating: number | null;
  is_online: boolean;
  contact_info: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export function useTutors(schoolId?: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: tutors = [], isLoading } = useQuery({
    queryKey: ['tutors', schoolId],
    queryFn: async () => {
      // Get school tutors + online tutors
      let query = supabase.from('tutors').select('*');
      
      if (schoolId) {
        query = query.or(`school_id.eq.${schoolId},is_online.eq.true`);
      } else {
        query = query.eq('is_online', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Tutor[];
    },
  });

  const addTutor = useMutation({
    mutationFn: async (tutor: Omit<Tutor, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('tutors')
        .insert({ ...tutor, created_by: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutors'] });
      toast({ title: 'Tutor added!' });
    },
    onError: (error) => {
      toast({ title: 'Error adding tutor', description: error.message, variant: 'destructive' });
    },
  });

  const deleteTutor = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tutors').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutors'] });
      toast({ title: 'Tutor removed' });
    },
  });

  return { tutors, isLoading, addTutor, deleteTutor };
}
