import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const INSIGHT_QUESTIONS = [
  {
    key: 'adjectives',
    question: 'What are three adjectives you would use to describe yourself and why?',
  },
  {
    key: 'major_goals',
    question: 'What is your intended college major? What are your career goals?',
  },
  {
    key: 'recommender_reason',
    question: 'Why have you chosen this teacher to write a letter of recommendation for you?',
  },
  {
    key: 'favorite_lesson',
    question: 'What is a lesson or unit in the class you enjoyed? Why?',
  },
  {
    key: 'proudest_moment',
    question: 'Describe a time in the class when you felt most proud. Remember times when you displayed leadership, intellectual vitality, discipline, maturity, humility, integrity, or initiative.',
  },
  {
    key: 'unknown_fact',
    question: "What is something your teacher likely doesn't know about you?",
  },
  {
    key: 'extracurricular_significance',
    question: 'Describe your most significant extracurricular involvements. Elaborate on your participation in them and why they are important to you.',
  },
  {
    key: 'unique_qualities',
    question: 'What makes you stand out from other students? What makes you unique? What are your greatest strengths?',
  },
  {
    key: 'application_theme',
    question: 'What is the overarching theme of your application? Do you have a spike? If so, what is it?',
  },
  {
    key: 'obstacles',
    question: 'Describe any major obstacles you have faced and how you overcame them. Think of academic, personal, family, or financial struggles.',
  },
  {
    key: 'transcript_reflection',
    question: 'Do you believe your transcript truly reflects your academic abilities or potential? Elaborate.',
  },
  {
    key: 'additional_info',
    question: 'Please list any additional information that you would like your recommender to know. Share anything that will help you stand out (extenuating circumstances, talents, hooks, etc.):',
  },
];

export interface BragSheetInsight {
  id: string;
  user_id: string;
  question_key: string;
  answer: string | null;
  created_at: string;
  updated_at: string;
}

export function useBragSheetInsights() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: insights = [], isLoading } = useQuery({
    queryKey: ['brag-sheet-insights', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('brag_sheet_insights')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as BragSheetInsight[];
    },
    enabled: !!user,
  });

  const saveInsight = useMutation({
    mutationFn: async ({ question_key, answer }: { question_key: string; answer: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('brag_sheet_insights')
        .upsert(
          { 
            user_id: user.id, 
            question_key, 
            answer,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id,question_key' }
        )
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brag-sheet-insights'] });
    },
    onError: (error) => {
      toast({ title: 'Error saving insight', description: error.message, variant: 'destructive' });
    },
  });

  const getInsightAnswer = (key: string) => {
    return insights.find(i => i.question_key === key)?.answer || '';
  };

  return {
    insights,
    isLoading,
    saveInsight,
    getInsightAnswer,
  };
}
