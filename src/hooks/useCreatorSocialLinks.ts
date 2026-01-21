import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  display_order: number;
}

const OWNER_EMAIL = 'kutturam0912@gmail.com';

export function useCreatorSocialLinks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isOwner = user?.email === OWNER_EMAIL;

  const { data: socialLinks = [], isLoading } = useQuery({
    queryKey: ['creator-social-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creator_social_links')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as SocialLink[];
    },
  });

  const addLink = useMutation({
    mutationFn: async (link: Omit<SocialLink, 'id'>) => {
      const { error } = await supabase
        .from('creator_social_links')
        .insert(link);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-social-links'] });
      toast.success('Social link added');
    },
    onError: () => toast.error('Failed to add link'),
  });

  const updateLink = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SocialLink> & { id: string }) => {
      const { error } = await supabase
        .from('creator_social_links')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-social-links'] });
      toast.success('Social link updated');
    },
    onError: () => toast.error('Failed to update link'),
  });

  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('creator_social_links')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-social-links'] });
      toast.success('Social link removed');
    },
    onError: () => toast.error('Failed to remove link'),
  });

  return {
    socialLinks,
    isLoading,
    isOwner,
    addLink,
    updateLink,
    deleteLink,
  };
}
