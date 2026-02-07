import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { usePresentationMode } from '@/contexts/PresentationModeContext';
import { dummyDiscussions } from '@/data/presentationDummyData';
import { useEffect } from 'react';
import { z } from 'zod';

// Validation schemas for discussion content
const discussionSchema = z.object({
  title: z.string().max(100, 'Title must be 100 characters or less').optional(),
  content: z.string()
    .min(1, 'Content is required')
    .max(2000, 'Content must be 2000 characters or less')
    .refine(val => !/<script\b[^>]*>[\s\S]*?<\/script>/gi.test(val), 'Invalid content'),
  category: z.string().max(50).optional(),
  parent_id: z.string().uuid().optional(),
});

const replySchema = z.object({
  content: z.string()
    .min(1, 'Reply is required')
    .max(1000, 'Reply must be 1000 characters or less')
    .refine(val => !/<script\b[^>]*>[\s\S]*?<\/script>/gi.test(val), 'Invalid content'),
  parent_id: z.string().uuid(),
});

export interface Discussion {
  id: string;
  user_id: string;
  school_id: string | null;
  title: string | null;
  content: string;
  parent_id: string | null;
  category: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_avatar?: string;
  reply_count?: number;
}

export function useDiscussions(category?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isPresentationMode } = usePresentationMode();

  const { data: discussions = [], isLoading } = useQuery({
    queryKey: ['discussions', category],
    queryFn: async () => {
      let query = supabase
        .from('discussions')
        .select('*')
        .is('parent_id', null)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch reply counts and author info
      const discussionsWithMeta = await Promise.all(
        (data || []).map(async (discussion) => {
          const { count } = await supabase
            .from('discussions')
            .select('*', { count: 'exact', head: true })
            .eq('parent_id', discussion.id);
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', discussion.user_id)
            .single();
          
          return {
            ...discussion,
            reply_count: count || 0,
            author_name: profile?.full_name || 'Anonymous',
            author_avatar: profile?.avatar_url,
          };
        })
      );
      
      return discussionsWithMeta as Discussion[];
    },
    enabled: !!user,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('discussions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'discussions' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['discussions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createDiscussion = useMutation({
    mutationFn: async (data: { title?: string; content: string; category?: string; parent_id?: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Validate input based on whether it's a reply or new discussion
      const validationResult = data.parent_id 
        ? replySchema.safeParse({ content: data.content, parent_id: data.parent_id })
        : discussionSchema.safeParse(data);
      
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0]?.message || 'Invalid input');
      }
      
      const { data: result, error } = await supabase
        .from('discussions')
        .insert({
          user_id: user.id,
          title: data.title?.trim(),
          content: data.content.trim(),
          category: data.category || 'general',
          parent_id: data.parent_id,
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      toast({ title: 'Posted!' });
    },
    onError: (error) => {
      toast({ title: 'Error posting', description: error.message, variant: 'destructive' });
    },
  });

  const deleteDiscussion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('discussions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      toast({ title: 'Deleted' });
    },
  });

  const activeDiscussions = isPresentationMode ? (dummyDiscussions as Discussion[]) : discussions;

  return { discussions: activeDiscussions, isLoading: isPresentationMode ? false : isLoading, createDiscussion, deleteDiscussion };
}

export function useDiscussionReplies(discussionId: string) {
  const { user } = useAuth();

  const { data: replies = [], isLoading } = useQuery({
    queryKey: ['discussion-replies', discussionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discussions')
        .select('*')
        .eq('parent_id', discussionId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      const repliesWithAuthor = await Promise.all(
        (data || []).map(async (reply) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', reply.user_id)
            .single();
          
          return {
            ...reply,
            author_name: profile?.full_name || 'Anonymous',
            author_avatar: profile?.avatar_url,
          };
        })
      );
      
      return repliesWithAuthor as Discussion[];
    },
    enabled: !!user && !!discussionId,
  });

  return { replies, isLoading };
}
