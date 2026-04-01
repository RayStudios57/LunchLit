import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Friend {
  id: string;
  user_id: string;
  friend_user_id: string;
  status: string;
  created_at: string;
  // Joined profile data
  friend_profile?: {
    full_name: string | null;
    avatar_url: string | null;
    grade_level: string | null;
    school_name: string | null;
    is_public: boolean;
    user_id: string;
  };
}

export function useFriends() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Get all friend connections where I am involved
      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .or(`user_id.eq.${user.id},friend_user_id.eq.${user.id}`);
      if (error) throw error;
      
      // For each connection, fetch the other person's profile
      const friendIds = (data || []).map(f => 
        f.user_id === user.id ? f.friend_user_id : f.user_id
      );
      
      if (friendIds.length === 0) return [];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, grade_level, school_name, is_public')
        .in('user_id', friendIds);
      
      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      
      return (data || []).map(f => ({
        ...f,
        friend_profile: profileMap.get(f.user_id === user.id ? f.friend_user_id : f.user_id) || null,
      })) as Friend[];
    },
    enabled: !!user,
  });

  const sendRequest = useMutation({
    mutationFn: async (friendUserId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('friends').insert({
        user_id: user.id,
        friend_user_id: friendUserId,
        status: 'pending',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast({ title: 'Friend request sent!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message?.includes('duplicate') ? 'Already sent a request' : error.message, variant: 'destructive' });
    },
  });

  const acceptRequest = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast({ title: 'Friend request accepted!' });
    },
  });

  const removeFriend = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', friendshipId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast({ title: 'Friend removed' });
    },
  });

  const sendCheer = useMutation({
    mutationFn: async ({ toUserId, message }: { toUserId: string; message: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('cheers').insert({
        from_user_id: user.id,
        to_user_id: toUserId,
        message,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Cheer sent! 🎉' });
    },
  });

  const acceptedFriends = friends.filter(f => f.status === 'accepted');
  const pendingReceived = friends.filter(f => f.status === 'pending' && f.friend_user_id === user?.id);
  const pendingSent = friends.filter(f => f.status === 'pending' && f.user_id === user?.id);

  return {
    friends,
    acceptedFriends,
    pendingReceived,
    pendingSent,
    isLoading,
    sendRequest,
    acceptRequest,
    removeFriend,
    sendCheer,
  };
}
