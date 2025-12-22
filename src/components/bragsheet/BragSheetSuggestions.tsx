import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useBragSheet, BragCategory } from '@/hooks/useBragSheet';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sparkles, Plus, Check, X, Lightbulb } from 'lucide-react';
import { BragSheetEntryForm } from './BragSheetEntryForm';

interface Suggestion {
  id: string;
  title: string;
  category: BragCategory;
  description: string;
  source: 'task' | 'milestone';
  taskId?: string;
}

// Calculate school year
const getCurrentSchoolYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month >= 7) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
};

export function BragSheetSuggestions() {
  const { tasks } = useTasks();
  const { entries, addEntry } = useBragSheet();
  const { profile } = useProfile();
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);

  // Generate suggestions from completed tasks
  const generateSuggestions = (): Suggestion[] => {
    const suggestions: Suggestion[] = [];
    const existingTitles = new Set(entries.map(e => e.title.toLowerCase()));

    // Filter completed tasks that might be brag-worthy
    const completedTasks = tasks.filter(task => task.is_completed);
    
    // Look for project tasks
    const projectTasks = completedTasks.filter(
      task => task.category === 'project' && !existingTitles.has(task.title.toLowerCase())
    );
    
    projectTasks.forEach(task => {
      if (!dismissedSuggestions.has(task.id)) {
        suggestions.push({
          id: task.id,
          title: task.title,
          category: 'academic',
          description: task.description || 'Completed school project',
          source: 'task',
          taskId: task.id,
        });
      }
    });

    // Look for repeated tasks (milestone patterns)
    const taskCounts = completedTasks.reduce((acc, task) => {
      const key = task.title.toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(taskCounts).forEach(([title, count]) => {
      if (count >= 3 && !existingTitles.has(title)) {
        const sampleTask = completedTasks.find(t => t.title.toLowerCase() === title);
        if (sampleTask && !dismissedSuggestions.has(`milestone-${title}`)) {
          suggestions.push({
            id: `milestone-${title}`,
            title: `${sampleTask.title} (Consistent Activity)`,
            category: 'extracurricular',
            description: `Completed ${count} times - shows dedication and consistency`,
            source: 'milestone',
          });
        }
      }
    });

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  };

  const suggestions = generateSuggestions();

  const handleDismiss = (suggestionId: string) => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
  };

  const handleQuickAdd = async (suggestion: Suggestion) => {
    try {
      await addEntry.mutateAsync({
        title: suggestion.title,
        category: suggestion.category,
        description: suggestion.description,
        impact: null,
        start_date: null,
        end_date: null,
        is_ongoing: false,
        grade_level: profile?.grade_level || 'Unknown',
        school_year: getCurrentSchoolYear(),
        hours_spent: null,
        suggested_from_task_id: suggestion.taskId || null,
        is_auto_suggested: true,
      });
      setDismissedSuggestions(prev => new Set([...prev, suggestion.id]));
    } catch (error) {
      // Error handled by hook
    }
  };

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-12">
        <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-medium text-lg mb-2">No suggestions right now</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Complete more tasks and projects to get smart suggestions for your Brag Sheet. 
          We'll look for patterns like repeated activities or notable achievements.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-4">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm">
          Based on your completed tasks and activities
        </span>
      </div>

      {suggestions.map((suggestion) => (
        <Card key={suggestion.id} className="border-dashed border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{suggestion.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {suggestion.source === 'task' ? 'From Task' : 'Milestone'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                <Badge variant="secondary" className="mt-2 text-xs">
                  Suggested category: {suggestion.category}
                </Badge>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDismiss(suggestion.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedSuggestion(suggestion)}
                  className="text-primary"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Customize
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleQuickAdd(suggestion)}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={!!selectedSuggestion} onOpenChange={() => setSelectedSuggestion(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customize Suggestion</DialogTitle>
          </DialogHeader>
          {selectedSuggestion && (
            <BragSheetEntryForm
              onSuccess={() => {
                setSelectedSuggestion(null);
                setDismissedSuggestions(prev => new Set([...prev, selectedSuggestion.id]));
              }}
              suggestedData={{
                title: selectedSuggestion.title,
                category: selectedSuggestion.category,
                description: selectedSuggestion.description,
                grade_level: profile?.grade_level || undefined,
                school_year: getCurrentSchoolYear(),
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
