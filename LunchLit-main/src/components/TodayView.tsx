import { StudyHallCard } from './StudyHallCard';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useSchoolStudyHalls } from '@/hooks/useSchoolStudyHalls';
import { DailyFocus } from '@/components/dashboard/DailyFocus';
import { InviteFriendsCard } from '@/components/dashboard/InviteFriendsCard';
import { ReferralNotifications } from '@/components/dashboard/ReferralNotifications';

interface TodayViewProps {
  onNavigateToMenu: () => void;
  onNavigateToStudy: () => void;
  onNavigate: (tab: string) => void;
}

export function TodayView({ onNavigateToStudy, onNavigate }: TodayViewProps) {
  const { studyHalls, hasStudyHalls } = useSchoolStudyHalls();
  const availableHalls = studyHalls.filter((h) => h.is_available).slice(0, 2);

  return (
    <div className="space-y-8 pb-8">
      <section className="opacity-0 animate-fade-up stagger-1">
        <DailyFocus />
      </section>

      <section className="opacity-0 animate-fade-up stagger-2">
        <InviteFriendsCard />
      </section>

      <section className="opacity-0 animate-fade-up stagger-3">
        <ReferralNotifications />
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
