import { useState } from 'react';
import { Header } from '@/components/Header';
import { TodayView } from '@/components/TodayView';
import { MenuView } from '@/components/MenuView';
import { StudyHallView } from '@/components/StudyHallView';
import { Helmet } from 'react-helmet';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'study'>('home');

  return (
    <>
      <Helmet>
        <title>SchoolHub - Your Daily School Companion</title>
        <meta name="description" content="Check today's lunch menu, find study halls, and plan your school day with SchoolHub. Dietary labels, real-time availability, and more." />
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
        </main>
      </div>
    </>
  );
};

export default Index;
