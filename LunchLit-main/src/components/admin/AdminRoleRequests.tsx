import { useRoleRequests } from '@/hooks/useRoleRequests';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function AdminRoleRequests() {
  const { allRequests, isLoading, reviewRequest } = useRoleRequests();
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingRequests = allRequests.filter(r => r.status === 'pending');
  const reviewedRequests = allRequests.filter(r => r.status !== 'pending');

  const handleReview = (requestId: string, status: 'approved' | 'rejected') => {
    reviewRequest.mutate({
      requestId,
      status,
      adminNotes: notesMap[requestId] || undefined,
    });
    setNotesMap(prev => {
      const next = { ...prev };
      delete next[requestId];
      return next;
    });
  };

  const handleDelete = async (requestId: string) => {
    const { error } = await supabase
      .from('role_upgrade_requests')
      .delete()
      .eq('id', requestId);

    if (error) {
      toast({ title: 'Error deleting request', description: error.message, variant: 'destructive' });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['all-role-requests'] });
    queryClient.invalidateQueries({ queryKey: ['my-role-requests'] });
    toast({ title: 'Request deleted' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Role Requests ({pendingRequests.length})</CardTitle>
          <CardDescription>Review and approve or reject user role upgrade requests</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No pending requests</p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map(request => (
                <Card key={request.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">Requesting: {request.requested_role}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          User: {request.user_id.slice(0, 8)}… · {format(new Date(request.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/30">
                          Pending
                        </Badge>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete request?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently delete this role upgrade request.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(request.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-md p-3">
                      <p className="text-sm font-medium mb-1">Reason:</p>
                      <p className="text-sm text-muted-foreground">{request.reason}</p>
                    </div>

                    <Textarea
                      placeholder="Admin notes (optional)..."
                      value={notesMap[request.id] || ''}
                      onChange={e => setNotesMap(prev => ({ ...prev, [request.id]: e.target.value }))}
                      className="text-sm"
                      rows={2}
                    />

                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReview(request.id, 'rejected')}
                        disabled={reviewRequest.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReview(request.id, 'approved')}
                        disabled={reviewRequest.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {reviewedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Decisions</CardTitle>
            <CardDescription>Previously reviewed role requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reviewedRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <span className="font-medium text-sm">{request.requested_role}</span>
                    <p className="text-xs text-muted-foreground">
                      {request.user_id.slice(0, 8)}… · {format(new Date(request.created_at), 'MMM d, yyyy')}
                    </p>
                    {request.admin_notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">"{request.admin_notes}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                      {request.status === 'approved' ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                      {request.status}
                    </Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete request?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently delete this role request record.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(request.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
