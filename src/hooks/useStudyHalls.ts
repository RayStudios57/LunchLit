import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface StudyHall {
  id: string;
  school_id: string | null;
  name: string;
  location: string;
  teacher: string | null;
  capacity: number;
  current_occupancy: number;
  is_available: boolean;
  periods: string[];
  created_at: string;
  updated_at: string;
}

export function useStudyHalls() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: studyHalls = [], isLoading } = useQuery({
    queryKey: ['study_halls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_halls')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as StudyHall[];
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('study_halls_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_halls'
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['study_halls'] });
          
          if (payload.eventType === 'UPDATE') {
            const newData = payload.new as StudyHall;
            const oldData = payload.old as StudyHall;
            
            // Notify if a study hall just became available
            if (!oldData.is_available && newData.is_available) {
              toast({
                title: `${newData.name} is now available!`,
                description: `${newData.current_occupancy}/${newData.capacity} spots filled`,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);

  const updateOccupancy = useMutation({
    mutationFn: async ({ id, occupancy }: { id: string; occupancy: number }) => {
      const hall = studyHalls.find(h => h.id === id);
      const isAvailable = hall ? occupancy < hall.capacity : true;
      
      const { error } = await supabase
        .from('study_halls')
        .update({ 
          current_occupancy: occupancy,
          is_available: isAvailable 
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study_halls'] });
    },
    onError: (error) => {
      toast({ 
        title: 'Error updating occupancy', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const createStudyHall = useMutation({
    mutationFn: async (hall: Omit<StudyHall, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('study_halls')
        .insert(hall);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study_halls'] });
      toast({ title: 'Study hall created!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error creating study hall', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const deleteStudyHall = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('study_halls')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study_halls'] });
      toast({ title: 'Study hall deleted' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error deleting study hall', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  return {
    studyHalls,
    isLoading,
    updateOccupancy,
    createStudyHall,
    deleteStudyHall,
  };
}
