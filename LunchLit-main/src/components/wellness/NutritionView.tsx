import { MoodCheckIn } from './MoodCheckIn';
import { WaterTracker } from './WaterTracker';
import { BrainFoodTip } from './BrainFoodTip';
import { BreathingExercise } from './BreathingExercise';
import { WellnessStats } from './WellnessStats';
import { useHydrationReminder } from '@/hooks/useHydrationReminder';

export function NutritionView() {
  useHydrationReminder();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <MoodCheckIn />
        <WaterTracker />
        <BrainFoodTip />
        <BreathingExercise />
      </div>

      <WellnessStats />
    </div>
  );
}
