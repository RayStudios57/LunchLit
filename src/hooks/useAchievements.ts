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
  category: 'tasks' | 'bragsheet' | 'academic' | 'consistency' | 'exploration' | 'social' | 'general' | 'menu' | 'studyhall' | 'planner' | 'discussion' | 'portfolio' | 'settings' | 'pomodoro' | 'tutoring';
  check: (ctx: BadgeContext) => boolean;
}

interface BadgeContext {
  completedTasks: number;
  totalTasks: number;
  bragEntries: number;
}

export const BADGES: Badge[] = [
  // ──── Tasks ────
  { key: 'first_task', name: 'Getting Started', description: 'Complete your first task', icon: '✅', category: 'tasks', check: ctx => ctx.completedTasks >= 1 },
  { key: 'task_5', name: 'Task Master', description: 'Complete 5 tasks', icon: '⭐', category: 'tasks', check: ctx => ctx.completedTasks >= 5 },
  { key: 'task_10', name: 'On a Roll', description: 'Complete 10 tasks', icon: '🔥', category: 'tasks', check: ctx => ctx.completedTasks >= 10 },
  { key: 'task_25', name: 'Productivity Pro', description: 'Complete 25 tasks', icon: '🏆', category: 'tasks', check: ctx => ctx.completedTasks >= 25 },
  { key: 'task_50', name: 'Half Century', description: 'Complete 50 tasks', icon: '🎖️', category: 'tasks', check: ctx => ctx.completedTasks >= 50 },
  { key: 'task_100', name: 'Century Club', description: 'Complete 100 tasks', icon: '💯', category: 'tasks', check: ctx => ctx.completedTasks >= 100 },
  { key: 'task_200', name: 'Task Legend', description: 'Complete 200 tasks', icon: '🏅', category: 'tasks', check: ctx => ctx.completedTasks >= 200 },

  // ──── Brag Sheet ────
  { key: 'brag_1', name: 'Brag Starter', description: 'Add your first Brag Sheet entry', icon: '📝', category: 'bragsheet', check: ctx => ctx.bragEntries >= 1 },
  { key: 'brag_3', name: 'Building Up', description: 'Add 3 Brag Sheet entries', icon: '📌', category: 'bragsheet', check: ctx => ctx.bragEntries >= 3 },
  { key: 'brag_5', name: 'Resume Builder', description: 'Add 5 Brag Sheet entries', icon: '📋', category: 'bragsheet', check: ctx => ctx.bragEntries >= 5 },
  { key: 'brag_10', name: 'Achievement Hunter', description: '10 Brag Sheet entries', icon: '🎯', category: 'bragsheet', check: ctx => ctx.bragEntries >= 10 },
  { key: 'brag_20', name: 'Overachiever', description: '20 Brag Sheet entries', icon: '🌟', category: 'bragsheet', check: ctx => ctx.bragEntries >= 20 },
  { key: 'brag_30', name: 'Portfolio Master', description: '30 Brag Sheet entries', icon: '👑', category: 'bragsheet', check: ctx => ctx.bragEntries >= 30 },

  // ──── Academic ────
  { key: 'task_creator_10', name: 'Planner', description: 'Create 10 tasks total', icon: '📅', category: 'academic', check: ctx => ctx.totalTasks >= 10 },
  { key: 'task_creator_25', name: 'Organized', description: 'Create 25 tasks total', icon: '🗂️', category: 'academic', check: ctx => ctx.totalTasks >= 25 },
  { key: 'task_creator_50', name: 'Super Planner', description: 'Create 50 tasks total', icon: '🧠', category: 'academic', check: ctx => ctx.totalTasks >= 50 },
  { key: 'task_creator_100', name: 'Planning Prodigy', description: 'Create 100 tasks total', icon: '🗓️', category: 'academic', check: ctx => ctx.totalTasks >= 100 },

  // ──── Consistency ────
  { key: 'first_complete', name: 'First Steps', description: 'Complete your very first task', icon: '👣', category: 'consistency', check: ctx => ctx.completedTasks >= 1 },
  { key: 'steady_worker', name: 'Steady Worker', description: 'Complete 15 tasks', icon: '⚡', category: 'consistency', check: ctx => ctx.completedTasks >= 15 },
  { key: 'grinder', name: 'The Grinder', description: 'Complete 75 tasks', icon: '💪', category: 'consistency', check: ctx => ctx.completedTasks >= 75 },
  { key: 'unstoppable', name: 'Unstoppable', description: 'Complete 150 tasks', icon: '🚀', category: 'consistency', check: ctx => ctx.completedTasks >= 150 },

  // ──── Exploration ────
  { key: 'curious_mind', name: 'Curious Mind', description: 'Create your first task', icon: '🔍', category: 'exploration', check: ctx => ctx.totalTasks >= 1 },
  { key: 'explorer', name: 'Explorer', description: 'Create 5 tasks in any category', icon: '🧭', category: 'exploration', check: ctx => ctx.totalTasks >= 5 },
  { key: 'deep_diver', name: 'Deep Diver', description: 'Have 15+ brag entries', icon: '🤿', category: 'exploration', check: ctx => ctx.bragEntries >= 15 },

  // ──── Social / Participation ────
  { key: 'contributor', name: 'Contributor', description: 'Add 2 brag entries', icon: '🤝', category: 'social', check: ctx => ctx.bragEntries >= 2 },
  { key: 'team_player', name: 'Team Player', description: 'Complete 3 tasks and have 1 brag entry', icon: '🎪', category: 'social', check: ctx => ctx.completedTasks >= 3 && ctx.bragEntries >= 1 },
  { key: 'community_builder', name: 'Community Builder', description: '10 tasks + 5 brag entries', icon: '🏘️', category: 'social', check: ctx => ctx.completedTasks >= 10 && ctx.bragEntries >= 5 },

  // ──── General / Milestone ────
  { key: 'well_rounded', name: 'Well-Rounded', description: 'Complete 5 tasks AND have 3 brag entries', icon: '💎', category: 'general', check: ctx => ctx.completedTasks >= 5 && ctx.bragEntries >= 3 },
  { key: 'scholar', name: 'Scholar', description: 'Complete 25 tasks AND have 10 brag entries', icon: '🎓', category: 'general', check: ctx => ctx.completedTasks >= 25 && ctx.bragEntries >= 10 },
  { key: 'renaissance', name: 'Renaissance Student', description: '50 tasks + 15 brag entries', icon: '🎨', category: 'general', check: ctx => ctx.completedTasks >= 50 && ctx.bragEntries >= 15 },
  { key: 'valedictorian', name: 'Valedictorian', description: '100 tasks + 20 brag entries', icon: '🏛️', category: 'general', check: ctx => ctx.completedTasks >= 100 && ctx.bragEntries >= 20 },

  // ──── Menu (manual unlock) ────
  { key: 'menu_explorer', name: 'Menu Explorer', description: 'Check the lunch menu for the first time', icon: '🍽️', category: 'menu', check: () => false },
  { key: 'foodie', name: 'Foodie', description: 'Visit the menu tab 10 times', icon: '🍕', category: 'menu', check: () => false },

  // ──── Study Halls ────
  { key: 'study_spot', name: 'Study Spot Finder', description: 'Browse study halls for the first time', icon: '📖', category: 'studyhall', check: () => false },
  { key: 'study_regular', name: 'Study Regular', description: 'Check study halls 10 times', icon: '🏫', category: 'studyhall', check: () => false },

  // ──── Planner / Schedule ────
  { key: 'schedule_set', name: 'Schedule Set', description: 'Add your first class to your schedule', icon: '📆', category: 'planner', check: () => false },
  { key: 'full_schedule', name: 'Full Schedule', description: 'Have 5+ classes in your schedule', icon: '🗓️', category: 'planner', check: () => false },

  // ──── Discussion ────
  { key: 'discussion_starter', name: 'Discussion Starter', description: 'Create your first discussion post', icon: '💬', category: 'discussion', check: () => false },
  { key: 'active_voice', name: 'Active Voice', description: 'Create 5 discussion posts or replies', icon: '📢', category: 'discussion', check: () => false },

  // ──── Portfolio / Goals ────
  { key: 'goal_setter', name: 'Goal Setter', description: 'Set your first student goal', icon: '🎯', category: 'portfolio', check: () => false },
  { key: 'goal_achiever', name: 'Goal Achiever', description: 'Complete a student goal', icon: '🏁', category: 'portfolio', check: () => false },

  // ──── Settings / Profile ────
  { key: 'profile_complete', name: 'Profile Complete', description: 'Set your name, grade, and school', icon: '👤', category: 'settings', check: () => false },
  { key: 'customizer', name: 'Customizer', description: 'Change your theme from the default', icon: '🎨', category: 'settings', check: () => false },

  // ──── Pomodoro ────
  { key: 'focus_starter', name: 'Focus Starter', description: 'Complete your first Pomodoro session', icon: '🍅', category: 'pomodoro', check: () => false },
  { key: 'focus_master', name: 'Focus Master', description: 'Complete 10 Pomodoro sessions', icon: '🧘', category: 'pomodoro', check: () => false },

  // ──── Tutoring ────
  { key: 'tutor_helper', name: 'Tutor Helper', description: 'Add yourself as a tutor', icon: '🎓', category: 'tutoring', check: () => false },
  { key: 'tutor_mentor', name: 'Mentor', description: 'Be available as tutor in 2+ subjects', icon: '🧑‍🏫', category: 'tutoring', check: () => false },
];

// Special badge for completing ALL other badges
export const MASTER_BADGE: Badge = {
  key: 'lunchlit_master',
  name: 'LunchLit Master',
  description: 'Unlock every single badge — you are legendary!',
  icon: '👑',
  category: 'general',
  check: () => false,
};

export const ALL_BADGES_INCLUDING_MASTER = [...BADGES, MASTER_BADGE];

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
      const badge = ALL_BADGES_INCLUDING_MASTER.find(b => b.key === badgeKey);
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
    // Check master badge
    const allRegularUnlocked = BADGES.every(b => unlocked.includes(b.key));
    if (allRegularUnlocked && BADGES.length > 0 && !unlocked.includes(MASTER_BADGE.key)) {
      unlockBadge.mutate(MASTER_BADGE.key);
    }
  }, [context, unlocked, user, isLoading]);

  return {
    unlocked,
    badges: BADGES,
    allBadges: ALL_BADGES_INCLUDING_MASTER,
    masterBadge: MASTER_BADGE,
    isLoading,
    unlockBadge,
  };
}
