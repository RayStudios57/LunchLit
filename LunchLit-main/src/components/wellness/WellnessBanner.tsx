import { useState, useEffect } from 'react';
import { X, Sparkles, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FOODS = ['🥗', '🍎', '🥑', '🥦', '🍇', '🫐', '🥕', '🍊', '🍓', '🥬', '🍌', '🥝'];

export function WellnessBanner() {
  const [visible, setVisible] = useState(false);
  const [floaters, setFloaters] = useState<Array<{ id: number; left: number; delay: number; emoji: string; duration: number; size: number }>>([]);

  useEffect(() => {
    const dismissed = localStorage.getItem('lunchlit_wellness_v11_banner_dismissed');
    if (!dismissed) setVisible(true);

    setFloaters(
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 4,
        emoji: FOODS[Math.floor(Math.random() * FOODS.length)],
        duration: 5 + Math.random() * 4,
        size: 16 + Math.random() * 14,
      }))
    );
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem('lunchlit_wellness_v11_banner_dismissed', 'true');
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/20 via-green-500/15 to-teal-500/20 p-4 sm:p-6 mb-6">
      {/* Floating foods */}
      {floaters.map((f) => (
        <span
          key={f.id}
          className="absolute pointer-events-none select-none animate-[confetti-fall_var(--d)_linear_infinite]"
          style={{
            left: `${f.left}%`,
            top: '-10%',
            fontSize: f.size,
            animationDelay: `${f.delay}s`,
            opacity: 0.85,
            ...({ '--d': `${f.duration}s` } as React.CSSProperties),
          }}
        >
          {f.emoji}
        </span>
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
          <Heart className="h-6 w-6 text-emerald-500 animate-bounce" fill="currentColor" />
          <h2 className="text-xl sm:text-2xl font-bold font-display bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            LunchLit v1.1 — Wellness + Fitness
          </h2>
          <Sparkles className="h-6 w-6 text-emerald-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
        </div>
        <p className="text-sm text-muted-foreground max-w-md">
          New Wellness tab with Nutrition & Fitness — easy snacks, mood check-ins, AI gym machine scanner, and custom workout routines. 💪🌱
        </p>
      </div>
    </div>
  );
}
