import { Utensils, BookOpen, Calendar, GraduationCap, ClipboardList, MessageCircle, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface HeaderProps {
  activeTab: 'home' | 'menu' | 'study' | 'tutor' | 'planner' | 'chat';
  onTabChange: (tab: 'home' | 'menu' | 'study' | 'tutor' | 'planner' | 'chat') => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const { user, signOut } = useAuth();
  
  const tabs = [
    { id: 'home' as const, label: 'Today', icon: Calendar },
    { id: 'menu' as const, label: 'Menu', icon: Utensils },
    { id: 'study' as const, label: 'Study', icon: BookOpen },
    { id: 'tutor' as const, label: 'Tutors', icon: GraduationCap },
    { id: 'planner' as const, label: 'Planner', icon: ClipboardList },
    { id: 'chat' as const, label: 'AI Chat', icon: MessageCircle },
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
          
          <div className="flex items-center gap-2">
            {user ? (
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">
                  <LogIn className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
        
        <nav className="flex gap-1 mt-4 bg-secondary/50 p-1 rounded-xl overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 min-w-[50px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                  isActive 
                    ? 'bg-card text-foreground shadow-card' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
