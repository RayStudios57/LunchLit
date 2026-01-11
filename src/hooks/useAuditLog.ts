import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AuditActionType = 
  | 'role_added' 
  | 'role_removed' 
  | 'role_updated' 
  | 'permission_changed' 
  | 'bulk_assignment'
  | 'custom_role_created'
  | 'custom_role_updated'
  | 'custom_role_deleted';

export interface AuditLogEntry {
  id: string;
  action_type: AuditActionType;
  performed_by: string;
  target_user_id: string | null;
  target_role_id: string | null;
  custom_role_id: string | null;
  details: Record<string, any>;
  created_at: string;
}

export interface CreateAuditLogInput {
  action_type: AuditActionType;
  target_user_id?: string;
  target_role_id?: string;
  custom_role_id?: string;
  details?: Record<string, any>;
}

export function useAuditLog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as AuditLogEntry[];
    },
    enabled: !!user,
  });

  const logAction = useMutation({
    mutationFn: async (input: CreateAuditLogInput) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('role_audit_logs')
        .insert({
          action_type: input.action_type,
          performed_by: user.id,
          target_user_id: input.target_user_id || null,
          target_role_id: input.target_role_id || null,
          custom_role_id: input.custom_role_id || null,
          details: input.details || {},
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });

  return {
    auditLogs,
    isLoading,
    logAction,
  };
}
