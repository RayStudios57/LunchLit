import { useState } from 'react';
import { weeklyMenu } from '@/data/mockData';
import { MenuCard } from './MenuCard';
import { DietaryType } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Calendar, CalendarDays } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';

const dietaryFilters: { type: DietaryType; label: string }[] = [
  { type: 'vegetarian', label: 'Vegetarian' },
  { type: 'vegan', label: 'Vegan' },
  { type: 'gluten-free', label: 'Gluten-Free' },
  { type: 'dairy', label: 'Dairy' },
  { type: 'meat', label: 'Meat' },
];

type ViewMode = 'today' | 'week';

export function MenuView() {
  const [activeFilters, setActiveFilters] = useState<DietaryType[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('today');

  const toggleFilter = (type: DietaryType) => {
    setActiveFilters((prev) =>
      prev.includes(type) ? prev.filter((f) => f !== type) : [...prev, type]
    );
  };

  const clearFilters = () => setActiveFilters([]);

  const filteredMenu = weeklyMenu
    .filter((day) => viewMode === 'week' || isToday(parseISO(day.date)))
    .map((day) => ({
      ...day,
      items: day.items.filter((item) =>
        activeFilters.length === 0
          ? true
          : activeFilters.some((filter) => item.dietary.includes(filter))
      ),
    }));

  const todayMenu = weeklyMenu.find((day) => isToday(parseISO(day.date)));

  return (
    <div className="space-y-6 pb-8">
      {/* View Toggle */}
      <div className="flex items-center gap-2 opacity-0 animate-fade-up">
        <button
          onClick={() => setViewMode('today')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            viewMode === 'today'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Today
        </button>
        <button
          onClick={() => setViewMode('week')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            viewMode === 'week'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          This Week
        </button>
      </div>
      {/* Filters */}
      <div className="card-elevated p-4 opacity-0 animate-fade-up" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Filter className="w-4 h-4" />
            <span>Filter by dietary preference</span>
          </div>
          {activeFilters.length > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {dietaryFilters.map((filter) => {
            const isActive = activeFilters.includes(filter.type);
            return (
              <button
                key={filter.type}
                onClick={() => toggleFilter(filter.type)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Content */}
      {filteredMenu.length === 0 && viewMode === 'today' ? (
        <div className="card-elevated p-8 text-center text-muted-foreground opacity-0 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <p>No menu available for today. Switch to week view to see upcoming meals.</p>
        </div>
      ) : (
        filteredMenu.map((day, dayIndex) => (
          <section key={day.date} className="opacity-0 animate-fade-up" style={{ animationDelay: `${dayIndex * 0.1 + 0.15}s` }}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-display font-semibold text-xl text-foreground">
                {day.dayName}
              </h2>
              <Badge variant="secondary" className="text-xs">
                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Badge>
              {isToday(parseISO(day.date)) && (
                <Badge className="text-xs bg-primary/20 text-primary border-primary/30">
                  Today
                </Badge>
              )}
            </div>
            
            {day.items.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {day.items.map((item, index) => (
                  <MenuCard key={item.id} item={item} index={index} />
                ))}
              </div>
            ) : (
              <div className="card-elevated p-8 text-center text-muted-foreground">
                <p>No items match your filters for this day.</p>
              </div>
            )}
          </section>
        ))
      )}
    </div>
  );
}
