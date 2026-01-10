import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Json } from '@/integrations/supabase/types';

export type Permission = 
  | 'manage_users'
  | 'manage_schools'
  | 'manage_menus'
  | 'manage_study_halls'
  | 'verify_entries'
  | 'manage_discussions'
  | 'view_analytics'
  | 'manage_roles';

interface UserRoleWithCustomRole {
  id: string;
  role: string;
  custom_role_id: string | null;
  custom_roles: {
    id: string;
    name: string;
    display_name: string;
    permissions: Json;
    color: string | null;
  } | null;
}

// Map predefined roles to their default permissions
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    'manage_users',
    'manage_schools',
    'manage_menus',
    'manage_study_halls',
    'verify_entries',
    'manage_discussions',
    'view_analytics',
    'manage_roles',
  ],
  teacher: [
    'manage_study_halls',
    'verify_entries',
    'manage_discussions',
  ],
  counselor: [
    'verify_entries',
    'view_analytics',
  ],
  student: [],
};

export function usePermissions() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['user-permissions', user?.id],
    queryFn: async () => {
      if (!user) return { roles: [], permissions: new Set<Permission>() };

      // Fetch user roles with their custom role data
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          role,
          custom_role_id,
          custom_roles (
            id,
            name,
            display_name,
            permissions,
            color
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const permissions = new Set<Permission>();
      const roles: string[] = [];

      for (const userRole of (userRoles as UserRoleWithCustomRole[]) || []) {
        // Add the base role
        roles.push(userRole.role);

        // Add permissions from predefined roles
        const rolePerms = ROLE_PERMISSIONS[userRole.role] || [];
        rolePerms.forEach(p => permissions.add(p));

        // Add permissions from custom roles
        if (userRole.custom_roles?.permissions) {
          const customPerms = userRole.custom_roles.permissions as string[];
          if (Array.isArray(customPerms)) {
            customPerms.forEach(p => permissions.add(p as Permission));
          }
        }
      }

      return { roles, permissions };
    },
    enabled: !!user,
  });

  const hasPermission = (permission: Permission): boolean => {
    return data?.permissions.has(permission) ?? false;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(p => data?.permissions.has(p));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(p => data?.permissions.has(p));
  };

  const hasRole = (role: string): boolean => {
    return data?.roles.includes(role) ?? false;
  };

  const isAdmin = hasRole('admin');
  const isVerifier = hasRole('teacher') || hasRole('counselor');

  return {
    permissions: data?.permissions ?? new Set<Permission>(),
    roles: data?.roles ?? [],
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isAdmin,
    isVerifier,
  };
}
