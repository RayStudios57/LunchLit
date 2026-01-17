import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { TodayView } from '@/components/TodayView';
import { MenuView } from '@/components/MenuView';
import { StudyHallsRealtime } from '@/components/StudyHallsRealtime';
import { TutorSection } from '@/components/TutorSection';
import { PlannerView } from '@/components/planner/PlannerView';
import { TasksView } from '@/components/tasks/TasksView';
import { ClassSchedule } from '@/components/planner/ClassSchedule';
import { ChatBot } from '@/components/chat/ChatBot';
import { SettingsView } from '@/components/settings/SettingsView';
// Import/Export removed - replaced with admin meal management
import { DiscussionView } from '@/components/discussion/DiscussionView';
import { TodayWidget } from '@/components/dashboard/TodayWidget';
import { GradeSelectionModal } from '@/components/onboarding/GradeSelectionModal';
import { BragSheetView } from '@/components/bragsheet/BragSheetView';
import { Credits } from '@/components/Credits';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useGradeProgression } from '@/hooks/useGradeProgression';
import { Helmet } from 'react-helmet';

export type TabType = 'home' | 'menu' | 'study' | 'tutor' | 'planner' | 'chat' | 'discuss' | 'settings' | 'tasks' | 'classes' | 'bragsheet';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const { user } = useAuth();
  const { profile } = useProfile();
  const { isGraduated } = useGradeProgression(); // Auto-checks and progresses grade
  const [showGradeModal, setShowGradeModal] = useState(false);

  useEffect(() => {
    if (user && profile && !profile.grade_level) {
      setShowGradeModal(true);
    }
  }, [user, profile]);

  return (
    <>
      <Helmet>
        <title>LunchLit - Your Daily School Companion</title>
        <meta name="description" content="Check today's lunch menu, manage tasks, track classes, and plan your school day with LunchLit." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="container py-6">
          {activeTab === 'home' && (
            <div className="space-y-6">
              {user && <TodayWidget />}
              <TodayView 
                onNavigateToMenu={() => setActiveTab('menu')} 
                onNavigateToStudy={() => setActiveTab('study')} 
              />
              <Credits />
            </div>
          )}
          {activeTab === 'tasks' && <TasksView />}
          {activeTab === 'classes' && <ClassSchedule />}
          {activeTab === 'menu' && <MenuView />}
          {activeTab === 'study' && <StudyHallsRealtime />}
          {activeTab === 'tutor' && <TutorSection />}
          {activeTab === 'planner' && <PlannerView />}
          {activeTab === 'chat' && <ChatBot />}
          {activeTab === 'discuss' && <DiscussionView />}
          {activeTab === 'bragsheet' && <BragSheetView />}
          {activeTab === 'settings' && <SettingsView />}
          
        </main>
      </div>

      <GradeSelectionModal 
        open={showGradeModal} 
        onComplete={() => setShowGradeModal(false)} 
      />
    </>
  );
};

export default Index;
