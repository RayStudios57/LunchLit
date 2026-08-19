import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, CheckCircle2, Flame, TrendingUp } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useMemo } from 'react';
import { isThisWeek, parseISO, subDays, format } from 'date-fns';

export function StudyStats() {
  const { tasks } = useTasks();

  const stats = useMemo(() => {
    const completedTasks = tasks.filter(t => t.is_completed);
    const completedThisWeek = completedTasks.filter(t => {
      try {
        return isThisWeek(parseISO(t.updated_at), { weekStartsOn: 1 });
      } catch { return false; }
    });

    // Calculate streak - consecutive days with at least 1 completed task
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const day = subDays(today, i);
      const dayStr = format(day, 'yyyy-MM-dd');
      const hasCompleted = completedTasks.some(t => {
        try {
          return format(parseISO(t.updated_at), 'yyyy-MM-dd') === dayStr;
        } catch { return false; }
      });
      if (hasCompleted) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Weekly productivity (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const day = subDays(today, 6 - i);
      const dayStr = format(day, 'yyyy-MM-dd');
      const count = completedTasks.filter(t => {
        try {
          return format(parseISO(t.updated_at), 'yyyy-MM-dd') === dayStr;
        } catch { return false; }
      }).length;
      return { day: format(day, 'EEE'), count };
    });

    const maxCount = Math.max(...last7Days.map(d => d.count), 1);

    return {
      totalCompleted: completedTasks.length,
      completedThisWeek: completedThisWeek.length,
      streak,
      last7Days,
      maxCount,
      totalTasks: tasks.length,
    };
  }, [tasks]);

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Study Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl bg-primary/10">
            <CheckCircle2 className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-primary">{stats.completedThisWeek}</p>
            <p className="text-[10px] text-muted-foreground">This Week</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-orange-500/10">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-orange-500">{stats.streak}</p>
            <p className="text-[10px] text-muted-foreground">Day Streak</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-green-500/10">
            <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-500">{stats.totalCompleted}</p>
            <p className="text-[10px] text-muted-foreground">All Time</p>
          </div>
        </div>

        {/* Mini Bar Chart - Last 7 Days */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Last 7 Days</p>
          <div className="flex items-end gap-1.5 h-16">
            {stats.last7Days.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: '40px' }}>
                  <div
                    className={`w-full max-w-[28px] rounded-t-md transition-all ${
                      day.count > 0 ? 'bg-primary' : 'bg-secondary'
                    }`}
                    style={{ height: `${Math.max(day.count > 0 ? (day.count / stats.maxCount) * 100 : 10, 10)}%` }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Streak Message */}
        {stats.streak > 0 && (
          <p className="text-xs text-center text-muted-foreground">
            {stats.streak >= 7 ? '🔥 ' : ''}
            {stats.streak} day streak! {stats.streak >= 7 ? 'You\'re on fire!' : 'Keep it going!'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
