import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface School {
  id: string;
  name: string;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface MealSchedule {
  id: string;
  school_id: string;
  meal_date: string;
  meal_type: string;
  menu_items: {
    name: string;
    description?: string;
    dietary?: string[];
    image_url?: string;
  }[];
  created_at: string;
  updated_at: string;
}

export function useSchools() {
  const { data: schools = [], isLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as School[];
    },
  });

  return { schools, isLoading };
}

export function useMealSchedule(schoolId: string | null, date?: Date) {
  const targetDate = date || new Date();
  const dateStr = targetDate.toISOString().split('T')[0];

  const { data: meals = [], isLoading } = useQuery({
    queryKey: ['meal_schedules', schoolId, dateStr],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from('meal_schedules')
        .select('*')
        .eq('school_id', schoolId)
        .eq('meal_date', dateStr);
      
      if (error) throw error;
      return data as MealSchedule[];
    },
    enabled: !!schoolId,
  });

  return { meals, isLoading };
}
