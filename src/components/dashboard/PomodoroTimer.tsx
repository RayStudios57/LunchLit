import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Timer, Play, Pause, RotateCcw, Coffee, BookOpen, Music, Volume2 } from 'lucide-react';
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

// Curated YouTube lofi/ambient tracks & playlists — each ID actually matches its label.
// `list` uses a playlist ID for continuous varied playback; `id` plays a single long track.
type Track =
  | { label: string; id: string; list?: undefined }
  | { label: string; list: string; id?: undefined };

const LOFI_TRACKS: Track[] = [
  { label: '☕ Lofi Chill (Lofi Girl radio)', list: 'PLOzDu-MXXLliO9fBNZOQTBDddoA3FzZUo' },
  { label: '🌧️ Rain & Jazz', id: 'DWcJFNfaw9c' },
  { label: '🌿 Nature Ambient (forest)', id: 'xNN7iTA57jM' },
  { label: '🎹 Piano Focus', id: 'lFcSrYw-ARY' },
  { label: '🌊 Deep Focus (concentration)', id: 'IEzuR2eCLd0' },
  { label: '🌙 Midnight Lofi', id: '28KRPhVzCus' },
  { label: '📖 Study Beats', id: '5qap5aO4i9A' },
  { label: '🍃 Zen Garden', id: 'q76bMs-NwRk' },
  { label: '✨ Ambient Space', id: 'tNkZsRW7h2c' },
  { label: '🎶 Chillhop Cafe', list: 'PLTy2sUyRuu1MFELIRuraAyeYPQx5MTvBB' },
];

// Load YT IFrame API once, globally.
let ytApiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as any).YT?.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
    (window as any).onYouTubeIframeAPIReady = () => resolve();
  });
  return ytApiPromise;
}

export function PomodoroTimer() {
  const { tasks } = useTasks();
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(DURATIONS.work);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('none');
  const [lofiEnabled, setLofiEnabled] = useState(false);
  const [trackKey, setTrackKey] = useState(LOFI_TRACKS[0].label);
  const [volume, setVolume] = useState(25);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playerRef = useRef<any>(null);
  const playerContainerId = 'pomodoro-yt-player';

  const incompleteTasks = tasks.filter((t) => !t.is_completed);
  const currentTrack = LOFI_TRACKS.find((t) => t.label === trackKey) ?? LOFI_TRACKS[0];

  // Initialize / update the hidden YouTube player.
  useEffect(() => {
    let cancelled = false;
    if (!lofiEnabled) {
      if (playerRef.current?.pauseVideo) playerRef.current.pauseVideo();
      return;
    }

    loadYouTubeApi().then(() => {
      if (cancelled) return;
      const YT = (window as any).YT;
      if (!YT?.Player) return;

      const loadOpts = currentTrack.list
        ? { listType: 'playlist', list: currentTrack.list }
        : { videoId: currentTrack.id };

      if (!playerRef.current) {
        playerRef.current = new YT.Player(playerContainerId, {
          height: '0',
          width: '0',
          playerVars: { autoplay: 1, controls: 0, disablekb: 1, playsinline: 1, ...loadOpts },
          events: {
            onReady: (e: any) => {
              e.target.setVolume(volume);
              if (isRunning && mode === 'work') e.target.playVideo();
            },
          },
        });
      } else {
        if (currentTrack.list) {
          playerRef.current.loadPlaylist({ list: currentTrack.list, listType: 'playlist' });
        } else {
          playerRef.current.loadVideoById(currentTrack.id);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [lofiEnabled, trackKey]);

  // Play/pause based on timer state.
  useEffect(() => {
    const p = playerRef.current;
    if (!p?.playVideo) return;
    if (lofiEnabled && isRunning && mode === 'work') p.playVideo();
    else p.pauseVideo();
  }, [lofiEnabled, isRunning, mode]);

  // Volume changes.
  useEffect(() => {
    if (playerRef.current?.setVolume) playerRef.current.setVolume(volume);
  }, [volume]);

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(DURATIONS[newMode]);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
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
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, mode, sessions, switchMode]);

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(DURATIONS[mode]);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((DURATIONS[mode] - timeLeft) / DURATIONS[mode]) * 100;

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Timer className="w-5 h-5 text-primary" />
          Pomodoro Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-1 bg-secondary/50 rounded-lg p-1">
          {(Object.keys(MODE_LABELS) as TimerMode[]).map((m) => (
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

        <div className="relative flex items-center justify-center py-4">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" strokeWidth="6" className="stroke-secondary" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              strokeWidth="6"
              className="stroke-primary transition-all duration-1000"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            {mode === 'work' ? (
              <BookOpen className="w-5 h-5 text-primary mb-1" />
            ) : (
              <Coffee className="w-5 h-5 text-primary mb-1" />
            )}
            <span className="text-3xl font-mono font-bold tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="icon" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button size="lg" onClick={() => setIsRunning(!isRunning)} className="gap-2 px-6">
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRunning ? 'Pause' : 'Start'}
          </Button>
        </div>

        <div className="space-y-3 p-3 rounded-lg bg-secondary/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-primary" />
              <Label className="text-sm cursor-pointer">Lofi Music</Label>
            </div>
            <Switch checked={lofiEnabled} onCheckedChange={setLofiEnabled} />
          </div>

          {lofiEnabled && (
            <>
              <Select value={trackKey} onValueChange={setTrackKey}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOFI_TRACKS.map((t) => (
                    <SelectItem key={t.label} value={t.label}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                <Slider value={[volume]} onValueChange={([v]) => setVolume(v)} max={100} step={5} className="flex-1" />
                <span className="text-xs text-muted-foreground w-8 text-right">{volume}%</span>
              </div>
              <div style={{ width: 0, height: 0, overflow: 'hidden' }}>
                <div id={playerContainerId} />
              </div>
            </>
          )}
        </div>

        {incompleteTasks.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium">Working on:</p>
            <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select a task..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific task</SelectItem>
                {incompleteTasks.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="text-center text-xs text-muted-foreground">
          {sessions} focus session{sessions !== 1 ? 's' : ''} completed today
        </div>
      </CardContent>
    </Card>
  );
}
