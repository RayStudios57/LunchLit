import { useState } from 'react';
import { useVerification, PendingVerification } from '@/hooks/useVerification';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User,
  Award,
  AlertCircle
} from 'lucide-react';

interface VerificationCardProps {
  entry: PendingVerification;
  onVerify: (entryId: string, status: 'verified' | 'rejected', notes?: string) => void;
  isLoading: boolean;
}

function VerificationCard({ entry, onVerify, isLoading }: VerificationCardProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');

  const handleReject = () => {
    onVerify(entry.id, 'rejected', rejectNotes);
    setShowRejectDialog(false);
    setRejectNotes('');
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{entry.student_name}</span>
                <Badge variant="secondary">{entry.student_grade}</Badge>
              </div>
              
              <h4 className="font-semibold text-lg">{entry.title}</h4>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">{entry.category}</Badge>
                <span className="text-sm text-muted-foreground">
                  {entry.school_year}
                </span>
                {entry.hours_spent && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {entry.hours_spent} hours
                  </span>
                )}
              </div>
              
              {entry.description && (
                <p className="text-sm text-muted-foreground mt-3">
                  {entry.description}
                </p>
              )}
              
              {entry.impact && (
                <p className="text-sm mt-2">
                  <span className="font-medium text-primary">Impact: </span>
                  {entry.impact}
                </p>
              )}
              
              {entry.start_date && (
                <p className="text-xs text-muted-foreground mt-2">
                  {format(new Date(entry.start_date), 'MMM yyyy')}
                  {entry.end_date && ` - ${format(new Date(entry.end_date), 'MMM yyyy')}`}
                  {entry.is_ongoing && ' - Present'}
                </p>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <Button 
                size="sm" 
                onClick={() => onVerify(entry.id, 'verified')}
                disabled={isLoading}
                className="gap-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                Verify
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowRejectDialog(true)}
                disabled={isLoading}
                className="gap-1 text-destructive hover:text-destructive"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please provide feedback for the student explaining why this entry was rejected.
            </p>
            <Textarea
              placeholder="Enter your feedback..."
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectNotes.trim()}
            >
              Reject Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function VerificationDashboard() {
  const { isVerifier } = useUserRoles();
  const { pendingEntries, isLoading, verifyEntry } = useVerification();

  const handleVerify = (entryId: string, status: 'verified' | 'rejected', notes?: string) => {
    verifyEntry.mutate({ entryId, status, notes });
  };

  if (!isVerifier) {
    return (
      <Card className="card-elevated">
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Verifier Access Required</h3>
          <p className="text-muted-foreground">
            You need to be registered as a teacher or counselor to access the verification dashboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Verification Dashboard
          </CardTitle>
          <CardDescription>
            Review and verify student Brag Sheet entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : pendingEntries.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">All caught up!</h3>
              <p className="text-muted-foreground">
                There are no entries pending verification.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {pendingEntries.length} entries pending verification
              </p>
              {pendingEntries.map((entry) => (
                <VerificationCard
                  key={entry.id}
                  entry={entry}
                  onVerify={handleVerify}
                  isLoading={verifyEntry.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
