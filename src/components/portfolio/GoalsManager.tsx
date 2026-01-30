import { useState } from 'react';
import { useStudentGoals, StudentGoal, StudentGoalInsert } from '@/hooks/useStudentGoals';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Trash2, Edit2, GraduationCap, Briefcase, Lightbulb, User, Check } from 'lucide-react';

const goalTypeIcons = {
  college: GraduationCap,
  career: Briefcase,
  program: Lightbulb,
  personal: User,
};

const goalTypeLabels = {
  college: 'College',
  career: 'Career',
  program: 'Program',
  personal: 'Personal',
};

export function GoalsManager() {
  const { goals, goalsByType, addGoal, updateGoal, deleteGoal, isLoading } = useStudentGoals();
  const [isAdding, setIsAdding] = useState(false);
  const [editingGoal, setEditingGoal] = useState<StudentGoal | null>(null);
  const [formData, setFormData] = useState<StudentGoalInsert>({
    title: '',
    description: '',
    goal_type: 'college',
    target_date: null,
    status: 'in_progress',
    priority: 'medium',
    notes: null,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      goal_type: 'college',
      target_date: null,
      status: 'in_progress',
      priority: 'medium',
      notes: null,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingGoal) {
      await updateGoal.mutateAsync({ id: editingGoal.id, ...formData });
      setEditingGoal(null);
    } else {
      await addGoal.mutateAsync(formData);
      setIsAdding(false);
    }
    resetForm();
  };

  const openEdit = (goal: StudentGoal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      goal_type: goal.goal_type,
      target_date: goal.target_date,
      status: goal.status,
      priority: goal.priority,
      notes: goal.notes,
    });
  };

  const GoalForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Goal Title *</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Get accepted to MIT"
          required
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your goal..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Type</Label>
          <Select 
            value={formData.goal_type} 
            onValueChange={(v) => setFormData({ ...formData, goal_type: v as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="college">College</SelectItem>
              <SelectItem value="career">Career</SelectItem>
              <SelectItem value="program">Program</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Priority</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(v) => setFormData({ ...formData, priority: v as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(v) => setFormData({ ...formData, status: v as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Target Date</Label>
          <Input
            type="date"
            value={formData.target_date || ''}
            onChange={(e) => setFormData({ ...formData, target_date: e.target.value || null })}
          />
        </div>
      </div>

      <div>
        <Label>Notes</Label>
        <Textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes..."
          rows={2}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={addGoal.isPending || updateGoal.isPending}>
          {editingGoal ? 'Update Goal' : 'Add Goal'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setIsAdding(false);
            setEditingGoal(null);
            resetForm();
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Your Goals</h3>
          <p className="text-sm text-muted-foreground">Plan and track your college, career, and personal goals</p>
        </div>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Goal</DialogTitle>
            </DialogHeader>
            <GoalForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingGoal} onOpenChange={(open) => !open && setEditingGoal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          <GoalForm />
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">No goals yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Start planning your future!</p>
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Goal
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(goalTypeLabels).map(([type, label]) => {
            const typeGoals = goalsByType[type] || [];
            if (typeGoals.length === 0) return null;

            const Icon = goalTypeIcons[type as keyof typeof goalTypeIcons];

            return (
              <div key={type}>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary" />
                  {label} Goals
                  <Badge variant="secondary" className="text-xs">{typeGoals.length}</Badge>
                </h4>
                <div className="space-y-2">
                  {typeGoals.map((goal) => (
                    <Card key={goal.id} className={`${goal.status === 'completed' ? 'opacity-60' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className={`font-medium ${goal.status === 'completed' ? 'line-through' : ''}`}>
                                {goal.title}
                              </h5>
                              {goal.status === 'completed' && (
                                <Check className="w-4 h-4 text-success" />
                              )}
                            </div>
                            {goal.description && (
                              <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  goal.priority === 'high' ? 'bg-destructive/10 text-destructive border-destructive/30' :
                                  goal.priority === 'medium' ? 'bg-warning/10 text-warning border-warning/30' :
                                  'bg-secondary'
                                }`}
                              >
                                {goal.priority} priority
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  goal.status === 'completed' ? 'bg-success/10 text-success' :
                                  goal.status === 'paused' ? 'bg-muted' : ''
                                }`}
                              >
                                {goal.status.replace('_', ' ')}
                              </Badge>
                              {goal.target_date && (
                                <Badge variant="outline" className="text-xs">
                                  Target: {new Date(goal.target_date).toLocaleDateString()}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => openEdit(goal)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteGoal.mutate(goal.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
