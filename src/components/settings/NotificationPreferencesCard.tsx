import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Utensils, Users, GraduationCap, MessageSquare, Clock } from 'lucide-react';

const notificationTypes = [
  {
    key: 'new_menu_items' as const,
    label: 'New Menu Items',
    description: 'Get notified when new lunch menu items are added',
    icon: Utensils,
  },
  {
    key: 'study_hall_availability' as const,
    label: 'Study Hall Availability',
    description: 'Get notified when study halls open up',
    icon: Users,
  },
  {
    key: 'grade_progression' as const,
    label: 'Grade Progression',
    description: 'Reminders about grade progression and graduation',
    icon: GraduationCap,
  },
  {
    key: 'discussion_replies' as const,
    label: 'Discussion Replies',
    description: 'Get notified when someone replies to your discussions',
    icon: MessageSquare,
  },
  {
    key: 'task_reminders' as const,
    label: 'Task Reminders',
    description: 'Reminders for upcoming due dates',
    icon: Clock,
  },
];

export function NotificationPreferencesCard() {
  const { preferences, isLoading, updatePreferences } = useNotificationPreferences();

  const handleToggle = (key: keyof typeof preferences, value: boolean) => {
    updatePreferences.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <Card className="card-elevated animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-2/3 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose what notifications you want to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {notificationTypes.map(({ key, label, description, icon: Icon }) => (
          <div
            key={key}
            className="flex items-center justify-between py-3 border-b border-border last:border-0"
          >
            <div className="flex items-start gap-3">
              <Icon className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <Label htmlFor={key} className="font-medium cursor-pointer">
                  {label}
                </Label>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            <Switch
              id={key}
              checked={preferences[key] ?? true}
              onCheckedChange={(value) => handleToggle(key, value)}
              disabled={updatePreferences.isPending}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
