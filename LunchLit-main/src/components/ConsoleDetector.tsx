import { useEffect } from 'react';
import { markConsoleOpened } from '@/lib/secrets';

/**
 * Detects when the developer console is opened and unlocks the secret
 * "En Passant" badge. Uses the classic getter trick + window-size heuristic.
 */
export function ConsoleDetector() {
  useEffect(() => {
    let triggered = false;
    const fire = () => {
      if (triggered) return;
      triggered = true;
      markConsoleOpened();
    };

    // Getter trick: logging this object reads `id` only when the console renders it
    const bait: any = {};
    Object.defineProperty(bait, 'id', {
      get() {
        fire();
        return '';
      },
    });

    const interval = setInterval(() => {
      // window-size heuristic (docked devtools)
      const threshold = 160;
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        fire();
      }
      // eslint-disable-next-line no-console
      console.log('%c', bait);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
