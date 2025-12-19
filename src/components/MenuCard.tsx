import { MenuItem } from '@/types';
import { DietaryBadge } from './DietaryBadge';
import { Flame } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  index: number;
}

export function MenuCard({ item, index }: MenuCardProps) {
  return (
    <div 
      className="card-interactive overflow-hidden opacity-0 animate-fade-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {item.image && (
        <div className="relative h-40 overflow-hidden">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>
      )}
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display font-semibold text-lg text-foreground leading-tight">
            {item.name}
          </h3>
          {item.calories && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
              <Flame className="w-4 h-4 text-accent" />
              <span>{item.calories} cal</span>
            </div>
          )}
        </div>
        
        <p className="text-muted-foreground text-sm leading-relaxed">
          {item.description}
        </p>
        
        <div className="flex flex-wrap gap-2 pt-1">
          {item.dietary.map((diet) => (
            <DietaryBadge key={diet} type={diet} />
          ))}
        </div>
      </div>
    </div>
  );
}
