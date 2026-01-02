import { Calendar, CheckSquare, Book, Utensils, BookOpen, GraduationCap, MessageCircle, Users, Settings, Download, Trophy, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { ThemeLogo } from '@/components/ThemeLogo';
import { LogOut, LogIn } from 'lucide-react';
import type { TabType } from '@/pages/Index';
interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}
export function Header({
  activeTab,
  onTabChange
}: HeaderProps) {
  const {
    user,
    signOut
  } = useAuth();
  const {
    profile
  } = useProfile();
  const { isAdmin } = useUserRoles();

  // Primary tabs - quick access for daily use
  const primaryTabs = [{
    id: 'home' as const,
    label: 'Today',
    icon: Calendar
  }, {
    id: 'tasks' as const,
    label: 'Tasks',
    icon: CheckSquare
  }, {
    id: 'classes' as const,
    label: 'Classes',
    icon: Book
  }, {
    id: 'menu' as const,
    label: 'Menu',
    icon: Utensils
  }];

  // Secondary tabs
  const secondaryTabs = [{
    id: 'bragsheet' as const,
    label: 'Brag Sheet',
    icon: Trophy
  }, {
    id: 'study' as const,
    label: 'Study',
    icon: BookOpen
  }, {
    id: 'tutor' as const,
    label: 'Tutors',
    icon: GraduationCap
  }, {
    id: 'chat' as const,
    label: 'AI Chat',
    icon: MessageCircle
  }, {
    id: 'discuss' as const,
    label: 'Community',
    icon: Users
  }];
  return <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container py-3">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <button onClick={() => onTabChange('home')} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <ThemeLogo size="md" />
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-lg text-foreground leading-tight text-left">LunchLit</h1>
              <p className="text-xs text-muted-foreground">Your school companion</p>
            </div>
          </button>
          
          <div className="flex items-center gap-2">
            {user ? <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm">{profile?.full_name || 'Account'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onTabChange('settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onTabChange('import-export')}>
                    <Download className="w-4 h-4 mr-2" />
                    Import/Export
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin">
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> : <Button variant="default" size="sm" asChild>
                <Link to="/auth">
                  <LogIn className="h-4 w-4 mr-1" />
                  Sign In
                </Link>
              </Button>}
          </div>
        </div>
        
        {/* Navigation - Primary Tabs */}
        <nav className="flex gap-1 mt-3 bg-secondary/50 p-1 rounded-xl">
          {primaryTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return <button key={tab.id} onClick={() => onTabChange(tab.id)} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isActive ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground hover:bg-card/50'}`}>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>;
        })}
          
          {/* More dropdown for secondary tabs */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${secondaryTabs.some(t => t.id === activeTab) ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground hover:bg-card/50'}`}>
                <span className="text-lg">•••</span>
                <span className="hidden sm:inline">More</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {secondaryTabs.map(tab => {
              const Icon = tab.icon;
              return <DropdownMenuItem key={tab.id} onClick={() => onTabChange(tab.id)} className={activeTab === tab.id ? 'bg-secondary' : ''}>
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </DropdownMenuItem>;
            })}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>;
}