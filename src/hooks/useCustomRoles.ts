import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CustomRole {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  color: string;
  permissions: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomRoleInput {
  name: string;
  display_name: string;
  description?: string;
  color?: string;
  permissions?: string[];
}

export function useCustomRoles() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: customRoles = [], isLoading } = useQuery({
    queryKey: ['custom-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_roles')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as CustomRole[];
    },
  });

  const createCustomRole = useMutation({
    mutationFn: async (input: CreateCustomRoleInput) => {
      const { data, error } = await supabase
        .from('custom_roles')
        .insert({
          name: input.name.toLowerCase().replace(/\s+/g, '_'),
          display_name: input.display_name,
          description: input.description || null,
          color: input.color || '#6366f1',
          permissions: input.permissions || [],
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-roles'] });
      toast({ title: 'Custom role created successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Error creating role',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateCustomRole = useMutation({
    mutationFn: async ({ id, ...input }: Partial<CustomRole> & { id: string }) => {
      const { data, error } = await supabase
        .from('custom_roles')
        .update({
          display_name: input.display_name,
          description: input.description,
          color: input.color,
          permissions: input.permissions,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-roles'] });
      toast({ title: 'Custom role updated successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Error updating role',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteCustomRole = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custom_roles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-roles'] });
      toast({ title: 'Custom role deleted successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting role',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    customRoles,
    isLoading,
    createCustomRole,
    updateCustomRole,
    deleteCustomRole,
  };
}
