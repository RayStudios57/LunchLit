import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';

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

export function useSchoolStudyHalls() {
  const { profile } = useProfile();

  const { data: studyHalls = [], isLoading } = useQuery({
    queryKey: ['school_study_halls', profile?.school_id],
    queryFn: async () => {
      if (!profile?.school_id) return [];
      
      const { data, error } = await supabase
        .from('study_halls')
        .select('*')
        .eq('school_id', profile.school_id)
        .order('name');
      
      if (error) throw error;
      return data as StudyHall[];
    },
    enabled: !!profile?.school_id,
  });

  return {
    studyHalls,
    isLoading,
    hasStudyHalls: studyHalls.length > 0,
    schoolId: profile?.school_id,
  };
}
