import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomRoles } from './useCustomRoles';

// Base role priorities (built-in roles)
const BASE_ROLE_PRIORITIES: Record<string, number> = {
  admin: 100,
  teacher: 50,
  counselor: 50,
  student: 10,
};

export interface UserRolePriority {
  userId: string;
  highestPriority: number;
  highestRoleName: string;
  highestRoleIcon: string;
  highestRoleColor: string;
}

export function useRoleHierarchy() {
  const { user } = useAuth();
  const { customRoles } = useCustomRoles();

  // Get current user's highest role priority
  const { data: userPriority, isLoading } = useQuery({
    queryKey: ['user-role-priority', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role, custom_role_id')
        .eq('user_id', user.id);

      if (error) throw error;

      let highestPriority = 0;
      let highestRoleName = 'User';
      let highestRoleIcon = 'user';
      let highestRoleColor = '#6b7280';

      for (const roleEntry of roles || []) {
        // Check base role priority
        const basePriority = BASE_ROLE_PRIORITIES[roleEntry.role] || 0;
        if (basePriority > highestPriority) {
          highestPriority = basePriority;
          highestRoleName = roleEntry.role;
          highestRoleIcon = roleEntry.role === 'admin' ? 'crown' : 'shield';
          highestRoleColor = roleEntry.role === 'admin' ? '#eab308' : '#6366f1';
        }

        // Check custom role priority
        if (roleEntry.custom_role_id) {
          const customRole = customRoles.find(r => r.id === roleEntry.custom_role_id);
          if (customRole && customRole.is_active) {
            // Custom role priority is added on top (custom priorities are 0-5, so we multiply to fit the scale)
            const customPriority = (customRole.priority || 0) * 10;
            if (customPriority > highestPriority || 
                (customPriority === highestPriority && customRole.display_name)) {
              highestPriority = Math.max(highestPriority, customPriority);
              highestRoleName = customRole.display_name;
              highestRoleIcon = customRole.icon || 'shield';
              highestRoleColor = customRole.color || '#6366f1';
            }
          }
        }
      }

      return {
        userId: user.id,
        highestPriority,
        highestRoleName,
        highestRoleIcon,
        highestRoleColor,
      } as UserRolePriority;
    },
    enabled: !!user && customRoles.length >= 0,
  });

  // Check if current user can manage a target user based on role hierarchy
  const canManageUser = (targetUserPriority: number): boolean => {
    if (!userPriority) return false;
    // Admin (priority 100) can manage everyone
    if (userPriority.highestPriority >= 100) return true;
    // Otherwise, can only manage users with lower priority
    return userPriority.highestPriority > targetUserPriority;
  };

  // Check if current user can manage a specific role
  const canAssignRole = (roleName: string, customRoleId?: string): boolean => {
    if (!userPriority) return false;
    // Admin can assign any role
    if (userPriority.highestPriority >= 100) return true;

    // Get the priority of the role being assigned
    let targetPriority = BASE_ROLE_PRIORITIES[roleName] || 0;
    
    if (customRoleId) {
      const customRole = customRoles.find(r => r.id === customRoleId);
      if (customRole) {
        targetPriority = Math.max(targetPriority, (customRole.priority || 0) * 10);
      }
    }

    // Can only assign roles with lower priority than own
    return userPriority.highestPriority > targetPriority;
  };

  // Get priority for a given user (for comparison)
  const getUserPriority = async (targetUserId: string): Promise<number> => {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role, custom_role_id')
      .eq('user_id', targetUserId);

    let highest = 0;
    for (const roleEntry of roles || []) {
      const basePriority = BASE_ROLE_PRIORITIES[roleEntry.role] || 0;
      highest = Math.max(highest, basePriority);

      if (roleEntry.custom_role_id) {
        const customRole = customRoles.find(r => r.id === roleEntry.custom_role_id);
        if (customRole && customRole.is_active) {
          highest = Math.max(highest, (customRole.priority || 0) * 10);
        }
      }
    }

    return highest;
  };

  return {
    userPriority,
    isLoading,
    canManageUser,
    canAssignRole,
    getUserPriority,
    customRoles,
  };
}

// Helper to get role display info for a user
export async function getUserRoleDisplay(userId: string, customRoles: any[]) {
  const { data: roles } = await supabase
    .from('user_roles')
    .select('role, custom_role_id')
    .eq('user_id', userId);

  let highestPriority = 0;
  let displayIcon = 'user';
  let displayColor = '#6b7280';
  let displayName = 'User';

  for (const roleEntry of roles || []) {
    const basePriority = BASE_ROLE_PRIORITIES[roleEntry.role] || 0;
    
    if (basePriority > highestPriority) {
      highestPriority = basePriority;
      displayName = roleEntry.role;
      displayIcon = roleEntry.role === 'admin' ? 'crown' : 'shield';
      displayColor = roleEntry.role === 'admin' ? '#eab308' : '#6366f1';
    }

    if (roleEntry.custom_role_id) {
      const customRole = customRoles.find((r: any) => r.id === roleEntry.custom_role_id);
      if (customRole && customRole.is_active) {
        const customPriority = (customRole.priority || 0) * 10;
        if (customPriority >= highestPriority) {
          highestPriority = customPriority;
          displayName = customRole.display_name;
          displayIcon = customRole.icon || 'shield';
          displayColor = customRole.color || '#6366f1';
        }
      }
    }
  }

  return { displayIcon, displayColor, displayName, priority: highestPriority };
}
