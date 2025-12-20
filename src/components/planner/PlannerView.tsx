import { TaskList } from './TaskList';
import { ClassSchedule } from './ClassSchedule';
import { HomeworkTracker } from './HomeworkTracker';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export function PlannerView() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">📋</span>
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">Sign in to use the Planner</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Create an account to save your tasks, class schedule, and track your homework progress.
        </p>
        <Button asChild>
          <Link to="/auth">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold mb-1">Your Planner</h2>
        <p className="text-muted-foreground">Manage your tasks, schedule, and homework</p>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <TaskList />
        </div>
        <div className="space-y-6">
          <ClassSchedule />
          <HomeworkTracker />
        </div>
      </div>
    </div>
  );
}
