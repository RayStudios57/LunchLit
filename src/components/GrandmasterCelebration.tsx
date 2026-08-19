import { useEffect, useState } from 'react';
import { useAchievements } from '@/hooks/useAchievements';
import { useProfile } from '@/hooks/useProfile';
import { Crown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SEEN_KEY = 'lunchlit_master_celebrated';

/**
 * Watches for the LunchLIT Master badge. When earned, it:
 *  - auto-sets the Master badge as the user's showcased badge
 *  - shows a one-time full-screen "Congratulations" overlay
 */
export function GrandmasterCelebration() {
  const { hasMaster, isOwner } = useAchievements();
  const { profile, updateProfile } = useProfile();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!hasMaster) return;

    // Auto-showcase the master badge
    if (profile && profile.showcase_badge !== 'lunchlit_master') {
      updateProfile.mutate({ showcase_badge: 'lunchlit_master' });
    }

    // One-time celebration (owner doesn't need the popup every load)
    if (!isOwner && localStorage.getItem(SEEN_KEY) !== 'true') {
      setShow(true);
      localStorage.setItem(SEEN_KEY, 'true');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMaster, profile?.showcase_badge]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
      {/* confetti */}
      {Array.from({ length: 40 }).map((_, i) => (
        <span
          key={i}
          className="pointer-events-none absolute top-0 text-2xl"
          style={{
            left: `${Math.random() * 100}%`,
            animation: `confetti-fall ${2 + Math.random() * 2}s ${Math.random()}s linear infinite`,
          }}
        >
          {['✨', '👑', '🏆', '⭐', '🎉'][i % 5]}
        </span>
      ))}

      <div className="gm-pop relative max-w-md w-full rounded-3xl border border-yellow-500/40 bg-gradient-to-br from-yellow-500/15 via-amber-500/10 to-orange-500/15 p-8 text-center shadow-2xl">
        <button
          onClick={() => setShow(false)}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg">
          <Crown className="crown-aura w-14 h-14" />
        </div>
        <h2 className="font-display text-3xl font-bold">
          <span className="gold-name">LUNCHLIT MASTER</span>
        </h2>
        <p className="mt-3 text-base font-medium text-foreground">
          You cleared every single achievement and cracked the secret code.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          The legendary crown is now showcased next to your name across the entire app.
        </p>
        <Button className="mt-6 w-full" onClick={() => setShow(false)}>
          Wear it with pride 👑
        </Button>
      </div>
    </div>
  );
}
