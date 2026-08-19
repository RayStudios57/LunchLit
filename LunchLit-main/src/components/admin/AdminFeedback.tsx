import { useSuggestions } from '@/hooks/useSuggestions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'planned', label: 'Planned' },
  { value: 'completed', label: 'Completed' },
  { value: 'declined', label: 'Declined' },
];

export function AdminFeedback() {
  const { suggestions, isLoading } = useSuggestions();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = async (suggestion: { id: string; title: string; user_id: string | null; status: string }, newStatus: string) => {
    if (newStatus === suggestion.status) return;

    const { error } = await supabase
      .from('user_suggestions')
      .update({ status: newStatus })
      .eq('id', suggestion.id);

    if (error) {
      toast({ title: 'Error updating status', description: error.message, variant: 'destructive' });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['user-suggestions'] });
    toast({ title: 'Status updated' });

    // Send email notification if user exists
    if (suggestion.user_id) {
      try {
        await supabase.functions.invoke('send-feedback-notification', {
          body: {
            suggestionTitle: suggestion.title,
            newStatus,
            userId: suggestion.user_id,
          },
        });
      } catch (err) {
        console.error('Failed to send feedback notification:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          User Feedback ({suggestions.length})
        </CardTitle>
        <CardDescription>Review and manage user suggestions. Status changes trigger an email to the user.</CardDescription>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">No feedback submitted yet</p>
        ) : (
          <div className="space-y-3">
            {suggestions.map(suggestion => (
              <Card key={suggestion.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{suggestion.title}</h4>
                      {suggestion.description && (
                        <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {suggestion.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(suggestion.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    <Select
                      value={suggestion.status}
                      onValueChange={(value) => handleStatusChange(suggestion, value)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
