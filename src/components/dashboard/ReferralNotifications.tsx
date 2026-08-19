import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Inbox, UserCheck, Award } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAchievements } from '@/hooks/useAchievements';
import { formatDistanceToNow } from 'date-fns';

const REFERRAL_TYPES = ['referral_accepted', 'friend_badge', 'referral'];

/**
 * Referral-based notifications screen.
 * Shows whether an invite was accepted and which badge a friend unlocked.
 */
export function ReferralNotifications() {
  const { notifications } = useNotifications();
  const { unlocked } = useAchievements();

  const referrals = notifications.filter((n) => REFERRAL_TYPES.includes(n.type));
  const hasShared = unlocked.includes('inviter');

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Inbox className="w-5 h-5 text-primary" />
          Referral Activity
        </CardTitle>
        <CardDescription>
          See when friends accept your invite and the badges they unlock.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {referrals.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {hasShared
                ? "You've shared your invite — accepted invites and your friends' new badges will appear here."
                : 'No referral activity yet. Share your invite link to get started.'}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {referrals.map((n) => {
              const isBadge = n.type === 'friend_badge';
              return (
                <div key={n.id} className="flex items-start gap-3 py-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {isBadge ? (
                      <Award className="w-4 h-4 text-primary" />
                    ) : (
                      <UserCheck className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.message && (
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
