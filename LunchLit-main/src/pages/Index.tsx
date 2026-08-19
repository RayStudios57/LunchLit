import { useState, useEffect, ReactNode } from 'react';
import { Header } from '@/components/Header';
import { usePresenceBroadcast } from '@/hooks/usePresence';
import { TodayView } from '@/components/TodayView';
import { WellnessView } from '@/components/wellness/WellnessView';
import { StudyHallsRealtime } from '@/components/StudyHallsRealtime';
import { TutorSection } from '@/components/TutorSection';
import { PlannerView } from '@/components/planner/PlannerView';
import { TasksView } from '@/components/tasks/TasksView';
import { ClassSchedule } from '@/components/planner/ClassSchedule';
import { ChatBot } from '@/components/chat/ChatBot';
import { SettingsView } from '@/components/settings/SettingsView';
import { DiscussionView } from '@/components/discussion/DiscussionView';
import { TodayWidget } from '@/components/dashboard/TodayWidget';
import { GpaCalculatorWidget } from '@/components/dashboard/GpaCalculatorWidget';
import { PomodoroTimer } from '@/components/dashboard/PomodoroTimer';
import { MotivationalQuote } from '@/components/dashboard/MotivationalQuote';
import { WellnessStats } from '@/components/wellness/WellnessStats';
import { PwaInstallButton } from '@/components/dashboard/PwaInstallButton';
import { WellnessBanner } from '@/components/wellness/WellnessBanner';
import { GraduationCountdown } from '@/components/dashboard/GraduationCountdown';
import { GradeSelectionModal } from '@/components/onboarding/GradeSelectionModal';
import { OnboardingTutorial } from '@/components/onboarding/OnboardingTutorial';
import { BragSheetView } from '@/components/bragsheet/BragSheetView';
import { StudentPortfolioView } from '@/components/portfolio/StudentPortfolioView';
import { PublicProfileView } from '@/components/profile/PublicProfileView';
import { FriendsView } from '@/components/friends/FriendsView';
import { Credits } from '@/components/Credits';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useGradeProgression } from '@/hooks/useGradeProgression';
import { Helmet } from 'react-helmet';
import { LandingPage } from '@/components/landing/LandingPage';
import { useNavigate } from 'react-router-dom';
import { PhoneSidebarNav } from '@/components/navigation/PhoneSidebarNav';
import { getNavLayout, NavLayout } from '@/components/Header';
import { recordViewVisit } from '@/lib/secrets';

export type TabType = 'home' | 'menu' | 'study' | 'tutor' | 'planner' | 'chat' | 'discuss' | 'settings' | 'tasks' | 'classes' | 'bragsheet' | 'portfolio' | 'profiles';

function AuthOverlay({ isAuthenticated, children }: { isAuthenticated: boolean; children: ReactNode }) {
  if (isAuthenticated) return <>{children}</>;
  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-[2px] opacity-60">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/40 rounded-xl">
        <div className="text-center bg-card border border-border rounded-xl px-6 py-4 shadow-lg">
          <p className="font-medium text-foreground mb-2">Sign in to use this feature</p>
          <a href="/auth" className="text-sm text-primary hover:underline font-medium">
            Sign in to access LunchLit →
          </a>
        </div>
      </div>
    </div>
  );
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { isGraduated } = useGradeProgression();
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [phoneNavOpen, setPhoneNavOpen] = useState(false);
  const [navLayout, setNavLayoutState] = useState<NavLayout>(getNavLayout());

  useEffect(() => {
    const handler = () => setNavLayoutState(getNavLayout());
    window.addEventListener('nav-layout-change', handler);
    return () => window.removeEventListener('nav-layout-change', handler);
  }, []);

  useEffect(() => {
    recordViewVisit(activeTab);
  }, [activeTab]);

  // Broadcast presence with current tab and custom status
  usePresenceBroadcast(activeTab, profile?.custom_status);

  useEffect(() => {
    if (user && profile && !profile.grade_level) {
      setShowGradeModal(true);
    }
  }, [user, profile]);

  useEffect(() => {
    if (user && profile && profile.grade_level) {
      const tutorialKey = `lunchlit_tutorial_seen_${user.id}`;
      if (!localStorage.getItem(tutorialKey)) {
        setShowTutorial(true);
      }
    }
  }, [user, profile]);

  // Show the marketing landing page to signed-out visitors
  if (!authLoading && !user) {
    return (
      <>
        <Helmet>
          <title>LunchLit — Your All-in-One Student Companion</title>
          <meta name="description" content="LunchLit helps students manage classes, track wellness and fitness, plan their day, find study halls, and get instant AI study help." />
        </Helmet>
        <LandingPage onGetStarted={() => navigate('/auth')} />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>LunchLit - Your Daily School Companion</title>
        <meta name="description" content="Track your wellness and fitness, manage tasks, organize classes, and plan your school day with LunchLit." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header activeTab={activeTab} onTabChange={setActiveTab} onOpenSidebar={() => setPhoneNavOpen(true)} />
        {navLayout === 'sidebar' && (
          <PhoneSidebarNav
            open={phoneNavOpen}
            onClose={() => setPhoneNavOpen(false)}
            activeTab={activeTab}
            onNavigate={(tab) => setActiveTab(tab as TabType)}
          />
        )}
        
        <main className="container py-6">
          {activeTab === 'home' && (
          <div className="space-y-6">
              <WellnessBanner />
              {user && <PwaInstallButton />}
              <AuthOverlay isAuthenticated={!!user}>
                <MotivationalQuote />
              </AuthOverlay>
              <AuthOverlay isAuthenticated={!!user}>
                <TodayWidget />
              </AuthOverlay>
              <TodayView 
                onNavigateToMenu={() => setActiveTab('menu')} 
                onNavigateToStudy={() => setActiveTab('study')} 
                onNavigate={(tab) => setActiveTab(tab as TabType)}
              />
              <AuthOverlay isAuthenticated={!!user}>
                <WellnessStats />
              </AuthOverlay>
              <AuthOverlay isAuthenticated={!!user}>
                <PomodoroTimer />
              </AuthOverlay>
              <AuthOverlay isAuthenticated={!!user}>
                <GraduationCountdown />
              </AuthOverlay>
              <Credits />
            </div>
          )}
          {activeTab === 'tasks' && <TasksView />}
          {activeTab === 'classes' && (
            <div className="space-y-6">
              <ClassSchedule />
              <AuthOverlay isAuthenticated={!!user}>
                <GpaCalculatorWidget />
              </AuthOverlay>
            </div>
          )}
          {activeTab === 'menu' && <WellnessView />}
          {activeTab === 'study' && <StudyHallsRealtime />}
          {activeTab === 'tutor' && <TutorSection />}
          {activeTab === 'planner' && <PlannerView />}
          {activeTab === 'chat' && <ChatBot />}
          {activeTab === 'discuss' && <DiscussionView />}
          {activeTab === 'bragsheet' && <BragSheetView />}
          {activeTab === 'portfolio' && <StudentPortfolioView />}
          {activeTab === 'profiles' && <FriendsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      <GradeSelectionModal 
        open={showGradeModal} 
        onComplete={() => setShowGradeModal(false)} 
      />

      <OnboardingTutorial
        open={showTutorial && !showGradeModal}
        onComplete={() => {
          setShowTutorial(false);
          if (user) {
            localStorage.setItem(`lunchlit_tutorial_seen_${user.id}`, 'true');
          }
        }}
      />
    </>
  );
};

export default Index;
