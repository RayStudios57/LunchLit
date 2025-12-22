import { useState } from 'react';
import { useTasks, Task } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Trash2, Calendar, ChevronDown, ChevronRight, ListTodo, CheckCircle2 } from 'lucide-react';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

export function TasksView() {
  const { user } = useAuth();
  const { tasks, isLoading, addTask, updateTask, deleteTask } = useTasks();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<Task['category']>('general');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!user) {
    return (
      <div className="text-center py-12">
        <ListTodo className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="font-display text-xl font-semibold mb-2">Track Your Tasks</h2>
        <p className="text-muted-foreground">Sign in to manage your to-do list and stay organized.</p>
      </div>
    );
  }

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addTask.mutate({
      title: newTaskTitle,
      description: newTaskDescription || null,
      due_date: newTaskDueDate || null,
      due_time: null,
      is_completed: false,
      priority: newTaskPriority,
      category: newTaskCategory,
    });
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDueDate('');
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTask();
    }
  };

  const priorityColors = {
    low: 'bg-success/20 text-success border-success/30',
    medium: 'bg-warning/20 text-warning border-warning/30',
    high: 'bg-destructive/20 text-destructive border-destructive/30',
  };

  const categoryLabels = {
    homework: '📚 Homework',
    test: '📝 Test',
    project: '🎨 Project',
    general: '📌 General',
  };

  const formatDueDate = (date: string) => {
    const d = parseISO(date);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return format(d, 'MMM d');
  };

  const isOverdue = (date: string) => {
    const d = parseISO(date);
    return isPast(d) && !isToday(d);
  };

  const incompleteTasks = tasks.filter(t => !t.is_completed);
  const completedTasks = tasks.filter(t => t.is_completed);

  // Sort incomplete tasks: overdue first, then by due date
  const sortedIncompleteTasks = [...incompleteTasks].sort((a, b) => {
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    if (a.due_date) return -1;
    if (b.due_date) return 1;
    return 0;
  });

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Quick Add Section */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="font-display flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-primary" />
            Add New Task
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Input */}
          <div className="flex gap-2">
            <Input
              placeholder="What do you need to do?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button 
              onClick={handleAddTask} 
              disabled={!newTaskTitle.trim() || addTask.isPending}
              className="px-4"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          {/* Expandable Options */}
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                {isExpanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                More options
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              <Textarea
                placeholder="Add description (optional)"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex flex-wrap gap-2">
                <Select value={newTaskCategory} onValueChange={(v) => setNewTaskCategory(v as Task['category'])}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homework">📚 Homework</SelectItem>
                    <SelectItem value="test">📝 Test</SelectItem>
                    <SelectItem value="project">🎨 Project</SelectItem>
                    <SelectItem value="general">📌 General</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as Task['priority'])}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-40"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Your Tasks
              {incompleteTasks.length > 0 && (
                <Badge variant="secondary" className="ml-2">{incompleteTasks.length}</Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No tasks yet. Add your first task above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Incomplete Tasks */}
              <div className="space-y-2">
                {sortedIncompleteTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 p-3 rounded-lg bg-card border transition-all hover:shadow-sm ${
                      task.due_date && isOverdue(task.due_date)
                        ? 'border-destructive/50 bg-destructive/5'
                        : 'border-border'
                    }`}
                  >
                    <Checkbox
                      checked={task.is_completed}
                      onCheckedChange={(checked) => 
                        updateTask.mutate({ id: task.id, is_completed: !!checked })
                      }
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{task.title}</p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {categoryLabels[task.category]}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </Badge>
                        {task.due_date && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs flex items-center gap-1 ${isOverdue(task.due_date) ? 'text-destructive border-destructive/30' : ''}`}
                          >
                            <Calendar className="h-3 w-3" />
                            {formatDueDate(task.due_date)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask.mutate(task.id)}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <Collapsible open={showCompleted} onOpenChange={setShowCompleted}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-muted-foreground w-full justify-start">
                      {showCompleted ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                      Completed ({completedTasks.length})
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pt-2">
                    {completedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border opacity-60"
                      >
                        <Checkbox
                          checked={task.is_completed}
                          onCheckedChange={(checked) => 
                            updateTask.mutate({ id: task.id, is_completed: !!checked })
                          }
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-through">{task.title}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTask.mutate(task.id)}
                          className="text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
