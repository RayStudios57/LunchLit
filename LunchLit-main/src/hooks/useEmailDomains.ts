import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type AppRole = 'admin' | 'teacher' | 'counselor' | 'student';

export interface AllowedEmailDomain {
  id: string;
  domain: string;
  auto_assign_role: AppRole;
  school_id: string | null;
  description: string | null;
  created_at: string;
  created_by: string | null;
}

export function useEmailDomains() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: domains = [], isLoading } = useQuery({
    queryKey: ['allowed-email-domains'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('allowed_email_domains')
        .select('*')
        .order('domain');
      
      if (error) throw error;
      return data as AllowedEmailDomain[];
    },
  });

  const addDomain = useMutation({
    mutationFn: async ({ 
      domain, 
      autoAssignRole, 
      schoolId, 
      description 
    }: { 
      domain: string; 
      autoAssignRole: AppRole; 
      schoolId?: string;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from('allowed_email_domains')
        .insert({
          domain: domain.toLowerCase().replace('@', ''),
          auto_assign_role: autoAssignRole,
          school_id: schoolId || null,
          description: description || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowed-email-domains'] });
      toast({ title: 'Domain added successfully' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Error adding domain', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const updateDomain = useMutation({
    mutationFn: async ({ 
      id,
      domain, 
      autoAssignRole, 
      schoolId, 
      description 
    }: { 
      id: string;
      domain: string; 
      autoAssignRole: AppRole; 
      schoolId?: string;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from('allowed_email_domains')
        .update({
          domain: domain.toLowerCase().replace('@', ''),
          auto_assign_role: autoAssignRole,
          school_id: schoolId || null,
          description: description || null,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowed-email-domains'] });
      toast({ title: 'Domain updated successfully' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Error updating domain', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const deleteDomain = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('allowed_email_domains')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowed-email-domains'] });
      toast({ title: 'Domain removed successfully' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Error removing domain', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  return { 
    domains, 
    isLoading, 
    addDomain, 
    updateDomain, 
    deleteDomain 
  };
}
