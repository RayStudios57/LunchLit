import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, subDays, startOfMonth } from 'date-fns';

export interface WellnessLog {
  id: string;
  user_id: string;
  log_date: string;
  mood: string | null;
  water_count: number;
}

const todayStr = () => format(new Date(), 'yyyy-MM-dd');

export function useWellness() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['wellness_logs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const since = format(subDays(new Date(), 60), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('wellness_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('log_date', since)
        .order('log_date', { ascending: true });
      if (error) throw error;
      return (data || []) as WellnessLog[];
    },
    enabled: !!user,
  });

  const today = logs.find((l) => l.log_date === todayStr());

  const upsertToday = useMutation({
    mutationFn: async (patch: { mood?: string; water_count?: number }) => {
      if (!user) throw new Error('Not authenticated');
      const existing = logs.find((l) => l.log_date === todayStr());
      const payload = {
        user_id: user.id,
        log_date: todayStr(),
        mood: patch.mood ?? existing?.mood ?? null,
        water_count: patch.water_count ?? existing?.water_count ?? 0,
      };
      const { error } = await supabase
        .from('wellness_logs')
        .upsert(payload, { onConflict: 'user_id,log_date' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellness_logs', user?.id] });
    },
  });

  // Total water glasses this calendar month
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const waterThisMonth = logs
    .filter((l) => l.log_date >= monthStart)
    .reduce((sum, l) => sum + (l.water_count || 0), 0);

  // Last 7 days water
  const last7Water = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const ds = format(day, 'yyyy-MM-dd');
    const log = logs.find((l) => l.log_date === ds);
    return { day: format(day, 'EEE'), count: log?.water_count || 0 };
  });

  // Last 14 days mood (numeric scale for chart)
  const moodScore: Record<string, number> = {
    Great: 5, Good: 4, Okay: 3, Low: 2, Stressed: 1,
  };
  const last14Mood = Array.from({ length: 14 }, (_, i) => {
    const day = subDays(new Date(), 13 - i);
    const ds = format(day, 'yyyy-MM-dd');
    const log = logs.find((l) => l.log_date === ds);
    return { day: format(day, 'EEEEE'), score: log?.mood ? moodScore[log.mood] || 0 : 0, mood: log?.mood || null };
  });

  return {
    logs,
    today,
    isLoading,
    upsertToday,
    waterThisMonth,
    last7Water,
    last14Mood,
  };
}
