import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useSchools } from '@/hooks/useSchools';
import { useTheme, ThemeName, ColorMode } from '@/contexts/ThemeContext';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Camera, Sun, Moon, Monitor, Check, Palette, School, GraduationCap, User, Calendar, Trash2, Download, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const GRADE_LEVELS = [
  { value: 'under_5th', label: 'Under 5th Grade' },
  { value: 'middle_school', label: 'Middle School' },
  { value: 'freshman', label: 'Freshman (9th)' },
  { value: 'sophomore', label: 'Sophomore (10th)' },
  { value: 'junior', label: 'Junior (11th)' },
  { value: 'senior', label: 'Senior (12th)' },
];

export function SettingsView() {
  const { user, signOut } = useAuth();
  const { profile, updateProfile, uploadAvatar } = useProfile();
  const { schools } = useSchools();
  const { theme, colorMode, setTheme, setColorMode, themes } = useTheme();
  const { exportToCalendar, isExporting, hasEvents } = useGoogleCalendar();
  const { toast } = useToast();
  
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
      toast({ title: 'Invalid file', description: 'Please upload an image file', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please upload an image under 5MB', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      await uploadAvatar(file);
      toast({ title: 'Avatar updated!' });
    } catch (error) {
      toast({ title: 'Upload failed', description: 'Please try again', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveName = async () => {
    await updateProfile.mutateAsync({ full_name: fullName });
  };

  const handleSchoolChange = async (schoolId: string) => {
    await updateProfile.mutateAsync({ school_id: schoolId });
  };

  const handleGradeChange = async (grade: string) => {
    await updateProfile.mutateAsync({ grade_level: grade });
  };

  const handleCalendarSyncToggle = async (enabled: boolean) => {
    setCalendarSyncEnabled(enabled);
    await updateProfile.mutateAsync({ calendar_sync_enabled: enabled });
    toast({
      title: enabled ? 'Calendar sync enabled' : 'Calendar sync disabled',
      description: enabled ? 'Export your schedule to import into Google Calendar' : 'Calendar sync has been turned off',
    });
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Delete user data
      if (user) {
        await supabase.from('tasks').delete().eq('user_id', user.id);
        await supabase.from('class_schedules').delete().eq('user_id', user.id);
        await supabase.from('chat_messages').delete().eq('user_id', user.id);
        await supabase.from('discussions').delete().eq('user_id', user.id);
        await supabase.from('profiles').delete().eq('user_id', user.id);
        await supabase.from('user_preferences').delete().eq('user_id', user.id);
      }
      
      // Sign out
      await signOut();
      
      toast({
        title: 'Account deleted',
        description: 'Your account and all data have been removed.',
      });
    } catch (error) {
      toast({
        title: 'Error deleting account',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please sign in to access settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-up">
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
              <button
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                disabled={isUploading}
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
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
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
              <Button onClick={handleSaveName} disabled={updateProfile.isPending}>
                Save
              </Button>
            </div>
          </div>

          <Separator />

          {/* Grade Level */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Grade Level
            </Label>
            <Select value={profile?.grade_level || ''} onValueChange={handleGradeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select your grade" />
              </SelectTrigger>
              <SelectContent>
                {GRADE_LEVELS.map(grade => (
                  <SelectItem key={grade.value} value={grade.value}>
                    {grade.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                {schools.map(school => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
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
              {[
                { mode: 'light' as ColorMode, icon: Sun, label: 'Light' },
                { mode: 'dark' as ColorMode, icon: Moon, label: 'Dark' },
                { mode: 'system' as ColorMode, icon: Monitor, label: 'System' },
              ].map(({ mode, icon: Icon, label }) => (
                <Button
                  key={mode}
                  variant={colorMode === mode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setColorMode(mode)}
                  className="flex-1"
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Theme Selection */}
          <div className="space-y-3">
            <Label>Theme</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`relative p-3 rounded-lg border-2 transition-all ${
                    theme === t.id 
                      ? 'border-primary shadow-glow' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex gap-1 mb-2">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: `hsl(${t.colors.primary})` }}
                    />
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: `hsl(${t.colors.accent})` }}
                    />
                  </div>
                  <p className="text-xs font-medium text-left">{t.name}</p>
                  {theme === t.id && (
                    <Check className="absolute top-2 right-2 w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

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
              <p className="text-sm text-muted-foreground">
                Export your classes and tasks to import into Google Calendar
              </p>
            </div>
            <Switch
              checked={calendarSyncEnabled}
              onCheckedChange={handleCalendarSyncToggle}
            />
          </div>

          {calendarSyncEnabled && (
            <div className="pt-2">
              <Button
                onClick={exportToCalendar}
                disabled={isExporting || !hasEvents}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export Calendar (.ics)'}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Download and import into Google Calendar, Apple Calendar, or Outlook
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
