import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeartPulse, Droplet, Flame, Smile } from 'lucide-react';
import { useWellness } from '@/hooks/useWellness';
import { useWorkouts } from '@/hooks/useWorkouts';

const MOOD_EMOJI: Record<number, string> = { 5: '😄', 4: '🙂', 3: '😐', 2: '😟', 1: '😩', 0: '·' };

export function WellnessStats() {
  const { last7Water, last14Mood, waterThisMonth } = useWellness();
  const { weekStreak, dayStreak, workoutsThisWeek } = useWorkouts();

  const maxWater = Math.max(...last7Water.map((d) => d.count), 1);

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-primary" />
          Wellness Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Top stat cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl bg-sky-500/10">
            <Droplet className="w-5 h-5 text-sky-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-sky-500">{waterThisMonth}</p>
            <p className="text-[10px] text-muted-foreground">Glasses / month</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-orange-500/10">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-orange-500">{weekStreak}</p>
            <p className="text-[10px] text-muted-foreground">Week streak</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-emerald-500/10">
            <HeartPulse className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-emerald-500">{workoutsThisWeek}</p>
            <p className="text-[10px] text-muted-foreground">Workouts / week</p>
          </div>
        </div>

        {/* Mood trend */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Smile className="w-3.5 h-3.5" /> Mood — last 14 days
          </p>
          <div className="flex items-end gap-1 h-16">
            {last14Mood.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
                <span className="text-[10px] leading-none">{MOOD_EMOJI[d.score]}</span>
                <div className="w-full flex items-end justify-center flex-1">
                  <div
                    className={`w-full max-w-[14px] rounded-t-sm transition-all ${d.score > 0 ? 'bg-emerald-500/70' : 'bg-secondary'}`}
                    style={{ height: `${d.score > 0 ? (d.score / 5) * 100 : 8}%` }}
                  />
                </div>
                <span className="text-[8px] text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hydration last 7 days */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Droplet className="w-3.5 h-3.5" /> Hydration — last 7 days
          </p>
          <div className="flex items-end gap-1.5 h-16">
            {last7Water.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: '40px' }}>
                  <div
                    className={`w-full max-w-[28px] rounded-t-md transition-all ${d.count > 0 ? 'bg-sky-500' : 'bg-secondary'}`}
                    style={{ height: `${Math.max(d.count > 0 ? (d.count / maxWater) * 100 : 10, 10)}%` }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {dayStreak > 0 && (
          <p className="text-xs text-center text-muted-foreground">
            {dayStreak >= 7 ? '🔥 ' : ''}{dayStreak}-day workout streak! {weekStreak >= 1 ? `${weekStreak} week(s) running.` : ''}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
