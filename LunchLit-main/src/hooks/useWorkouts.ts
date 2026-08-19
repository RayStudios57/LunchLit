import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, subDays, startOfWeek } from 'date-fns';

export interface WorkoutLog {
  id: string;
  user_id: string;
  log_date: string;
}

const todayStr = () => format(new Date(), 'yyyy-MM-dd');

export function useWorkouts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['workout_logs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const since = format(subDays(new Date(), 120), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('log_date', since)
        .order('log_date', { ascending: true });
      if (error) throw error;
      return (data || []) as WorkoutLog[];
    },
    enabled: !!user,
  });

  const logToday = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('workout_logs')
        .upsert({ user_id: user.id, log_date: todayStr() }, { onConflict: 'user_id,log_date' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout_logs', user?.id] });
    },
  });

  const loggedToday = logs.some((l) => l.log_date === todayStr());

  // Workouts in the current week (Mon start)
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const workoutsThisWeek = logs.filter((l) => l.log_date >= weekStart).length;

  // Daily streak: consecutive days with a workout ending today/yesterday
  const dateSet = new Set(logs.map((l) => l.log_date));
  let dayStreak = 0;
  for (let i = 0; i < 120; i++) {
    const ds = format(subDays(new Date(), i), 'yyyy-MM-dd');
    if (dateSet.has(ds)) dayStreak++;
    else if (i > 0) break;
  }

  // Weekly streak: count consecutive weeks (incl current) with >=1 workout
  let weekStreak = 0;
  for (let w = 0; w < 52; w++) {
    const ws = startOfWeek(subDays(new Date(), w * 7), { weekStartsOn: 1 });
    const we = subDays(startOfWeek(subDays(new Date(), (w - 1) * 7), { weekStartsOn: 1 }), 1);
    const wsStr = format(ws, 'yyyy-MM-dd');
    const weStr = format(we, 'yyyy-MM-dd');
    const has = logs.some((l) => l.log_date >= wsStr && l.log_date <= weStr);
    if (has) weekStreak++;
    else if (w > 0) break;
  }

  return { logs, isLoading, logToday, loggedToday, workoutsThisWeek, dayStreak, weekStreak };
}
