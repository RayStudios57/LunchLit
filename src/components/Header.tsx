import { Utensils, BookOpen, Calendar, GraduationCap } from 'lucide-react';

interface HeaderProps {
  activeTab: 'home' | 'menu' | 'study' | 'tutor';
  onTabChange: (tab: 'home' | 'menu' | 'study' | 'tutor') => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const tabs = [
    { id: 'home' as const, label: 'Today', icon: Calendar },
    { id: 'menu' as const, label: 'Menu', icon: Utensils },
    { id: 'study' as const, label: 'Study', icon: BookOpen },
    { id: 'tutor' as const, label: 'Tutors', icon: GraduationCap },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <span className="text-xl">🍴</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">LunchLit</h1>
              <p className="text-xs text-muted-foreground">Your daily lunch companion</p>
            </div>
          </div>
        </div>
        
        <nav className="flex gap-1 mt-4 bg-secondary/50 p-1 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                  isActive 
                    ? 'bg-card text-foreground shadow-card' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
