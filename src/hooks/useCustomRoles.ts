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
  icon: string;
  priority: number;
  is_active: boolean;
  permissions: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Helper to convert JSON permissions to string array
function parsePermissions(permissions: unknown): string[] {
  if (Array.isArray(permissions)) {
    return permissions.filter((p): p is string => typeof p === 'string');
  }
  return [];
}

export interface CreateCustomRoleInput {
  name: string;
  display_name: string;
  description?: string;
  color?: string;
  icon?: string;
  priority?: number;
  is_active?: boolean;
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
      
      // Transform the data to ensure permissions is always a string array
      return (data || []).map(role => ({
        ...role,
        color: role.color || '#6366f1',
        icon: (role as any).icon || 'shield',
        priority: (role as any).priority ?? 0,
        is_active: (role as any).is_active ?? true,
        permissions: parsePermissions(role.permissions),
      })) as CustomRole[];
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
          icon: input.icon || 'shield',
          priority: input.priority ?? 0,
          is_active: input.is_active ?? true,
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
      const updateData: Record<string, any> = {};
      if (input.display_name !== undefined) updateData.display_name = input.display_name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.color !== undefined) updateData.color = input.color;
      if (input.icon !== undefined) updateData.icon = input.icon;
      if (input.priority !== undefined) updateData.priority = input.priority;
      if (input.is_active !== undefined) updateData.is_active = input.is_active;
      if (input.permissions !== undefined) updateData.permissions = input.permissions;

      const { data, error } = await supabase
        .from('custom_roles')
        .update(updateData)
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
