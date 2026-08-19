import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
}

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  exercises: Exercise[];
  created_at: string;
}

export function useGymRoutines() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Routines I own
  const { data: routines = [], isLoading } = useQuery({
    queryKey: ['gym_routines', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('gym_routines')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []).map((r) => ({ ...r, exercises: (r.exercises as unknown as Exercise[]) || [] })) as Routine[];
    },
    enabled: !!user,
  });

  // Routines shared with me
  const { data: sharedRoutines = [] } = useQuery({
    queryKey: ['shared_routines', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: shares, error } = await supabase
        .from('routine_shares')
        .select('routine_id, from_user_id')
        .eq('to_user_id', user.id);
      if (error) throw error;
      const ids = (shares || []).map((s) => s.routine_id);
      if (ids.length === 0) return [];
      const { data: rows } = await supabase.from('gym_routines').select('*').in('id', ids);
      const fromMap = new Map((shares || []).map((s) => [s.routine_id, s.from_user_id]));
      const fromIds = Array.from(new Set((shares || []).map((s) => s.from_user_id)));
      const { data: profs } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', fromIds);
      const nameMap = new Map((profs || []).map((p) => [p.user_id, p.full_name]));
      return (rows || []).map((r) => ({
        ...r,
        exercises: (r.exercises as unknown as Exercise[]) || [],
        sharedByName: nameMap.get(fromMap.get(r.id) || '') || 'A friend',
      })) as (Routine & { sharedByName: string })[];
    },
    enabled: !!user,
  });

  const createRoutine = useMutation({
    mutationFn: async (routine: { name: string; exercises: Exercise[] }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('gym_routines')
        .insert({ user_id: user.id, name: routine.name, exercises: routine.exercises as unknown as Record<string, unknown>[] })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gym_routines', user?.id] }),
  });

  const updateRoutine = useMutation({
    mutationFn: async ({ id, name, exercises }: { id: string; name: string; exercises: Exercise[] }) => {
      const { error } = await supabase
        .from('gym_routines')
        .update({ name, exercises: exercises as unknown as Record<string, unknown>[] })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gym_routines', user?.id] }),
  });

  const deleteRoutine = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gym_routines').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gym_routines', user?.id] }),
  });

  const shareRoutine = useMutation({
    mutationFn: async ({ routineId, toUserId }: { routineId: string; toUserId: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('routine_shares')
        .upsert({ routine_id: routineId, from_user_id: user.id, to_user_id: toUserId }, { onConflict: 'routine_id,to_user_id' });
      if (error) throw error;
    },
    onSuccess: () => toast({ title: 'Routine shared!', description: 'Your friend can now view it.' }),
    onError: (e: Error) => toast({ title: 'Could not share', description: e.message, variant: 'destructive' }),
  });

  return { routines, sharedRoutines, isLoading, createRoutine, updateRoutine, deleteRoutine, shareRoutine };
}
