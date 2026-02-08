import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { usePresentationMode } from '@/contexts/PresentationModeContext';
import { dummyMealSchedules } from '@/data/presentationDummyData';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth,
  endOfMonth,
  addDays, 
  isWeekend, 
  parseISO,
  eachDayOfInterval,
} from 'date-fns';

interface MenuItem {
  name: string;
  description?: string;
  calories?: number;
  dietary_tags?: string[];
}

interface MealSchedule {
  id: string;
  school_id: string;
  meal_date: string;
  meal_type: string;
  menu_items: MenuItem[];
  created_at: string;
  updated_at: string;
}

interface DayMenu {
  date: string;
  dayName: string;
  items: {
    id: string;
    name: string;
    description: string;
    dietary: string[];
    mealType: string;
    calories?: number;
  }[];
}

export function useMealSchedules(monthDate?: Date) {
  const { profile } = useProfile();
  const { isPresentationMode } = usePresentationMode();

  // Weekly menu query
  const { data: mealSchedules = [], isLoading } = useQuery({
    queryKey: ['meal-schedules', profile?.school_id],
    queryFn: async () => {
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
      
      // If it's weekend, get next week
      const queryStart = isWeekend(today) 
        ? format(addDays(weekEnd, 1), 'yyyy-MM-dd')
        : format(weekStart, 'yyyy-MM-dd');
      const queryEnd = isWeekend(today)
        ? format(addDays(weekEnd, 7), 'yyyy-MM-dd')
        : format(weekEnd, 'yyyy-MM-dd');

      let query = supabase
        .from('meal_schedules')
        .select('*')
        .gte('meal_date', queryStart)
        .lte('meal_date', queryEnd)
        .order('meal_date', { ascending: true });

      // Filter by school if user has one
      if (profile?.school_id) {
        query = query.eq('school_id', profile.school_id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        menu_items: (item.menu_items as unknown as MenuItem[]) || [],
      })) as MealSchedule[];
    },
    enabled: true,
  });

  // Monthly menu query
  const currentMonthDate = monthDate || new Date();
  const { data: monthlyMealSchedules = [], isLoading: isLoadingMonthly } = useQuery({
    queryKey: ['meal-schedules-monthly', profile?.school_id, format(currentMonthDate, 'yyyy-MM')],
    queryFn: async () => {
      const monthStart = startOfMonth(currentMonthDate);
      const monthEnd = endOfMonth(currentMonthDate);

      let query = supabase
        .from('meal_schedules')
        .select('*')
        .gte('meal_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('meal_date', format(monthEnd, 'yyyy-MM-dd'))
        .order('meal_date', { ascending: true });

      if (profile?.school_id) {
        query = query.eq('school_id', profile.school_id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        menu_items: (item.menu_items as unknown as MenuItem[]) || [],
      })) as MealSchedule[];
    },
    enabled: true,
  });

  const activeMealSchedules = isPresentationMode ? (dummyMealSchedules as MealSchedule[]) : mealSchedules;
  const activeMonthlyMealSchedules = isPresentationMode ? (dummyMealSchedules as MealSchedule[]) : monthlyMealSchedules;

  // Transform meal schedules into the format expected by MenuView
  const weeklyMenu: DayMenu[] = (() => {
    const today = new Date();
    const weekStart = isWeekend(today) 
      ? addDays(endOfWeek(today, { weekStartsOn: 1 }), 1)
      : startOfWeek(today, { weekStartsOn: 1 });
    
    const days: DayMenu[] = [];
    
    for (let i = 0; i < 5; i++) { // Monday to Friday
      const date = addDays(weekStart, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const daySchedules = activeMealSchedules.filter(
        schedule => schedule.meal_date === dateStr
      );

      const items = daySchedules.flatMap(schedule => {
        const menuItems = schedule.menu_items as MenuItem[];
        return menuItems.map((item, idx) => ({
          id: `${schedule.id}-${idx}`,
          name: item.name,
          description: item.description || '',
          dietary: item.dietary_tags || [],
          mealType: schedule.meal_type,
          calories: item.calories,
        }));
      });

      days.push({
        date: dateStr,
        dayName: format(date, 'EEEE'),
        items,
      });
    }
    
    return days;
  })();

  // Monthly menu data
  const monthlyMenu: DayMenu[] = (() => {
    const monthStart = startOfMonth(currentMonthDate);
    const monthEnd = endOfMonth(currentMonthDate);
    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    return allDays.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const daySchedules = activeMonthlyMealSchedules.filter(
        schedule => schedule.meal_date === dateStr
      );

      const items = daySchedules.flatMap(schedule => {
        const menuItems = schedule.menu_items as MenuItem[];
        return menuItems.map((item, idx) => ({
          id: `${schedule.id}-${idx}`,
          name: item.name,
          description: item.description || '',
          dietary: item.dietary_tags || [],
          mealType: schedule.meal_type,
          calories: item.calories,
        }));
      });

      return {
        date: dateStr,
        dayName: format(date, 'EEEE'),
        items,
      };
    });
  })();

  const getTodayMenu = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return weeklyMenu.find(day => day.date === today);
  };

  return {
    mealSchedules: activeMealSchedules,
    weeklyMenu,
    monthlyMenu,
    getTodayMenu,
    isLoading: isPresentationMode ? false : isLoading,
    isLoadingMonthly: isPresentationMode ? false : isLoadingMonthly,
    hasMenuData: activeMealSchedules.length > 0,
    hasMonthlyData: activeMonthlyMealSchedules.length > 0,
  };
}
