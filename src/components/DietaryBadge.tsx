import { Badge } from '@/components/ui/badge';
import { DietaryType } from '@/types';
import { Leaf, Milk, Drumstick, Wheat, Circle } from 'lucide-react';

interface DietaryBadgeProps {
  type: DietaryType;
}

const dietaryConfig: Record<DietaryType, { label: string; icon: React.ReactNode }> = {
  vegetarian: { label: 'Vegetarian', icon: <Leaf className="w-3 h-3" /> },
  vegan: { label: 'Vegan', icon: <Leaf className="w-3 h-3" /> },
  dairy: { label: 'Dairy', icon: <Milk className="w-3 h-3" /> },
  meat: { label: 'Meat', icon: <Drumstick className="w-3 h-3" /> },
  'gluten-free': { label: 'GF', icon: <Wheat className="w-3 h-3" /> },
  halal: { label: 'Halal', icon: <Circle className="w-3 h-3" /> },
};

export function DietaryBadge({ type }: DietaryBadgeProps) {
  const config = dietaryConfig[type];

  return (
    <Badge variant={type} className="gap-1">
      {config.icon}
      {config.label}
    </Badge>
  );
}
