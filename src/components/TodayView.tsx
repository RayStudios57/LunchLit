import { getTodayMenu } from '@/data/mockData';
import { MenuCard } from './MenuCard';
import { StudyHallCard } from './StudyHallCard';
import { Utensils, BookOpen, Sparkles, ArrowRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useSchoolStudyHalls } from '@/hooks/useSchoolStudyHalls';

interface TodayViewProps {
  onNavigateToMenu: () => void;
  onNavigateToStudy: () => void;
}

export function TodayView({ onNavigateToMenu, onNavigateToStudy }: TodayViewProps) {
  const todayMenu = getTodayMenu();
  const { studyHalls, hasStudyHalls } = useSchoolStudyHalls();
  const availableHalls = studyHalls.filter((h) => h.is_available).slice(0, 2);
  const today = new Date();
  const formattedDate = format(today, 'EEEE, MMMM d, yyyy');

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 sm:p-8 text-primary-foreground opacity-0 animate-fade-up">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-foreground/5 rounded-full blur-2xl" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium opacity-90">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">Today's Highlight</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
            {todayMenu.dayName}'s Menu
          </h2>
          <p className="text-primary-foreground/80 mb-4 max-w-md">
            Check out what's cooking today and find the perfect study spot between classes.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={onNavigateToMenu}
              className="inline-flex items-center gap-2 bg-primary-foreground text-primary px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary-foreground/90 transition-colors"
            >
              <Utensils className="w-4 h-4" />
              View Full Menu
              <ArrowRight className="w-4 h-4" />
            </button>
            {hasStudyHalls && (
              <button 
                onClick={onNavigateToStudy}
                className="inline-flex items-center gap-2 bg-primary-foreground/20 px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary-foreground/30 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Find Study Spots
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Featured Lunch Item */}
      <section className="opacity-0 animate-fade-up stagger-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-lg">Today's Lunch</h2>
          </div>
          <button 
            onClick={onNavigateToMenu}
            className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            See all
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {todayMenu.items.map((item, index) => (
            <MenuCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </section>

      {/* Available Study Halls - Only show if school has study halls */}
      {hasStudyHalls && availableHalls.length > 0 && (
        <section className="opacity-0 animate-fade-up stagger-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-lg">Open Study Halls</h2>
            </div>
            <button 
              onClick={onNavigateToStudy}
              className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              See all
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {availableHalls.map((hall, index) => (
              <StudyHallCard key={hall.id} hall={hall} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
