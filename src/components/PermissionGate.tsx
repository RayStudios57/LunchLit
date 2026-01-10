import { ReactNode } from 'react';
import { usePermissions, Permission } from '@/hooks/usePermissions';

interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

/**
 * A component that conditionally renders children based on user permissions.
 * 
 * @param permission - Single permission to check
 * @param permissions - Array of permissions to check
 * @param requireAll - If true, requires all permissions (AND). If false, requires any (OR). Default: false
 * @param fallback - Optional content to render if permission check fails
 */
export function PermissionGate({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  // Check single permission
  if (permission) {
    if (!hasPermission(permission)) {
      return <>{fallback}</>;
    }
    return <>{children}</>;
  }

  // Check multiple permissions
  if (permissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

/**
 * Hook to check if user has access to a specific feature.
 * Useful for imperative checks in event handlers.
 */
export function useFeatureAccess() {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isAdmin } = usePermissions();

  return {
    canManageUsers: () => hasPermission('manage_users') || isAdmin,
    canManageSchools: () => hasPermission('manage_schools') || isAdmin,
    canManageMenus: () => hasPermission('manage_menus') || isAdmin,
    canManageStudyHalls: () => hasPermission('manage_study_halls') || isAdmin,
    canVerifyEntries: () => hasPermission('verify_entries') || isAdmin,
    canManageDiscussions: () => hasPermission('manage_discussions') || isAdmin,
    canViewAnalytics: () => hasPermission('view_analytics') || isAdmin,
    canManageRoles: () => hasPermission('manage_roles') || isAdmin,
  };
}
