import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { TodayView } from '@/components/TodayView';
import { MenuView } from '@/components/MenuView';
import { StudyHallView } from '@/components/StudyHallView';
import { TutorSection } from '@/components/TutorSection';
import { PlannerView } from '@/components/planner/PlannerView';
import { ChatBot } from '@/components/chat/ChatBot';
import { SettingsView } from '@/components/settings/SettingsView';
import { ImportExportView } from '@/components/import-export/ImportExportView';
import { DiscussionView } from '@/components/discussion/DiscussionView';
import { TodayWidget } from '@/components/dashboard/TodayWidget';
import { GradeSelectionModal } from '@/components/onboarding/GradeSelectionModal';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Helmet } from 'react-helmet';

export type TabType = 'home' | 'menu' | 'study' | 'tutor' | 'planner' | 'chat' | 'discuss' | 'settings' | 'import-export';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const { user } = useAuth();
  const { profile } = useProfile();
  const [showGradeModal, setShowGradeModal] = useState(false);

  // Show grade selection for new users without grade level
  useEffect(() => {
    if (user && profile && !profile.grade_level) {
      setShowGradeModal(true);
    }
  }, [user, profile]);

  return (
    <>
      <Helmet>
        <title>LunchLit - Your Daily Lunch Companion</title>
        <meta name="description" content="Check today's lunch menu, find study halls, tutoring, and plan your school day with LunchLit. Dietary labels, real-time availability, and more." />
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
            </div>
          )}
          {activeTab === 'menu' && <MenuView />}
          {activeTab === 'study' && <StudyHallView />}
          {activeTab === 'tutor' && <TutorSection />}
          {activeTab === 'planner' && <PlannerView />}
          {activeTab === 'chat' && <ChatBot />}
          {activeTab === 'discuss' && <DiscussionView />}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'import-export' && <ImportExportView />}
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
