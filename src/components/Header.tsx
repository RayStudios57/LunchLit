import { Calendar, CheckSquare, Book, Utensils, BookOpen, GraduationCap, MessageCircle, Users, Settings, Trophy, Shield, Target, Presentation, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useUserRoles } from '@/hooks/useUserRoles';
import { usePresentationMode } from '@/contexts/PresentationModeContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Link } from 'react-router-dom';
import { ThemeLogo } from '@/components/ThemeLogo';
import { LogOut, LogIn } from 'lucide-react';
import { NotificationBell } from '@/components/NotificationBell';
import { useState, useEffect } from 'react';
import type { TabType } from '@/pages/Index';

export type NavLayout = 'tabs' | 'sidebar';

export function getNavLayout(): NavLayout {
  return (localStorage.getItem('lunchlit_nav_layout') as NavLayout) || 'tabs';
}

export function setNavLayout(layout: NavLayout) {
  localStorage.setItem('lunchlit_nav_layout', layout);
  window.dispatchEvent(new Event('nav-layout-change'));
}

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const allTabs = [
  { id: 'home' as const, label: 'Today', icon: Calendar },
  { id: 'menu' as const, label: 'Menu', icon: Utensils },
  { id: 'classes' as const, label: 'Classes', icon: Book },
  { id: 'bragsheet' as const, label: 'Brag Sheet', icon: Trophy },
  { id: 'portfolio' as const, label: 'Portfolio', icon: Target },
  { id: 'tasks' as const, label: 'Tasks', icon: CheckSquare },
  { id: 'discuss' as const, label: 'Community', icon: Users },
  { id: 'study' as const, label: 'Study Hall', icon: BookOpen },
  { id: 'chat' as const, label: 'AI Chat', icon: MessageCircle },
  { id: 'tutor' as const, label: 'Tutors', icon: GraduationCap },
  { id: 'profiles' as const, label: 'Friends', icon: Users },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { isAdmin } = useUserRoles();
  const { isPresentationMode, togglePresentationMode, canAccessPresentationMode } = usePresentationMode();
  const [navLayout, setNavLayoutState] = useState<NavLayout>(getNavLayout());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handler = () => setNavLayoutState(getNavLayout());
    window.addEventListener('nav-layout-change', handler);
    return () => window.removeEventListener('nav-layout-change', handler);
  }, []);

  const primaryTabs = allTabs.slice(0, 5);
  const secondaryTabs = allTabs.slice(5, 11); // exclude settings

  const handleTabChange = (tab: TabType) => {
    onTabChange(tab);
    setSidebarOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container py-3">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {navLayout === 'sidebar' && (
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <ThemeLogo size="md" />
                      <div>
                        <h2 className="font-display font-bold text-lg">LunchLIT</h2>
                        <p className="text-xs text-muted-foreground">Your school companion</p>
                      </div>
                    </div>
                  </div>
                  <nav className="flex flex-col gap-1 p-3">
                    {allTabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabChange(tab.id)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                    {isAdmin && (
                      <>
                        <div className="h-px bg-border my-2" />
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Shield className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      </>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            )}
            <button onClick={() => onTabChange('home')} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <ThemeLogo size="md" />
              <div className="hidden sm:block">
                <h1 className="font-display font-bold text-lg text-foreground leading-tight text-left">LunchLIT</h1>
                <p className="text-xs text-muted-foreground">Your school companion</p>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {user && <NotificationBell />}
            {user ? (
              <DropdownMenu>
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
                  {canAccessPresentationMode && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={togglePresentationMode}>
                        <Presentation className="w-4 h-4 mr-2" />
                        {isPresentationMode ? '✅ Test Mode On' : 'Test Mode'}
                      </DropdownMenuItem>
                    </>
                  )}
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
              </DropdownMenu>
            ) : (
              <Button variant="default" size="sm" asChild>
                <Link to="/auth">
                  <LogIn className="h-4 w-4 mr-1" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Navigation - Tab Mode */}
        {navLayout === 'tabs' && (
          <nav className="flex gap-1 mt-3 bg-secondary/50 p-1 rounded-xl">
            {primaryTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    isActive ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}

            {/* More dropdown for secondary tabs */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    secondaryTabs.some((t) => t.id === activeTab)
                      ? 'bg-card text-foreground shadow-card'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                  }`}
                >
                  <span className="text-lg">•••</span>
                  <span className="hidden sm:inline">More</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {secondaryTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <DropdownMenuItem
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={activeTab === tab.id ? 'bg-secondary' : ''}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        )}
      </div>
    </header>
  );
}
