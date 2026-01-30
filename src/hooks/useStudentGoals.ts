import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface StudentGoal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  goal_type: 'college' | 'career' | 'program' | 'personal';
  target_date: string | null;
  status: 'in_progress' | 'completed' | 'paused';
  priority: 'low' | 'medium' | 'high';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type StudentGoalInsert = Omit<StudentGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export function useStudentGoals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['student-goals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('student_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as StudentGoal[];
    },
    enabled: !!user,
  });

  const addGoal = useMutation({
    mutationFn: async (goal: StudentGoalInsert) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('student_goals')
        .insert({ ...goal, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-goals'] });
      toast({ title: 'Goal added!' });
    },
    onError: (error) => {
      toast({ title: 'Error adding goal', description: error.message, variant: 'destructive' });
    },
  });

  const updateGoal = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<StudentGoal> & { id: string }) => {
      const { data, error } = await supabase
        .from('student_goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-goals'] });
      toast({ title: 'Goal updated!' });
    },
    onError: (error) => {
      toast({ title: 'Error updating goal', description: error.message, variant: 'destructive' });
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('student_goals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-goals'] });
      toast({ title: 'Goal removed' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting goal', description: error.message, variant: 'destructive' });
    },
  });

  const goalsByType = goals.reduce((acc, goal) => {
    if (!acc[goal.goal_type]) acc[goal.goal_type] = [];
    acc[goal.goal_type].push(goal);
    return acc;
  }, {} as Record<string, StudentGoal[]>);

  const stats = {
    total: goals.length,
    completed: goals.filter(g => g.status === 'completed').length,
    inProgress: goals.filter(g => g.status === 'in_progress').length,
  };

  return { goals, goalsByType, stats, isLoading, addGoal, updateGoal, deleteGoal };
}
