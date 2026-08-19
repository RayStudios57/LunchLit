import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wind, Play, Square } from 'lucide-react';

const PHASES = [
  { label: 'Breathe in', seconds: 4 },
  { label: 'Hold', seconds: 4 },
  { label: 'Breathe out', seconds: 4 },
  { label: 'Hold', seconds: 4 },
];

export function BreathingExercise() {
  const [active, setActive] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [count, setCount] = useState(4);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) return;
    timerRef.current = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          setPhaseIdx((p) => {
            const next = (p + 1) % PHASES.length;
            setCount(PHASES[next].seconds);
            return next;
          });
          return PHASES[(phaseIdx + 1) % PHASES.length].seconds;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active, phaseIdx]);

  const toggle = () => {
    if (active) {
      setActive(false);
      setPhaseIdx(0);
      setCount(4);
    } else {
      setPhaseIdx(0);
      setCount(PHASES[0].seconds);
      setActive(true);
    }
  };

  const phase = PHASES[phaseIdx];
  const scale = active
    ? phase.label === 'Breathe in'
      ? 'scale-110'
      : phase.label === 'Breathe out'
      ? 'scale-75'
      : 'scale-100'
    : 'scale-100';

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Wind className="w-5 h-5 text-teal-500" />
          Box Breathing
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 py-4">
        <div
          className={`relative h-32 w-32 rounded-full bg-gradient-to-br from-teal-400/40 to-emerald-500/40 border-2 border-teal-400/60 flex items-center justify-center transition-transform duration-1000 ease-in-out ${scale}`}
        >
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {active ? phase.label : 'Ready'}
            </p>
            {active && <p className="text-2xl font-bold text-teal-500">{count}</p>}
          </div>
        </div>
        <Button onClick={toggle} variant={active ? 'destructive' : 'default'} size="sm">
          {active ? (
            <>
              <Square className="w-4 h-4 mr-1" /> Stop
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-1" /> Start 1-min reset
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
