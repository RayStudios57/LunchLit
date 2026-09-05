import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OWNER_EMAIL, isOwnerEmail } from '@/lib/secrets';

interface GoldNameProps {
  name?: string | null;
  /** Pass the user's email if available to auto-detect the owner account */
  email?: string | null;
  /** Force grandmaster styling (e.g. from achievements for the current user) */
  isMaster?: boolean;
  showcaseBadge?: string | null;
  className?: string;
  crownSize?: number;
}

/**
 * Renders a username. If the user is the LunchLIT Master (or the owner account),
 * the name shows an animated shining-gold gradient with a pulsing crown aura.
 */
export function GoldName({ name, email, isMaster, showcaseBadge, className, crownSize = 16 }: GoldNameProps) {
  const display = name || 'Student';
  const grandmaster = isMaster || isOwnerEmail(email) || showcaseBadge === 'lunchlit_master';

  if (!grandmaster) {
    return <span className={className}>{display}</span>;
  }

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <Crown className="crown-aura shrink-0" style={{ width: crownSize, height: crownSize }} />
      <span className="gold-name">{display}</span>
    </span>
  );
}
