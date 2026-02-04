import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useSchools } from '@/hooks/useSchools';
import { useTheme, ThemeName, ColorMode } from '@/contexts/ThemeContext';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { useGradeProgression } from '@/hooks/useGradeProgression';
import { usePresentationMode } from '@/contexts/PresentationModeContext';
import { GRADE_OPTIONS, GRADE_DISPLAY } from '@/config/grades';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Camera, Sun, Moon, Monitor, Check, Palette, School, GraduationCap, User, Calendar, Trash2, Download, AlertTriangle, ChevronUp, ChevronDown, RotateCcw, Presentation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { NotificationPreferencesCard } from './NotificationPreferencesCard';
import { UserRolesCard } from './UserRolesCard';

export function SettingsView() {
  const {
    user,
    signOut
  } = useAuth();
  const {
    profile,
    updateProfile,
    uploadAvatar
  } = useProfile();
  const {
    schools
  } = useSchools();
  const {
    theme,
    colorMode,
    setTheme,
    setColorMode,
    themes
  } = useTheme();
  const {
    exportToCalendar,
    isExporting,
    hasEvents
  } = useGoogleCalendar();
  const {
    nextGrade,
    previousGrade,
    progressGrade,
    revertGrade,
    undoGraduation,
  } = useGradeProgression();
  const {
    isPresentationMode,
    togglePresentationMode,
    canAccessPresentationMode,
  } = usePresentationMode();
  const {
    toast
  } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isDeleting, setIsDeleting] = useState(false);
  const [calendarSyncEnabled, setCalendarSyncEnabled] = useState(profile?.calendar_sync_enabled || false);
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload an image file',
        variant: 'destructive'
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image under 5MB',
        variant: 'destructive'
      });
      return;
    }
    setIsUploading(true);
    try {
      await uploadAvatar(file);
      toast({
        title: 'Avatar updated!'
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };
  const handleSaveName = async () => {
    await updateProfile.mutateAsync({
      full_name: fullName
    });
  };
  const handleSchoolChange = async (schoolId: string) => {
    await updateProfile.mutateAsync({
      school_id: schoolId
    });
  };
  const handleGradeChange = async (grade: string) => {
    await updateProfile.mutateAsync({
      grade_level: grade
    });
  };
  const handleCalendarSyncToggle = async (enabled: boolean) => {
    setCalendarSyncEnabled(enabled);
    await updateProfile.mutateAsync({
      calendar_sync_enabled: enabled
    });
    toast({
      title: enabled ? 'Calendar sync enabled' : 'Calendar sync disabled',
      description: enabled ? 'Export your schedule to import into Google Calendar' : 'Calendar sync has been turned off'
    });
  };
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      if (!user) throw new Error('Not authenticated');
      
      // Get the current session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session');
      }
      
      // Call the delete-account edge function to properly delete the auth user
      const { error } = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) throw error;

      // Sign out locally
      await signOut();
      toast({
        title: 'Account deleted',
        description: 'Your account and all data have been removed.'
      });
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast({
        title: 'Error deleting account',
        description: error.message || 'Please try again or contact support.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };
  if (!user) {
    return <div className="text-center py-12">
        <p className="text-muted-foreground">Please sign in to access settings</p>
      </div>;
  }
  return <div className="space-y-6 max-w-2xl mx-auto animate-fade-up">
      {/* Profile Section */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile
          </CardTitle>
          <CardDescription>Manage your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20 cursor-pointer" onClick={handleAvatarClick}>
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {profile?.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <button onClick={handleAvatarClick} className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors" disabled={isUploading}>
                <Camera className="w-4 h-4" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>
            <div>
              <p className="font-medium">{profile?.full_name || 'No name set'}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="flex gap-2">
              <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" />
              <Button onClick={handleSaveName} disabled={updateProfile.isPending}>
                Save
              </Button>
            </div>
          </div>

          <Separator />

          {/* Grade Level with Manual Controls */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Grade Level
            </Label>
            
            {profile?.is_graduated ? (
              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      🎓 Graduated
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Congratulations on completing high school!
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/graduation">View Summary</Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={undoGraduation}>
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Undo
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Select value={profile?.grade_level || ''} onValueChange={handleGradeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_OPTIONS.map(grade => (
                      <SelectItem key={grade.value} value={grade.value}>
                        {grade.emoji} {grade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Manual Grade Progression Controls */}
                {profile?.grade_level && (
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-sm text-muted-foreground">Manual control:</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={revertGrade}
                      disabled={!previousGrade}
                    >
                      <ChevronDown className="w-4 h-4 mr-1" />
                      Previous Grade
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={progressGrade}
                    >
                      <ChevronUp className="w-4 h-4 mr-1" />
                      {nextGrade ? 'Next Grade' : 'Graduate'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* School Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <School className="w-4 h-4" />
              School
            </Label>
            <Select value={profile?.school_id || ''} onValueChange={handleSchoolChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select your school" />
              </SelectTrigger>
              <SelectContent>
                {schools.map(school => <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Theme Section */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how LunchLit looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Mode */}
          <div className="space-y-3">
            <Label>Color Mode</Label>
            <div className="flex gap-2">
              {[{
              mode: 'light' as ColorMode,
              icon: Sun,
              label: 'Light'
            }, {
              mode: 'dark' as ColorMode,
              icon: Moon,
              label: 'Dark'
            }, {
              mode: 'system' as ColorMode,
              icon: Monitor,
              label: 'System'
            }].map(({
              mode,
              icon: Icon,
              label
            }) => <Button key={mode} variant={colorMode === mode ? 'default' : 'outline'} size="sm" onClick={() => setColorMode(mode)} className="flex-1">
                  <Icon className="w-4 h-4 mr-1" />
                  {label}
                </Button>)}
            </div>
          </div>

          <Separator />

          {/* Theme Selection */}
          <div className="space-y-3">
            <Label>Theme</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {themes.map(t => <button key={t.id} onClick={() => setTheme(t.id)} className={`relative p-3 rounded-lg border-2 transition-all ${theme === t.id ? 'border-primary shadow-glow' : 'border-border hover:border-primary/50'}`}>
                  <div className="flex gap-1 mb-2">
                    <div className="w-6 h-6 rounded-full" style={{
                  backgroundColor: `hsl(${t.colors.primary})`
                }} />
                    <div className="w-6 h-6 rounded-full" style={{
                  backgroundColor: `hsl(${t.colors.accent})`
                }} />
                  </div>
                  <p className="text-xs font-medium text-left">{t.name}</p>
                  {theme === t.id && <Check className="absolute top-2 right-2 w-4 h-4 text-primary" />}
                </button>)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Roles & Permissions */}
      <UserRolesCard />

      {/* Notification Preferences */}
      <NotificationPreferencesCard />

      {/* Calendar Sync Section */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendar Integration
          </CardTitle>
          <CardDescription>Sync your schedule with external calendars</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Calendar Export</Label>
              <p className="text-sm text-muted-foreground">Export your classes and tasks into Google Calendar</p>
            </div>
            <Switch checked={calendarSyncEnabled} onCheckedChange={handleCalendarSyncToggle} />
          </div>

          {calendarSyncEnabled && <div className="pt-2">
              <Button onClick={exportToCalendar} disabled={isExporting || !hasEvents} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export Calendar (.ics)'}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Download and import into Google Calendar, Apple Calendar, or Outlook
              </p>
            </div>}
        </CardContent>
      </Card>

      {/* Presentation Mode - Admin Only */}
      {canAccessPresentationMode && (
        <Card className="card-elevated border-warning/30">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-warning">
              <Presentation className="w-5 h-5" />
              Presentation Mode
            </CardTitle>
            <CardDescription>Enable dummy data for demonstrations and presentations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Presentation Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Show dummy data across all tabs for demo purposes
                </p>
              </div>
              <Switch 
                checked={isPresentationMode} 
                onCheckedChange={togglePresentationMode} 
              />
            </div>
            {isPresentationMode && (
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-sm text-warning flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Presentation mode is active. All data shown is dummy data.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="card-elevated border-destructive/30">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data including tasks, schedules, and preferences.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>;
}