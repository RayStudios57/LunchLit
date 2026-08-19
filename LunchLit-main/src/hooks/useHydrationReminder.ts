import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useWellness } from '@/hooks/useWellness';

// Nudge the user to drink water periodically while the app is open.
const REMINDER_INTERVAL_MS = 60 * 60 * 1000; // every hour
const GOAL = 8;

export function useHydrationReminder() {
  const { today } = useWellness();
  const waterCount = today?.water_count ?? 0;
  const waterRef = useRef(waterCount);
  waterRef.current = waterCount;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Ask for notification permission once
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    const lastKey = 'lunchlit_last_hydration_nudge';
    const fire = () => {
      // Only nudge during waking hours (8am - 9pm)
      const hour = new Date().getHours();
      if (hour < 8 || hour >= 21) return;
      if (waterRef.current >= GOAL) return;

      toast('💧 Time for some water!', {
        description: `You're at ${waterRef.current}/${GOAL} glasses today. Stay hydrated!`,
        icon: '🚰',
      });
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('💧 Hydration reminder', {
            body: `You're at ${waterRef.current}/${GOAL} glasses today. Drink up!`,
          });
        } catch { /* ignore */ }
      }
      localStorage.setItem(lastKey, String(Date.now()));
    };

    // If it's been a while since the last nudge, fire shortly after mount
    const last = Number(localStorage.getItem(lastKey) || 0);
    const elapsed = Date.now() - last;
    const firstDelay = elapsed > REMINDER_INTERVAL_MS ? 30 * 1000 : REMINDER_INTERVAL_MS - elapsed;

    const firstTimer = setTimeout(fire, Math.max(firstDelay, 30 * 1000));
    const interval = setInterval(fire, REMINDER_INTERVAL_MS);
    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, []);
}
