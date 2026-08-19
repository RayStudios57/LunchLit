import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const TAB_LABELS: Record<string, string> = {
  home: 'Home',
  tasks: 'Tasks',
  classes: 'Class Schedule',
  menu: 'Menu',
  study: 'Study Halls',
  tutor: 'Tutors',
  planner: 'Planner',
  chat: 'AI Chat',
  discuss: 'Community',
  bragsheet: 'Brag Sheet',
  portfolio: 'Portfolio',
  profiles: 'Friends',
  settings: 'Settings',
};

const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export type PresenceStatus = 'online' | 'idle' | 'offline';

export interface UserPresence {
  user_id: string;
  status: PresenceStatus;
  activity: string | null;
  last_seen: number;
  custom_status: string | null;
}

/**
 * Broadcasts the current user's presence (tab + idle state).
 * Call setCurrentTab whenever the active tab changes.
 */
export function usePresenceBroadcast(currentTab: string, customStatus?: string | null) {
  const { user } = useAuth();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isIdleRef = useRef(false);

  const resetIdleTimer = useCallback(() => {
    if (isIdleRef.current) {
      isIdleRef.current = false;
      channelRef.current?.track({
        user_id: user?.id,
        status: 'online',
        activity: TAB_LABELS[currentTab] || currentTab,
        last_seen: Date.now(),
        custom_status: customStatus || null,
      });
    }
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      isIdleRef.current = true;
      channelRef.current?.track({
        user_id: user?.id,
        status: 'idle',
        activity: TAB_LABELS[currentTab] || currentTab,
        last_seen: Date.now(),
        custom_status: customStatus || null,
      });
    }, IDLE_TIMEOUT_MS);
  }, [user?.id, currentTab, customStatus]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('global-presence', {
      config: { presence: { key: user.id } },
    });
    channelRef.current = channel;

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: user.id,
          status: 'online',
          activity: TAB_LABELS[currentTab] || currentTab,
          last_seen: Date.now(),
          custom_status: customStatus || null,
        });
      }
    });

    // Listen for user activity to reset idle timer
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(ev => window.addEventListener(ev, resetIdleTimer, { passive: true }));
    resetIdleTimer();

    return () => {
      events.forEach(ev => window.removeEventListener(ev, resetIdleTimer));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update presence when tab changes
  useEffect(() => {
    if (!channelRef.current || !user) return;
    channelRef.current.track({
      user_id: user.id,
      status: isIdleRef.current ? 'idle' : 'online',
      activity: TAB_LABELS[currentTab] || currentTab,
      last_seen: Date.now(),
      custom_status: customStatus || null,
    });
  }, [currentTab, user, customStatus]);
}

/**
 * Subscribes to presence of a set of user IDs and returns their statuses.
 */
export function usePresenceTracker(userIds: string[]) {
  const { user } = useAuth();
  const [presenceMap, setPresenceMap] = useState<Record<string, UserPresence>>({});

  useEffect(() => {
    if (!user || userIds.length === 0) return;

    const channel = supabase.channel('global-presence', {
      config: { presence: { key: user.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const map: Record<string, UserPresence> = {};
        for (const [key, presences] of Object.entries(state)) {
          if (userIds.includes(key) && Array.isArray(presences) && presences.length > 0) {
            const p = presences[0] as Record<string, unknown>;
            map[key] = {
              user_id: key,
              status: (p.status as UserPresence['status']) || 'online',
              activity: (p.activity as string | null) || null,
              last_seen: (p.last_seen as number) || Date.now(),
              custom_status: (p.custom_status as string | null) || null,
            };
          }
        }
        setPresenceMap(map);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, userIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  return presenceMap;
}
