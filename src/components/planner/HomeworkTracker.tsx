import { useTasks } from '@/hooks/useTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format, isToday, isTomorrow, isPast, addDays, startOfDay } from 'date-fns';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export function HomeworkTracker() {
  const { tasks } = useTasks();
  
  const homeworkTasks = tasks.filter(t => t.category === 'homework' || t.category === 'test' || t.category === 'project');
  const upcomingHomework = homeworkTasks.filter(t => !t.is_completed);
  const completedHomework = homeworkTasks.filter(t => t.is_completed);
  
  const overdue = upcomingHomework.filter(t => 
    t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))
  );
  const dueToday = upcomingHomework.filter(t => t.due_date && isToday(new Date(t.due_date)));
  const dueTomorrow = upcomingHomework.filter(t => t.due_date && isTomorrow(new Date(t.due_date)));
  const dueThisWeek = upcomingHomework.filter(t => {
    if (!t.due_date) return false;
    const dueDate = new Date(t.due_date);
    const weekFromNow = addDays(startOfDay(new Date()), 7);
    return dueDate > addDays(startOfDay(new Date()), 1) && dueDate <= weekFromNow;
  });

  const completionRate = homeworkTasks.length > 0 
    ? Math.round((completedHomework.length / homeworkTasks.length) * 100) 
    : 0;

  const categoryIcons = {
    homework: '📚',
    test: '📝',
    project: '🎨',
    general: '📌',
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2">
          <span className="text-xl">📖</span>
          Homework Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Completion Rate</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completedHomework.length} completed</span>
            <span>{upcomingHomework.length} remaining</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className={`p-3 rounded-lg text-center ${overdue.length > 0 ? 'bg-destructive/10' : 'bg-muted/50'}`}>
            <AlertTriangle className={`h-4 w-4 mx-auto mb-1 ${overdue.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
            <p className="text-lg font-bold">{overdue.length}</p>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </div>
          <div className={`p-3 rounded-lg text-center ${dueToday.length > 0 ? 'bg-warning/10' : 'bg-muted/50'}`}>
            <Clock className={`h-4 w-4 mx-auto mb-1 ${dueToday.length > 0 ? 'text-warning' : 'text-muted-foreground'}`} />
            <p className="text-lg font-bold">{dueToday.length}</p>
            <p className="text-xs text-muted-foreground">Due Today</p>
          </div>
          <div className="p-3 rounded-lg text-center bg-muted/50">
            <CheckCircle className="h-4 w-4 mx-auto mb-1 text-success" />
            <p className="text-lg font-bold">{completedHomework.length}</p>
            <p className="text-xs text-muted-foreground">Done</p>
          </div>
        </div>

        {/* Upcoming Assignments */}
        <div className="space-y-3">
          {overdue.length > 0 && (
            <div>
              <p className="text-sm font-medium text-destructive mb-2">⚠️ Overdue</p>
              {overdue.map((task) => (
                <HomeworkItem key={task.id} task={task} categoryIcons={categoryIcons} isOverdue />
              ))}
            </div>
          )}
          
          {dueToday.length > 0 && (
            <div>
              <p className="text-sm font-medium text-warning mb-2">🔔 Due Today</p>
              {dueToday.map((task) => (
                <HomeworkItem key={task.id} task={task} categoryIcons={categoryIcons} />
              ))}
            </div>
          )}
          
          {dueTomorrow.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">📅 Due Tomorrow</p>
              {dueTomorrow.map((task) => (
                <HomeworkItem key={task.id} task={task} categoryIcons={categoryIcons} />
              ))}
            </div>
          )}
          
          {dueThisWeek.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">📆 This Week</p>
              {dueThisWeek.map((task) => (
                <HomeworkItem key={task.id} task={task} categoryIcons={categoryIcons} />
              ))}
            </div>
          )}

          {upcomingHomework.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
              <p>All caught up! No pending assignments.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function HomeworkItem({ 
  task, 
  categoryIcons, 
  isOverdue 
}: { 
  task: any; 
  categoryIcons: Record<string, string>; 
  isOverdue?: boolean;
}) {
  return (
    <div className={`p-3 rounded-lg bg-card border mb-2 ${isOverdue ? 'border-destructive/50' : 'border-border'}`}>
      <div className="flex items-start gap-2">
        <span>{categoryIcons[task.category as keyof typeof categoryIcons]}</span>
        <div className="flex-1">
          <p className="font-medium text-sm">{task.title}</p>
          {task.due_date && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {format(new Date(task.due_date), 'EEEE, MMM d')}
            </p>
          )}
        </div>
        <Badge 
          variant="outline" 
          className={`text-xs ${
            task.priority === 'high' ? 'bg-destructive/10 text-destructive border-destructive/30' :
            task.priority === 'medium' ? 'bg-warning/10 text-warning border-warning/30' :
            'bg-success/10 text-success border-success/30'
          }`}
        >
          {task.priority}
        </Badge>
      </div>
    </div>
  );
}
