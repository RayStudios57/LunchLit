import { useState } from 'react';
import { useSuggestions } from '@/hooks/useSuggestions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lightbulb, Send, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const categories = [
  { value: 'feature', label: 'New Feature' },
  { value: 'improvement', label: 'Improvement' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'other', label: 'Other' },
];

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3 text-yellow-500" />,
  reviewed: <Sparkles className="h-3 w-3 text-blue-500" />,
  implemented: <CheckCircle className="h-3 w-3 text-green-500" />,
};

export function SuggestionsSection() {
  const { suggestions, isLoading, submitSuggestion, isAuthenticated } = useSuggestions();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('feature');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    submitSuggestion.mutate(
      { title, description, category },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
          setCategory('feature');
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Suggestions & Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <Input
                placeholder="Your suggestion or idea..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
              />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Add more details (optional)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
            <Button type="submit" disabled={!title.trim() || submitSuggestion.isPending} className="gap-2">
              <Send className="h-4 w-4" />
              Submit Suggestion
            </Button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Sign in to submit suggestions and help improve LunchLit!
          </p>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <p className="text-sm font-medium text-muted-foreground">Recent Suggestions</p>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {suggestions.slice(0, 10).map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-3 rounded-lg bg-secondary/30 space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{suggestion.title}</p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {statusIcons[suggestion.status]}
                      <span className="text-xs text-muted-foreground capitalize">{suggestion.status}</span>
                    </div>
                  </div>
                  {suggestion.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{suggestion.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary capitalize">
                      {suggestion.category}
                    </span>
                    <span>{format(new Date(suggestion.created_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
