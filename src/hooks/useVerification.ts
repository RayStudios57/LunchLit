import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BragSheetEntry } from '@/hooks/useBragSheet';

export interface PendingVerification extends BragSheetEntry {
  student_name?: string;
  student_grade?: string;
}

export function useVerification() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch entries pending verification for verifier's school
  const { data: pendingEntries = [], isLoading } = useQuery({
    queryKey: ['pending-verifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get entries that need verification
      const { data, error } = await supabase
        .from('brag_sheet_entries')
        .select(`
          *,
          profiles:user_id (
            full_name,
            grade_level
          )
        `)
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map((entry: any) => ({
        ...entry,
        student_name: entry.profiles?.full_name || 'Unknown Student',
        student_grade: entry.profiles?.grade_level || 'Unknown Grade',
      })) as PendingVerification[];
    },
    enabled: !!user,
  });

  const verifyEntry = useMutation({
    mutationFn: async ({ 
      entryId, 
      status, 
      notes 
    }: { 
      entryId: string; 
      status: 'verified' | 'rejected'; 
      notes?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('brag_sheet_entries')
        .update({
          verification_status: status,
          verified_by: user.id,
          verified_at: new Date().toISOString(),
          verification_notes: notes || null,
        })
        .eq('id', entryId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pending-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['brag-sheet'] });
      toast({ 
        title: variables.status === 'verified' ? 'Entry verified!' : 'Entry rejected',
        description: variables.status === 'verified' 
          ? 'The student will be notified of the verification.'
          : 'The student will be notified to review their entry.',
      });
    },
    onError: (error) => {
      toast({ 
        title: 'Error updating verification', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const requestVerification = useMutation({
    mutationFn: async (entryId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('brag_sheet_entries')
        .update({
          verification_status: 'pending',
        })
        .eq('id', entryId)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brag-sheet'] });
      toast({ 
        title: 'Verification requested!',
        description: 'A teacher or counselor at your school will review this entry.',
      });
    },
    onError: (error) => {
      toast({ 
        title: 'Error requesting verification', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  return { 
    pendingEntries, 
    isLoading, 
    verifyEntry, 
    requestVerification 
  };
}
