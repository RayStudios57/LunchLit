import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface RoleRequest {
  id: string;
  user_id: string;
  requested_role: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useRoleRequests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch user's own requests
  const { data: myRequests = [], isLoading: isLoadingMy } = useQuery({
    queryKey: ['my-role-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('role_upgrade_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RoleRequest[];
    },
    enabled: !!user,
  });

  // Fetch all pending requests (for admins)
  const { data: allRequests = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ['all-role-requests'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('role_upgrade_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RoleRequest[];
    },
    enabled: !!user,
  });

  const submitRequest = useMutation({
    mutationFn: async ({ requestedRole, reason }: { requestedRole: string; reason: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('role_upgrade_requests')
        .insert({
          user_id: user.id,
          requested_role: requestedRole,
          reason,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-role-requests'] });
      toast({
        title: 'Request submitted',
        description: 'Your role upgrade request has been submitted for review.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to submit request',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const reviewRequest = useMutation({
    mutationFn: async ({
      requestId,
      status,
      adminNotes,
    }: {
      requestId: string;
      status: 'approved' | 'rejected';
      adminNotes?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('role_upgrade_requests')
        .update({
          status,
          admin_notes: adminNotes || null,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['all-role-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-role-requests'] });
      toast({
        title: `Request ${variables.status}`,
        description: `The role request has been ${variables.status}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to review request',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const hasPendingRequest = myRequests.some((r) => r.status === 'pending');

  return {
    myRequests,
    allRequests,
    isLoading: isLoadingMy || isLoadingAll,
    submitRequest,
    reviewRequest,
    hasPendingRequest,
  };
}
