import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Sparkles } from 'lucide-react';
import { useFitnessProfile } from '@/hooks/useFitnessProfile';

const GOALS = [
  { value: 'lose_weight', label: 'Lose weight' },
  { value: 'build_muscle', label: 'Build muscle' },
  { value: 'endurance', label: 'Build endurance' },
  { value: 'general_fitness', label: 'General fitness' },
  { value: 'flexibility', label: 'Flexibility & mobility' },
  { value: 'sports', label: 'Sports performance' },
];

const RECS: Record<string, { teen: string[]; adult: string[] }> = {
  lose_weight: {
    teen: ['30 min cardio 4x/week (run, bike, swim)', 'Bodyweight circuits — push-ups, squats, planks', 'Walk to/from school when possible', 'Limit sugary drinks — water is your friend'],
    adult: ['HIIT 3x/week, 20-30 min', 'Strength train 2x/week to keep muscle', 'Track steps — aim for 8-10k/day', 'Cut liquid calories first'],
  },
  build_muscle: {
    teen: ['Focus on bodyweight first — push-ups, pull-ups, dips, squats', 'Sleep 8-9 hrs (when most growth happens)', 'Eat protein with every meal — eggs, chicken, beans, milk', 'Light weights with good form before going heavy'],
    adult: ['Push/Pull/Legs split 4-6x/week', '0.8-1g protein per lb bodyweight', 'Progressive overload — add weight or reps weekly', 'Compound lifts: squat, bench, deadlift, row, OHP'],
  },
  endurance: {
    teen: ['Build to 30+ min easy runs 3x/week', 'Add 1 interval session (8x400m)', 'Cross-train: bike or swim on off days', "Don't skip rest days"],
    adult: ['Long slow run 1x/week, build by 10% weekly', 'Tempo run 1x/week', 'Intervals 1x/week', 'Strength train 2x/week to prevent injury'],
  },
  general_fitness: {
    teen: ['Move 60 min/day — anything counts', 'Mix cardio, strength, and stretching', 'Join a sport or active club', 'Sleep + water > anything else'],
    adult: ['150 min moderate cardio/week', '2 strength sessions/week', '10 min mobility daily', 'Aim for 7-9 hrs sleep'],
  },
  flexibility: {
    teen: ['10 min stretching morning + night', 'Try yoga 1-2x/week (YouTube works)', 'Hold each stretch 30 sec', 'Foam roll tight muscles'],
    adult: ['Daily mobility flow — hips, shoulders, spine', 'Yoga 2-3x/week', 'Stretch after workouts when warm', 'Foam roll 5 min/day'],
  },
  sports: {
    teen: ['Sport-specific drills 3x/week', 'Plyometrics: box jumps, sprints, agility ladders', 'Strength train 2x/week', 'Recover hard: sleep, hydrate, eat'],
    adult: ['Position-specific conditioning', 'Power lifts: cleans, jumps, sprints', 'Strength 2-3x/week', 'Active recovery days mandatory'],
  },
};

export function FitnessGoals() {
  const { profile, save } = useFitnessProfile();
  const [age, setAge] = useState(16);
  const [goal, setGoal] = useState('');
  const [days, setDays] = useState(3);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (profile) {
      setAge(profile.age);
      setGoal(profile.goal || '');
      setDays(profile.days_per_week);
      setDirty(false);
    }
  }, [profile]);

  const handleSave = () => {
    save.mutate({ age, goal, days_per_week: days });
    setDirty(false);
  };

  const recs = goal ? RECS[goal][age < 18 ? 'teen' : 'adult'] : null;

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Target className="w-5 h-5 text-orange-500" />
          Your Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="age" className="text-xs">Age</Label>
            <Input id="age" type="number" min={5} max={100} value={age}
              onChange={(e) => { setAge(Number(e.target.value)); setDirty(true); }} />
          </div>
          <div>
            <Label htmlFor="days" className="text-xs">Days/week</Label>
            <Input id="days" type="number" min={1} max={7} value={days}
              onChange={(e) => { setDays(Number(e.target.value)); setDirty(true); }} />
          </div>
        </div>
        <div>
          <Label className="text-xs">Primary goal</Label>
          <Select value={goal} onValueChange={(v) => { setGoal(v); setDirty(true); }}>
            <SelectTrigger><SelectValue placeholder="Pick a goal" /></SelectTrigger>
            <SelectContent>
              {GOALS.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSave} className="w-full" disabled={!goal || save.isPending}>
          {save.isPending ? 'Saving...' : dirty || !profile ? 'Save profile' : 'Saved ✓'}
        </Button>

        {recs && goal && (
          <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold">Recommended for you</span>
            </div>
            <ul className="space-y-1.5">
              {recs.map((r, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-orange-500">•</span><span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
