import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell } from 'lucide-react';
import { MachineScanner } from './MachineScanner';
import { GymRoutineBuilder } from './GymRoutineBuilder';
import { FitnessGoals } from './FitnessGoals';

export function FitnessView() {
  return (
    <div className="space-y-6">
      <Card className="card-elevated bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent border-orange-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-orange-500" />
            Your Fitness Hub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Scan gym machines, build routines, and get recommendations based on your age and goals.
          </p>
        </CardContent>
      </Card>

      <FitnessGoals />
      <MachineScanner />
      <GymRoutineBuilder />
    </div>
  );
}
