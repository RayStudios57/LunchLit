import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type AppRole = 'admin' | 'teacher' | 'counselor' | 'student';

export interface UserWithRoles {
  id: string;
  email: string;
  full_name: string | null;
  roles: {
    id: string;
    role: AppRole;
    school_id: string | null;
  }[];
}

export function useAdminUserRoles() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all users with their roles (admin only)
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Get all profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name');
      
      if (profileError) throw profileError;

      // Get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (rolesError) throw rolesError;

      // We need to get emails from auth.users, but we can't directly query that
      // So we'll use the profiles data and match with roles
      const usersMap = new Map<string, UserWithRoles>();

      profiles?.forEach(profile => {
        usersMap.set(profile.user_id, {
          id: profile.user_id,
          email: '', // Will be populated if we can get it
          full_name: profile.full_name,
          roles: [],
        });
      });

      roles?.forEach(role => {
        const user = usersMap.get(role.user_id);
        if (user) {
          user.roles.push({
            id: role.id,
            role: role.role as AppRole,
            school_id: role.school_id,
          });
        } else {
          usersMap.set(role.user_id, {
            id: role.user_id,
            email: role.email_domain ? `@${role.email_domain}` : '',
            full_name: null,
            roles: [{
              id: role.id,
              role: role.role as AppRole,
              school_id: role.school_id,
            }],
          });
        }
      });

      return Array.from(usersMap.values());
    },
    enabled: !!user,
  });

  const addRole = useMutation({
    mutationFn: async ({ 
      userId, 
      role, 
      schoolId 
    }: { 
      userId: string; 
      role: AppRole; 
      schoolId?: string;
    }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role,
          school_id: schoolId || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Role added successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error adding role', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const removeRole = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Role removed successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error removing role', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  return {
    users,
    isLoading,
    addRole,
    removeRole,
  };
}
