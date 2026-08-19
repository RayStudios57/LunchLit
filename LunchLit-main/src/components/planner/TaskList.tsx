import { useState } from 'react';
import { useTasks, Task } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Calendar, Clock } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

export function TaskList() {
  const { tasks, isLoading, addTask, updateTask, deleteTask } = useTasks();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<Task['category']>('general');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addTask.mutate({
      title: newTaskTitle,
      description: null,
      due_date: newTaskDueDate || null,
      due_time: null,
      is_completed: false,
      priority: newTaskPriority,
      category: newTaskCategory,
    });
    setNewTaskTitle('');
    setNewTaskDueDate('');
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
    const d = new Date(date);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return format(d, 'MMM d');
  };

  const incompleteTasks = tasks.filter(t => !t.is_completed);
  const completedTasks = tasks.filter(t => t.is_completed);

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2">
          <span className="text-xl">✅</span>
          Tasks & To-dos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Task Form */}
        <div className="space-y-3 p-4 bg-secondary/30 rounded-xl">
          <Input
            placeholder="What do you need to do?"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          />
          <div className="flex flex-wrap gap-2">
            <Select value={newTaskCategory} onValueChange={(v) => setNewTaskCategory(v as Task['category'])}>
              <SelectTrigger className="w-32">
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
              className="w-36"
            />
            <Button onClick={handleAddTask} size="icon" disabled={!newTaskTitle.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Task List */}
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
              {incompleteTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-lg bg-card border transition-all ${
                    task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date))
                      ? 'border-destructive/50'
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
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {categoryLabels[task.category]}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </Badge>
                      {task.due_date && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
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
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Completed ({completedTasks.length})</p>
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
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
