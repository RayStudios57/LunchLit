import { useState, useEffect } from 'react';
import { X, PartyPopper, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LaunchBanner() {
  const [visible, setVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number; color: string; size: number }>>([]);

  useEffect(() => {
    const dismissed = localStorage.getItem('lunchlit_v1_banner_dismissed');
    if (!dismissed) setVisible(true);

    // Generate confetti particles
    const colors = [
      'hsl(var(--primary))',
      'hsl(var(--accent))',
      '#f59e0b',
      '#10b981',
      '#ec4899',
      '#8b5cf6',
      '#06b6d4',
      '#f97316',
    ];
    setParticles(
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 4,
      }))
    );
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem('lunchlit_v1_banner_dismissed', 'true');
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/15 via-accent/10 to-primary/15 p-4 sm:p-6 mb-6">
      {/* Confetti */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute animate-[confetti-fall_3s_ease-in_infinite]"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            width: p.size,
            height: p.size,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-foreground z-10"
        onClick={dismiss}
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="relative z-10 flex flex-col items-center text-center gap-2">
        <div className="flex items-center gap-2">
          <PartyPopper className="h-6 w-6 text-primary animate-bounce" />
          <h2 className="text-xl sm:text-2xl font-bold font-display bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            LunchLit v1.0 is Here!
          </h2>
          <Sparkles className="h-6 w-6 text-primary animate-bounce" style={{ animationDelay: '0.3s' }} />
        </div>
        <p className="text-sm text-muted-foreground max-w-md">
          LunchLit is officially released — stable, polished, and ready for students everywhere. 🎉
        </p>
      </div>
    </div>
  );
}
