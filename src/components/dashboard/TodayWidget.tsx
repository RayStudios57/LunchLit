import { useTasks } from '@/hooks/useTasks';
import { useClassSchedule } from '@/hooks/useClassSchedule';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';
import { format, isToday, isBefore, parseISO } from 'date-fns';

interface TimelineItem {
  id: string;
  type: 'class' | 'task';
  title: string;
  time: Date;
  subtitle?: string;
  priority?: string;
  isCompleted?: boolean;
  color?: string;
}

export function TodayWidget() {
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { classes, isLoading: classesLoading } = useClassSchedule();

  const isLoading = tasksLoading || classesLoading;

  // Get today's day of week (0 = Sunday, 1 = Monday, etc.)
  const today = new Date();
  const dayOfWeek = today.getDay();

  // Build timeline items
  const timelineItems: TimelineItem[] = [];

  // Add today's classes
  classes
    .filter(cls => cls.day_of_week === dayOfWeek)
    .forEach(cls => {
      const [hours, minutes] = cls.start_time.split(':').map(Number);
      const classTime = new Date(today);
      classTime.setHours(hours, minutes, 0, 0);

      timelineItems.push({
        id: cls.id,
        type: 'class',
        title: cls.class_name,
        time: classTime,
        subtitle: cls.room_number ? `Room ${cls.room_number}` : cls.teacher_name || undefined,
        color: cls.color,
      });
    });

  // Add tasks due today or overdue
  tasks
    .filter(task => !task.is_completed)
    .filter(task => {
      if (!task.due_date) return false;
      const dueDate = parseISO(task.due_date);
      return isToday(dueDate) || isBefore(dueDate, today);
    })
    .forEach(task => {
      const dueDate = parseISO(task.due_date!);
      let taskTime = dueDate;
      
      if (task.due_time) {
        const [hours, minutes] = task.due_time.split(':').map(Number);
        taskTime = new Date(dueDate);
        taskTime.setHours(hours, minutes, 0, 0);
      }

      timelineItems.push({
        id: task.id,
        type: 'task',
        title: task.title,
        time: taskTime,
        priority: task.priority,
        isCompleted: task.is_completed,
        subtitle: isToday(dueDate) ? undefined : 'Overdue',
      });
    });

  // Sort by time
  timelineItems.sort((a, b) => a.time.getTime() - b.time.getTime());

  // Only show upcoming items (within next 12 hours or past due)
  const now = new Date();
  const upcomingItems = timelineItems.filter(item => {
    const timeDiff = item.time.getTime() - now.getTime();
    const hoursAway = timeDiff / (1000 * 60 * 60);
    return hoursAway <= 12 || item.subtitle === 'Overdue';
  }).slice(0, 5);

  if (isLoading) {
    return (
      <Card className="card-elevated animate-pulse">
        <CardHeader className="pb-3">
          <div className="h-6 bg-muted rounded w-24" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Today at a Glance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingItems.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-success" />
            <p className="font-medium">All caught up!</p>
            <p className="text-sm">No upcoming classes or tasks</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingItems.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg bg-secondary/50 transition-all animate-fade-up`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: item.type === 'class' 
                      ? item.color || 'hsl(var(--primary))' 
                      : item.priority === 'high' 
                        ? 'hsl(var(--destructive))' 
                        : 'hsl(var(--accent))',
                  }}
                >
                  {item.type === 'class' ? (
                    <BookOpen className="w-5 h-5 text-primary-foreground" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-primary-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(item.time, 'h:mm a')}
                    {item.subtitle && ` • ${item.subtitle}`}
                  </p>
                </div>
                {item.priority && (
                  <Badge 
                    variant={item.priority === 'high' ? 'destructive' : 'secondary'}
                    className="shrink-0"
                  >
                    {item.priority}
                  </Badge>
                )}
                {item.type === 'class' && (
                  <Badge variant="outline" className="shrink-0">Class</Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
