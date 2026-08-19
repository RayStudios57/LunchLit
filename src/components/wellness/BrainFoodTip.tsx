import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Apple, Clock } from 'lucide-react';

const SNACKS = [
  { name: '🍌 Peanut Butter Banana Bites', time: '2 min', why: 'Potassium + protein for steady focus. Slice a banana, top with PB.' },
  { name: '🥜 Apple + Almond Butter', time: '1 min', why: 'Fiber and healthy fats. Slice an apple, dip away.' },
  { name: '🫐 Greek Yogurt + Berries + Honey', time: '2 min', why: 'Protein, antioxidants, and a touch of sweet. Layer in a cup.' },
  { name: '🥑 Avocado Toast (mini)', time: '3 min', why: 'Healthy fats keep your brain sharp. Toast bread, smash avo, salt.' },
  { name: '🥕 Carrots + Hummus', time: '1 min', why: 'Crunchy, salty, satisfying. Pre-cut carrots save time.' },
  { name: '🧀 Cheese + Whole Grain Crackers', time: '1 min', why: 'Protein + slow carbs for long study sessions.' },
  { name: '🍫 Dark Chocolate + Almonds', time: '30 sec', why: 'Antioxidants and magnesium — a small handful is plenty.' },
  { name: '🥚 Hard Boiled Egg + Salt', time: '0 min (prep ahead)', why: 'Pure protein. Boil a batch on Sunday for the week.' },
  { name: '🍓 Strawberries + Cottage Cheese', time: '2 min', why: 'High protein, low effort, naturally sweet.' },
  { name: '🌯 Turkey + Cheese Roll-Ups', time: '2 min', why: 'No bread needed. Roll turkey around cheese sticks.' },
  { name: '🍇 Grapes + String Cheese', time: '30 sec', why: 'Classic combo. Sweet, savory, portable.' },
  { name: '🥣 Overnight Oats', time: '0 min (prep night before)', why: 'Oats + milk + honey in a jar. Grab and eat cold.' },
  { name: '🍠 Microwave Sweet Potato', time: '6 min', why: 'Poke holes, microwave 6 min, top with butter + cinnamon.' },
  { name: '🥪 Avocado + Tuna on Crackers', time: '3 min', why: 'Omega-3 brain fuel. Mash, scoop, eat.' },
  { name: '🍯 Toast + Honey + Cinnamon', time: '2 min', why: 'Simple comfort food with a little natural sweetness.' },
];

export function BrainFoodTip() {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const snack = SNACKS[day % SNACKS.length];

  return (
    <Card className="card-elevated bg-gradient-to-br from-emerald-500/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Apple className="w-5 h-5 text-emerald-500" />
          Easy Snack of the Day
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold mb-1">{snack.name}</p>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mb-2">
          <Clock className="w-3 h-3" /> {snack.time}
        </div>
        <p className="text-sm text-muted-foreground">{snack.why}</p>
      </CardContent>
    </Card>
  );
}
