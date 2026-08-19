import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Apple, Dumbbell } from 'lucide-react';
import { NutritionView } from './NutritionView';
import { FitnessView } from './FitnessView';

export function WellnessView() {
  const [tab, setTab] = useState('nutrition');

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="nutrition" className="gap-2">
            <Apple className="w-4 h-4" /> Nutrition
          </TabsTrigger>
          <TabsTrigger value="fitness" className="gap-2">
            <Dumbbell className="w-4 h-4" /> Fitness
          </TabsTrigger>
        </TabsList>
        <TabsContent value="nutrition" className="mt-6">
          <NutritionView />
        </TabsContent>
        <TabsContent value="fitness" className="mt-6">
          <FitnessView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
