import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface TargetSchool {
  id: string;
  user_id: string;
  school_name: string;
  location: string | null;
  application_deadline: string | null;
  admission_type: 'early_decision' | 'early_action' | 'regular';
  status: 'researching' | 'applying' | 'applied' | 'accepted' | 'rejected' | 'waitlisted' | 'enrolled';
  notes: string | null;
  is_reach: boolean;
  is_safety: boolean;
  is_match: boolean;
  created_at: string;
  updated_at: string;
}

export type TargetSchoolInsert = Omit<TargetSchool, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export function useTargetSchools() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: schools = [], isLoading } = useQuery({
    queryKey: ['target-schools', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('target_schools')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TargetSchool[];
    },
    enabled: !!user,
  });

  const addSchool = useMutation({
    mutationFn: async (school: TargetSchoolInsert) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('target_schools')
        .insert({ ...school, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['target-schools'] });
      toast({ title: 'School added to your list!' });
    },
    onError: (error) => {
      toast({ title: 'Error adding school', description: error.message, variant: 'destructive' });
    },
  });

  const updateSchool = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TargetSchool> & { id: string }) => {
      const { data, error } = await supabase
        .from('target_schools')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['target-schools'] });
      toast({ title: 'School updated!' });
    },
    onError: (error) => {
      toast({ title: 'Error updating school', description: error.message, variant: 'destructive' });
    },
  });

  const deleteSchool = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('target_schools').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['target-schools'] });
      toast({ title: 'School removed from your list' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting school', description: error.message, variant: 'destructive' });
    },
  });

  const stats = {
    total: schools.length,
    reaches: schools.filter(s => s.is_reach).length,
    matches: schools.filter(s => s.is_match).length,
    safeties: schools.filter(s => s.is_safety).length,
    accepted: schools.filter(s => s.status === 'accepted').length,
  };

  return { schools, stats, isLoading, addSchool, updateSchool, deleteSchool };
}
