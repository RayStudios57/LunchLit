import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { useBragSheet } from '@/hooks/useBragSheet';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';

export interface Badge {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: 'tasks' | 'bragsheet' | 'streaks' | 'general';
  check: (ctx: BadgeContext) => boolean;
}

interface BadgeContext {
  completedTasks: number;
  totalTasks: number;
  bragEntries: number;
}

export const BADGES: Badge[] = [
  // Tasks
  { key: 'first_task', name: 'Getting Started', description: 'Complete your first task', icon: '✅', category: 'tasks', check: ctx => ctx.completedTasks >= 1 },
  { key: 'task_5', name: 'Task Master', description: 'Complete 5 tasks', icon: '⭐', category: 'tasks', check: ctx => ctx.completedTasks >= 5 },
  { key: 'task_10', name: 'On a Roll', description: 'Complete 10 tasks', icon: '🔥', category: 'tasks', check: ctx => ctx.completedTasks >= 10 },
  { key: 'task_25', name: 'Productivity Pro', description: 'Complete 25 tasks', icon: '🏆', category: 'tasks', check: ctx => ctx.completedTasks >= 25 },
  { key: 'task_50', name: 'Half Century', description: 'Complete 50 tasks', icon: '🎖️', category: 'tasks', check: ctx => ctx.completedTasks >= 50 },
  { key: 'task_100', name: 'Century Club', description: 'Complete 100 tasks', icon: '💯', category: 'tasks', check: ctx => ctx.completedTasks >= 100 },
  // Brag Sheet
  { key: 'brag_1', name: 'Brag Starter', description: 'Add your first Brag Sheet entry', icon: '📝', category: 'bragsheet', check: ctx => ctx.bragEntries >= 1 },
  { key: 'brag_3', name: 'Building Up', description: 'Add 3 Brag Sheet entries', icon: '📌', category: 'bragsheet', check: ctx => ctx.bragEntries >= 3 },
  { key: 'brag_5', name: 'Resume Builder', description: 'Add 5 Brag Sheet entries', icon: '📋', category: 'bragsheet', check: ctx => ctx.bragEntries >= 5 },
  { key: 'brag_10', name: 'Achievement Hunter', description: '10 Brag Sheet entries', icon: '🎯', category: 'bragsheet', check: ctx => ctx.bragEntries >= 10 },
  { key: 'brag_20', name: 'Overachiever', description: '20 Brag Sheet entries', icon: '🌟', category: 'bragsheet', check: ctx => ctx.bragEntries >= 20 },
  // General
  { key: 'task_creator_10', name: 'Planner', description: 'Create 10 tasks total', icon: '📅', category: 'general', check: ctx => ctx.totalTasks >= 10 },
  { key: 'task_creator_25', name: 'Organized', description: 'Create 25 tasks total', icon: '🗂️', category: 'general', check: ctx => ctx.totalTasks >= 25 },
  { key: 'task_creator_50', name: 'Super Planner', description: 'Create 50 tasks total', icon: '🧠', category: 'general', check: ctx => ctx.totalTasks >= 50 },
  { key: 'well_rounded', name: 'Well-Rounded', description: 'Complete 5 tasks AND have 3 brag entries', icon: '💎', category: 'general', check: ctx => ctx.completedTasks >= 5 && ctx.bragEntries >= 3 },
  { key: 'scholar', name: 'Scholar', description: 'Complete 25 tasks AND have 10 brag entries', icon: '🎓', category: 'general', check: ctx => ctx.completedTasks >= 25 && ctx.bragEntries >= 10 },
];

export function useAchievements() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { tasks } = useTasks();
  const { entries } = useBragSheet();

  const { data: unlocked = [], isLoading } = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data.map(d => d.badge_key);
    },
    enabled: !!user,
  });

  const unlockBadge = useMutation({
    mutationFn: async (badgeKey: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('user_achievements')
        .insert({ user_id: user.id, badge_key: badgeKey });
      if (error && !error.message.includes('duplicate')) throw error;
    },
    onSuccess: (_, badgeKey) => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      const badge = BADGES.find(b => b.key === badgeKey);
      if (badge) {
        toast.success(`${badge.icon} Badge unlocked: ${badge.name}!`);
      }
    },
  });

  const context: BadgeContext = useMemo(() => ({
    completedTasks: tasks.filter(t => t.is_completed).length,
    totalTasks: tasks.length,
    bragEntries: entries?.length || 0,
  }), [tasks, entries]);

  // Auto-check for new badges
  useEffect(() => {
    if (!user || isLoading) return;
    BADGES.forEach(badge => {
      if (!unlocked.includes(badge.key) && badge.check(context)) {
        unlockBadge.mutate(badge.key);
      }
    });
  }, [context, unlocked, user, isLoading]);

  return {
    unlocked,
    badges: BADGES,
    isLoading,
  };
}
