import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Calendar, Clock, PartyPopper } from 'lucide-react';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';

function getSchoolYearEnd(): Date {
  const now = new Date();
  const year = now.getMonth() >= 7 ? now.getFullYear() + 1 : now.getFullYear();
  // Approximate last day of school: June 6
  return new Date(year, 5, 6, 15, 0, 0);
}

export function GraduationCountdown() {
  const [now, setNow] = useState(new Date());
  const endDate = getSchoolYearEnd();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalDays = differenceInDays(endDate, now);
  const totalHours = differenceInHours(endDate, now) % 24;
  const totalMinutes = differenceInMinutes(endDate, now) % 60;
  const totalSeconds = differenceInSeconds(endDate, now) % 60;

  const isPast = totalDays < 0;

  if (isPast) {
    return (
      <Card className="card-elevated border-primary/30 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10">
        <CardContent className="py-6 flex flex-col items-center text-center gap-2">
          <PartyPopper className="w-10 h-10 text-primary animate-bounce" />
          <p className="font-display text-xl font-bold text-primary">School's Out! 🎉</p>
          <p className="text-sm text-muted-foreground">Enjoy your summer break!</p>
        </CardContent>
      </Card>
    );
  }

  const timeBlocks = [
    { label: 'Days', value: totalDays },
    { label: 'Hours', value: totalHours },
    { label: 'Min', value: totalMinutes },
    { label: 'Sec', value: totalSeconds },
  ];

  const progress = Math.max(0, Math.min(100, ((180 - totalDays) / 180) * 100));

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          End-of-Year Countdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {timeBlocks.map((block) => (
            <div
              key={block.label}
              className="flex flex-col items-center p-3 rounded-xl bg-secondary/50"
            >
              <span className="text-2xl sm:text-3xl font-display font-bold text-primary tabular-nums">
                {Math.max(0, block.value)}
              </span>
              <span className="text-xs text-muted-foreground mt-1">{block.label}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              School year progress
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
          <Clock className="w-3 h-3" />
          Until June 6, {endDate.getFullYear()} · Last day of school
        </p>
      </CardContent>
    </Card>
  );
}
