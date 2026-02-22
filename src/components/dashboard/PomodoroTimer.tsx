import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Timer, Play, Pause, RotateCcw, Coffee, BookOpen } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { toast } from 'sonner';

type TimerMode = 'work' | 'short_break' | 'long_break';

const DURATIONS: Record<TimerMode, number> = {
  work: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

const MODE_LABELS: Record<TimerMode, string> = {
  work: 'Focus',
  short_break: 'Short Break',
  long_break: 'Long Break',
};

export function PomodoroTimer() {
  const { tasks } = useTasks();
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(DURATIONS.work);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('none');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const incompleteTasks = tasks.filter(t => !t.is_completed);

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(DURATIONS[newMode]);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (mode === 'work') {
        const newSessions = sessions + 1;
        setSessions(newSessions);
        toast.success(`🎉 Focus session #${newSessions} complete!`);
        switchMode(newSessions % 4 === 0 ? 'long_break' : 'short_break');
      } else {
        toast('☕ Break over! Time to focus.', { icon: '📚' });
        switchMode('work');
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft, mode, sessions, switchMode]);

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(DURATIONS[mode]);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((DURATIONS[mode] - timeLeft) / DURATIONS[mode]) * 100;

  const selectedTask = incompleteTasks.find(t => t.id === selectedTaskId);

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Timer className="w-5 h-5 text-primary" />
          Pomodoro Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode Tabs */}
        <div className="flex gap-1 bg-secondary/50 rounded-lg p-1">
          {(Object.keys(MODE_LABELS) as TimerMode[]).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>

        {/* Timer Display */}
        <div className="relative flex items-center justify-center py-4">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" strokeWidth="6" className="stroke-secondary" />
            <circle
              cx="60" cy="60" r="54" fill="none" strokeWidth="6"
              className="stroke-primary transition-all duration-1000"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            {mode === 'work' ? <BookOpen className="w-5 h-5 text-primary mb-1" /> : <Coffee className="w-5 h-5 text-primary mb-1" />}
            <span className="text-3xl font-mono font-bold tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="icon" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button size="lg" onClick={() => setIsRunning(!isRunning)} className="gap-2 px-6">
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRunning ? 'Pause' : 'Start'}
          </Button>
        </div>

        {/* Task Selector */}
        {incompleteTasks.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium">Working on:</p>
            <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select a task..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific task</SelectItem>
                {incompleteTasks.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Session Counter */}
        <div className="text-center text-xs text-muted-foreground">
          {sessions} focus session{sessions !== 1 ? 's' : ''} completed today
        </div>
      </CardContent>
    </Card>
  );
}
