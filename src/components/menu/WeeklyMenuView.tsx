import { format, parseISO, isToday } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils } from 'lucide-react';
import { DietaryType } from '@/types';
import { MenuCard } from '@/components/MenuCard';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  dietary: string[];
  mealType: string;
  calories?: number;
}

interface DayMenu {
  date: string;
  dayName: string;
  items: MenuItem[];
}

interface WeeklyMenuViewProps {
  weeklyData: DayMenu[];
  isLoading: boolean;
  activeFilters: DietaryType[];
  isWeekend: boolean;
}

export function WeeklyMenuView({ 
  weeklyData, 
  isLoading, 
  activeFilters,
  isWeekend 
}: WeeklyMenuViewProps) {
  const filteredWeeklyData = weeklyData.map((day) => ({
    ...day,
    items: day.items.filter((item) =>
      activeFilters.length === 0
        ? true
        : activeFilters.some((filter) => item.dietary.includes(filter))
    ),
  }));

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filteredWeeklyData.map((day, dayIndex) => {
        const isTodayDate = !isWeekend && isToday(parseISO(day.date));

        return (
          <section 
            key={day.date} 
            className="opacity-0 animate-fade-up" 
            style={{ animationDelay: `${dayIndex * 0.05}s` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-display font-semibold text-xl text-foreground">
                {day.dayName}
              </h2>
              <Badge variant="secondary" className="text-xs">
                {format(parseISO(day.date), 'MMM d')}
              </Badge>
              {isTodayDate && (
                <Badge className="text-xs bg-primary/20 text-primary border-primary/30">
                  Today
                </Badge>
              )}
            </div>
            
            {day.items.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {day.items.map((item, index) => (
                  <MenuCard 
                    key={item.id} 
                    item={{
                      id: item.id,
                      name: item.name,
                      description: item.description,
                      dietary: item.dietary as DietaryType[],
                      image: undefined,
                    }} 
                    index={index} 
                  />
                ))}
              </div>
            ) : (
              <Card className="card-elevated">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Utensils className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No items available for this day.</p>
                </CardContent>
              </Card>
            )}
          </section>
        );
      })}
    </div>
  );
}
