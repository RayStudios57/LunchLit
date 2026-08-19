import { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  isWeekend,
  startOfWeek,
  endOfWeek,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

interface MonthlyMeal {
  date: string;
  items: MenuItem[];
}

interface MonthlyMenuViewProps {
  monthlyData: MonthlyMeal[];
  isLoading: boolean;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function MonthlyMenuView({ 
  monthlyData, 
  isLoading, 
  currentMonth, 
  onMonthChange 
}: MonthlyMenuViewProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getMealsForDate = (date: Date): MenuItem[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = monthlyData.find(d => d.date === dateStr);
    return dayData?.items || [];
  };

  const handlePreviousMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    onMonthChange(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    onMonthChange(next);
  };

  const selectedDayMeals = selectedDate ? getMealsForDate(parseISO(selectedDate)) : [];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="font-display font-semibold text-xl text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <Button variant="outline" size="sm" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card className="card-elevated overflow-hidden">
        <CardContent className="p-0">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b bg-muted/50">
            {weekdays.map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const meals = getMealsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isWeekendDay = isWeekend(day);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={index}
                  onClick={() => meals.length > 0 && setSelectedDate(dateStr)}
                  disabled={meals.length === 0 || !isCurrentMonth}
                  className={`
                    min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 border-b border-r text-left transition-colors
                    ${!isCurrentMonth ? 'bg-muted/30 text-muted-foreground/50' : ''}
                    ${isWeekendDay && isCurrentMonth ? 'bg-muted/20' : ''}
                    ${isTodayDate ? 'bg-primary/10 ring-1 ring-primary/30 ring-inset' : ''}
                    ${meals.length > 0 && isCurrentMonth ? 'hover:bg-secondary/50 cursor-pointer' : 'cursor-default'}
                  `}
                >
                  <div className="flex flex-col h-full">
                    <span className={`
                      text-xs sm:text-sm font-medium
                      ${isTodayDate ? 'text-primary font-bold' : ''}
                    `}>
                      {format(day, 'd')}
                    </span>
                    
                    {isCurrentMonth && meals.length > 0 && (
                      <div className="mt-1 space-y-0.5 flex-1 overflow-hidden">
                        {meals.slice(0, 2).map((meal, i) => (
                          <div
                            key={meal.id}
                            className="text-[10px] sm:text-xs truncate text-foreground/80 bg-secondary/50 rounded px-1 py-0.5"
                          >
                            {meal.name}
                          </div>
                        ))}
                        {meals.length > 2 && (
                          <div className="text-[10px] sm:text-xs text-muted-foreground">
                            +{meals.length - 2} more
                          </div>
                        )}
                      </div>
                    )}

                    {isCurrentMonth && meals.length === 0 && !isWeekendDay && (
                      <div className="mt-1 flex items-center justify-center flex-1">
                        <span className="text-[10px] text-muted-foreground/50">—</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Day Detail Dialog */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              {selectedDate && format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {selectedDayMeals.length > 0 ? (
              <div className="grid gap-4">
                {selectedDayMeals.map((item, index) => (
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
              <div className="text-center py-8 text-muted-foreground">
                <Utensils className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No menu items for this day.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
