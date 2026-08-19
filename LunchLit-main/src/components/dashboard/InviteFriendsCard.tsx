import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Copy, Check, Share2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAchievements } from '@/hooks/useAchievements';
import { useToast } from '@/hooks/use-toast';

export function InviteFriendsCard() {
  const { user } = useAuth();
  const { unlocked, unlockBadge } = useAchievements();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const inviteLink = `${window.location.origin}/auth?ref=${user.id}`;

  const awardBadge = () => {
    if (!unlocked.includes('inviter')) {
      unlockBadge.mutate('inviter');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({ title: 'Invite link copied!', description: 'Share it with a friend to spread LunchLit.' });
      awardBadge();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Could not copy', description: 'Please copy the link manually.', variant: 'destructive' });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on LunchLit',
          text: 'Track your wellness, fitness, tasks and more — join me on LunchLit!',
          url: inviteLink,
        });
        awardBadge();
      } catch {
        // user cancelled share — no-op
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="card-elevated bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          Invite Friends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Share your personal invite link. When a friend joins, you'll earn the{' '}
          <span className="font-medium text-foreground">📨 Spread the Word</span> badge!
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input readOnly value={inviteLink} className="font-mono text-xs" onFocus={(e) => e.target.select()} />
          <div className="flex gap-2 shrink-0">
            <Button onClick={handleCopy} variant="outline" className="flex-1 sm:flex-none gap-1.5">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button onClick={handleShare} className="flex-1 sm:flex-none gap-1.5">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
