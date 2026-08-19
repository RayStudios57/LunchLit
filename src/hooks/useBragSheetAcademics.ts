import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { usePresentationMode } from '@/contexts/PresentationModeContext';
import { dummyAcademics } from '@/data/presentationDummyData';
import type { Json } from '@/integrations/supabase/types';

interface TestScore {
  type: string; // SAT, ACT, AP, IB
  subject?: string;
  score: string;
  date?: string;
}

interface Course {
  name: string;
  teacher: string;
  grade?: string;
  year?: string;
}

export interface BragSheetAcademics {
  id: string;
  user_id: string;
  gpa_weighted: number | null;
  gpa_unweighted: number | null;
  test_scores: TestScore[];
  courses: Course[];
  colleges_applying: string[] | null;
  created_at: string;
  updated_at: string;
}

export function useBragSheetAcademics() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isPresentationMode } = usePresentationMode();

  const { data: academics, isLoading } = useQuery({
    queryKey: ['brag-sheet-academics', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('brag_sheet_academics')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        return {
          ...data,
          test_scores: (data.test_scores as unknown as TestScore[]) || [],
          courses: (data.courses as unknown as Course[]) || [],
        } as BragSheetAcademics;
      }
      return null;
    },
    enabled: !!user,
  });

  const saveAcademics = useMutation({
    mutationFn: async (input: { gpa_weighted?: number | null; gpa_unweighted?: number | null; test_scores?: TestScore[]; courses?: Course[]; colleges_applying?: string[] | null }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data: existing } = await supabase
        .from('brag_sheet_academics')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { data: result, error } = await supabase
          .from('brag_sheet_academics')
          .update({
            gpa_weighted: input.gpa_weighted,
            gpa_unweighted: input.gpa_unweighted,
            test_scores: input.test_scores as unknown as Json,
            courses: input.courses as unknown as Json,
            colleges_applying: input.colleges_applying,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .select()
          .single();
        if (error) throw error;
        return result;
      } else {
        const { data: result, error } = await supabase
          .from('brag_sheet_academics')
          .insert({
            user_id: user.id,
            gpa_weighted: input.gpa_weighted,
            gpa_unweighted: input.gpa_unweighted,
            test_scores: input.test_scores as unknown as Json,
            courses: input.courses as unknown as Json,
            colleges_applying: input.colleges_applying,
          })
          .select()
          .single();
        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brag-sheet-academics'] });
      toast({ title: 'Academic info saved!' });
    },
    onError: (error) => {
      toast({ title: 'Error saving academics', description: error.message, variant: 'destructive' });
    },
  });

  return {
    academics: isPresentationMode ? (dummyAcademics as unknown as BragSheetAcademics) : academics,
    isLoading: isPresentationMode ? false : isLoading,
    saveAcademics,
  };
}
