import { useState } from 'react';
import { Header } from '@/components/Header';
import { TodayView } from '@/components/TodayView';
import { MenuView } from '@/components/MenuView';
import { StudyHallView } from '@/components/StudyHallView';
import { TutorSection } from '@/components/TutorSection';
import { Helmet } from 'react-helmet';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'study' | 'tutor'>('home');

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
            <TodayView 
              onNavigateToMenu={() => setActiveTab('menu')} 
              onNavigateToStudy={() => setActiveTab('study')} 
            />
          )}
          {activeTab === 'menu' && <MenuView />}
          {activeTab === 'study' && <StudyHallView />}
          {activeTab === 'tutor' && <TutorSection />}
        </main>
      </div>
    </>
  );
};

export default Index;
