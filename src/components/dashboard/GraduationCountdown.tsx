import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Calendar, Clock, PartyPopper, Settings } from 'lucide-react';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, parseISO } from 'date-fns';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

function getDefaultSchoolYearEnd(): Date {
  const now = new Date();
  const year = now.getMonth() >= 7 ? now.getFullYear() + 1 : now.getFullYear();
  return new Date(year, 5, 6, 15, 0, 0);
}

// School year start: ~September 1
function getSchoolYearStart(): Date {
  const now = new Date();
  const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return new Date(year, 8, 1, 8, 0, 0);
}

export function GraduationCountdown() {
  const [now, setNow] = useState(new Date());
  const { preferences, updatePreference } = useUserPreferences();
  const { theme, setTheme } = useTheme();
  const [customDate, setCustomDate] = useState('');
  
  const endDate = preferences?.school_end_date 
    ? new Date(parseISO(preferences.school_end_date).setHours(15, 0, 0)) 
    : getDefaultSchoolYearEnd();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalDays = differenceInDays(endDate, now);
  const totalHours = differenceInHours(endDate, now) % 24;
  const totalMinutes = differenceInMinutes(endDate, now) % 60;
  const totalSeconds = differenceInSeconds(endDate, now) % 60;

  const isPast = totalDays < 0;

  // Auto-activate summer theme when countdown reaches zero
  useEffect(() => {
    if (isPast && theme !== 'summer') {
      const autoSwitched = localStorage.getItem('lunchlit_summer_auto_switched');
      if (!autoSwitched) {
        setTheme('summer');
        localStorage.setItem('lunchlit_summer_auto_switched', 'true');
      }
    }
    // Reset flag when school is back in session
    if (!isPast) {
      localStorage.removeItem('lunchlit_summer_auto_switched');
    }
  }, [isPast, theme]);

  // Accurate progress: from school year start to end
  const schoolStart = getSchoolYearStart();
  const totalSchoolDays = differenceInDays(endDate, schoolStart);
  const daysElapsed = differenceInDays(now, schoolStart);
  const progress = Math.max(0, Math.min(100, (daysElapsed / totalSchoolDays) * 100));

  const handleSetDate = () => {
    if (customDate) {
      updatePreference.mutate({ school_end_date: customDate });
    }
  };

  const handleResetDate = () => {
    updatePreference.mutate({ school_end_date: null });
  };

  const endDateFormatted = endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

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

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            End-of-Year Countdown
          </CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-3" align="end">
              <p className="text-sm font-medium">Set your last day of school</p>
              <Input
                type="date"
                value={customDate || preferences?.school_end_date || ''}
                onChange={e => setCustomDate(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={handleSetDate}>Save</Button>
                <Button size="sm" variant="outline" onClick={handleResetDate}>Reset</Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
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
          Until {endDateFormatted} · Last day of school
        </p>
      </CardContent>
    </Card>
  );
}
