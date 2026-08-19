import { GraduationPage } from '@/components/graduation/GraduationPage';
import { Header } from '@/components/Header';
import { useState } from 'react';
import { Helmet } from 'react-helmet';
import type { TabType } from './Index';

const Graduation = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  
  return (
    <>
      <Helmet>
        <title>Graduation - LunchLit</title>
        <meta name="description" content="Congratulations on graduating! View your complete Brag Sheet summary for college applications." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="container py-6">
          <GraduationPage />
        </main>
      </div>
    </>
  );
};

export default Graduation;
