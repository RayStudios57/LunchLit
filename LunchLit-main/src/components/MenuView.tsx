import { useState, useEffect } from 'react';
import { useMealSchedules } from '@/hooks/useMealSchedules';
import { MenuCard } from './MenuCard';
import { DietaryType } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Calendar, CalendarDays, CalendarRange, AlertCircle, Utensils } from 'lucide-react';
import { format, isToday, parseISO, isWeekend as checkIsWeekend } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useUserRoles } from '@/hooks/useUserRoles';
import { WeeklyMenuView } from './menu/WeeklyMenuView';
import { MonthlyMenuView } from './menu/MonthlyMenuView';

const dietaryFilters: { type: DietaryType; label: string }[] = [
  { type: 'vegetarian', label: 'Vegetarian' },
  { type: 'vegan', label: 'Vegan' },
  { type: 'gluten-free', label: 'Gluten-Free' },
  { type: 'dairy', label: 'Dairy' },
  { type: 'meat', label: 'Meat' },
];

type ViewMode = 'today' | 'week' | 'month';

// Get saved view preference from localStorage
const getSavedViewMode = (): ViewMode => {
  const saved = localStorage.getItem('lunchlit-menu-view');
  if (saved === 'today' || saved === 'week' || saved === 'month') {
    return saved;
  }
  return 'today';
};

export function MenuView() {
  const [activeFilters, setActiveFilters] = useState<DietaryType[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(getSavedViewMode);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const { weeklyMenu, monthlyMenu, isLoading, isLoadingMonthly, hasMenuData } = useMealSchedules(currentMonth);
  const { isAdmin, roles } = useUserRoles();
  const isTeacher = roles.some(r => r.role === 'teacher');
  
  const today = new Date();
  const isOnWeekend = checkIsWeekend(today);

  // Save view preference when it changes
  useEffect(() => {
    localStorage.setItem('lunchlit-menu-view', viewMode);
  }, [viewMode]);

  const toggleFilter = (type: DietaryType) => {
    setActiveFilters((prev) =>
      prev.includes(type) ? prev.filter((f) => f !== type) : [...prev, type]
    );
  };

  const clearFilters = () => setActiveFilters([]);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'month') {
      setCurrentMonth(new Date());
    }
  };

  // Filter today's menu
  const todayMenu = weeklyMenu
    .filter((day) => isToday(parseISO(day.date)) || isOnWeekend)
    .map((day) => ({
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
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  // Show empty state if no menu data
  if (!hasMenuData && viewMode !== 'month') {
    return (
      <div className="space-y-6 pb-8">
        {/* View Toggle */}
        <ViewToggle 
          viewMode={viewMode} 
          onChange={handleViewModeChange} 
          isWeekend={isOnWeekend} 
        />
        
        <Card className="card-elevated">
          <CardContent className="py-12 text-center">
            <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Menu Available</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Your school hasn't added any meals for this week yet.
              {(isAdmin || isTeacher) && ' You can add meals from the Admin dashboard.'}
            </p>
            {(isAdmin || isTeacher) && (
              <Button asChild>
                <Link to="/admin">Manage Meals</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Weekend Notice */}
      {isOnWeekend && viewMode === 'today' && (
        <Alert className="opacity-0 animate-fade-up bg-primary/10 border-primary/30">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription>
            It's the weekend! Showing next week's menu starting Monday.
          </AlertDescription>
        </Alert>
      )}

      {/* View Toggle */}
      <ViewToggle 
        viewMode={viewMode} 
        onChange={handleViewModeChange} 
        isWeekend={isOnWeekend} 
      />

      {/* Filters (not shown for monthly view) */}
      {viewMode !== 'month' && (
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
      )}

      {/* Menu Content */}
      {viewMode === 'today' && (
        <TodayMenuView 
          todayMenu={todayMenu} 
          isWeekend={isOnWeekend}
        />
      )}

      {viewMode === 'week' && (
        <WeeklyMenuView 
          weeklyData={weeklyMenu}
          isLoading={isLoading}
          activeFilters={activeFilters}
          isWeekend={isOnWeekend}
        />
      )}

      {viewMode === 'month' && (
        <MonthlyMenuView 
          monthlyData={monthlyMenu}
          isLoading={isLoadingMonthly}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
        />
      )}
    </div>
  );
}

// View Toggle Component
function ViewToggle({ 
  viewMode, 
  onChange, 
  isWeekend 
}: { 
  viewMode: ViewMode; 
  onChange: (mode: ViewMode) => void; 
  isWeekend: boolean;
}) {
  return (
    <div className="flex items-center gap-2 opacity-0 animate-fade-up">
      <button
        onClick={() => onChange('today')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          viewMode === 'today'
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        <Calendar className="w-4 h-4" />
        {isWeekend ? 'Next Week' : 'Today'}
      </button>
      <button
        onClick={() => onChange('week')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          viewMode === 'week'
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        <CalendarDays className="w-4 h-4" />
        Week
      </button>
      <button
        onClick={() => onChange('month')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          viewMode === 'month'
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        <CalendarRange className="w-4 h-4" />
        Month
      </button>
    </div>
  );
}

// Today Menu View Component  
function TodayMenuView({ 
  todayMenu, 
  isWeekend 
}: { 
  todayMenu: { date: string; dayName: string; items: any[] }[];
  isWeekend: boolean;
}) {
  if (todayMenu.length === 0) {
    return (
      <div className="card-elevated p-8 text-center text-muted-foreground opacity-0 animate-fade-up" style={{ animationDelay: '0.15s' }}>
        <p>No menu available. Switch to week view to see upcoming meals.</p>
      </div>
    );
  }

  return (
    <>
      {todayMenu.map((day, dayIndex) => (
        <section key={day.date} className="opacity-0 animate-fade-up" style={{ animationDelay: `${dayIndex * 0.1 + 0.15}s` }}>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-display font-semibold text-xl text-foreground">
              {day.dayName}
            </h2>
            <Badge variant="secondary" className="text-xs">
              {format(parseISO(day.date), 'MMM d')}
            </Badge>
            {!isWeekend && isToday(parseISO(day.date)) && (
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
            <div className="card-elevated p-8 text-center text-muted-foreground">
              <p>No items available for this day.</p>
            </div>
          )}
        </section>
      ))}
    </>
  );
}
