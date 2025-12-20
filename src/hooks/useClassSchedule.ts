import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ClassSchedule {
  id: string;
  user_id: string;
  class_name: string;
  teacher_name: string | null;
  room_number: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export function useClassSchedule() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['class_schedules', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('class_schedules')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data as ClassSchedule[];
    },
    enabled: !!user,
  });

  const addClass = useMutation({
    mutationFn: async (classData: Omit<ClassSchedule, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('class_schedules')
        .insert({ ...classData, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class_schedules'] });
      toast({ title: 'Class added!' });
    },
    onError: (error) => {
      toast({ title: 'Error adding class', description: error.message, variant: 'destructive' });
    },
  });

  const updateClass = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ClassSchedule> & { id: string }) => {
      const { data, error } = await supabase
        .from('class_schedules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class_schedules'] });
    },
    onError: (error) => {
      toast({ title: 'Error updating class', description: error.message, variant: 'destructive' });
    },
  });

  const deleteClass = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('class_schedules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class_schedules'] });
      toast({ title: 'Class deleted' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting class', description: error.message, variant: 'destructive' });
    },
  });

  return { classes, isLoading, addClass, updateClass, deleteClass };
}
