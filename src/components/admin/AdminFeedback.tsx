import { useSuggestions } from '@/hooks/useSuggestions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30' },
  { value: 'reviewed', label: 'Reviewed', color: 'bg-blue-500/10 text-blue-700 border-blue-500/30' },
  { value: 'planned', label: 'Planned', color: 'bg-purple-500/10 text-purple-700 border-purple-500/30' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500/10 text-green-700 border-green-500/30' },
  { value: 'declined', label: 'Declined', color: 'bg-red-500/10 text-red-700 border-red-500/30' },
];

export function AdminFeedback() {
  const { suggestions, isLoading } = useSuggestions();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('user_suggestions')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error updating status', description: error.message, variant: 'destructive' });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['user-suggestions'] });
    toast({ title: 'Status updated' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusConfig = (status: string) =>
    STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          User Feedback ({suggestions.length})
        </CardTitle>
        <CardDescription>Review and manage user suggestions and feedback</CardDescription>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">No feedback submitted yet</p>
        ) : (
          <div className="space-y-3">
            {suggestions.map(suggestion => {
              const statusConfig = getStatusConfig(suggestion.status);
              return (
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
                        onValueChange={(value) => handleStatusChange(suggestion.id, value)}
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
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
