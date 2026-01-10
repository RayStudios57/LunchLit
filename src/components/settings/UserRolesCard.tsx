import { useState } from 'react';
import { usePermissions, Permission } from '@/hooks/usePermissions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleRequests } from '@/hooks/useRoleRequests';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Check, Lock, User, Building2, ArrowUpCircle, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const PERMISSION_LABELS: Record<Permission, { label: string; description: string }> = {
  manage_users: { label: 'Manage Users', description: 'View and modify user accounts' },
  manage_schools: { label: 'Manage Schools', description: 'Add and edit schools' },
  manage_menus: { label: 'Manage Menus', description: 'Add and edit meal schedules' },
  manage_study_halls: { label: 'Manage Study Halls', description: 'Manage study hall availability' },
  verify_entries: { label: 'Verify Entries', description: 'Verify brag sheet entries' },
  manage_discussions: { label: 'Manage Discussions', description: 'Moderate and pin discussions' },
  view_analytics: { label: 'View Analytics', description: 'View usage analytics' },
  manage_roles: { label: 'Manage Roles', description: 'Create and assign custom roles' },
};

const ROLE_INFO: Record<string, { label: string; color: string; description: string }> = {
  admin: { label: 'Administrator', color: 'hsl(0, 84%, 60%)', description: 'Full system access' },
  teacher: { label: 'Teacher', color: 'hsl(142, 71%, 45%)', description: 'Can verify entries and manage study halls' },
  counselor: { label: 'Counselor', color: 'hsl(217, 91%, 60%)', description: 'Can verify entries and view analytics' },
  student: { label: 'Student', color: 'hsl(262, 83%, 58%)', description: 'Standard user access' },
};

interface UserRoleData {
  id: string;
  role: string;
  school_id: string | null;
  custom_role_id: string | null;
  school_name?: string | null;
  custom_role?: {
    display_name: string;
    description: string | null;
    color: string;
    permissions: string[];
  } | null;
}

const AVAILABLE_ROLES = [
  { value: 'teacher', label: 'Teacher', description: 'Verify entries and manage study halls' },
  { value: 'counselor', label: 'Counselor', description: 'Verify entries and view analytics' },
  { value: 'admin', label: 'Administrator', description: 'Full system access' },
];

export function UserRolesCard() {
  const { user } = useAuth();
  const { permissions, isLoading: permissionsLoading } = usePermissions();
  const { myRequests, submitRequest, hasPendingRequest, isLoading: requestsLoading } = useRoleRequests();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [reason, setReason] = useState('');

  const { data: userRoles, isLoading: rolesLoading } = useQuery({
    queryKey: ['my-roles', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          role,
          school_id,
          custom_role_id,
          custom_roles (
            display_name,
            description,
            color,
            permissions
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Fetch school names for roles with school_id
      const schoolIds = data?.filter(r => r.school_id).map(r => r.school_id) || [];
      let schoolsMap: Record<string, string> = {};

      if (schoolIds.length > 0) {
        const { data: schools } = await supabase
          .from('schools')
          .select('id, name')
          .in('id', schoolIds);

        schools?.forEach(s => {
          schoolsMap[s.id] = s.name;
        });
      }

      return (data || []).map((role: any) => ({
        ...role,
        school_name: role.school_id ? schoolsMap[role.school_id] : null,
        custom_role: role.custom_roles ? {
          display_name: role.custom_roles.display_name,
          description: role.custom_roles.description,
          color: role.custom_roles.color,
          permissions: Array.isArray(role.custom_roles.permissions) ? role.custom_roles.permissions : [],
        } : null,
      })) as UserRoleData[];
    },
    enabled: !!user,
  });

  const isLoading = permissionsLoading || rolesLoading || requestsLoading;
  const allPermissions = Array.from(permissions);

  const handleSubmitRequest = async () => {
    if (!selectedRole || !reason.trim()) return;
    
    await submitRequest.mutateAsync({
      requestedRole: selectedRole,
      reason: reason.trim(),
    });
    
    setIsDialogOpen(false);
    setSelectedRole('');
    setReason('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle2 className="h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Your Roles & Permissions
        </CardTitle>
        <CardDescription>
          View your assigned roles and what you can do in the app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Assigned Roles */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            Assigned Roles
          </h3>
          
          {(!userRoles || userRoles.length === 0) ? (
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 text-center">
              <Lock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>You don't have any special roles assigned.</p>
              <p className="text-xs mt-1">Contact an administrator if you need additional access.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {userRoles.map((role) => {
                const baseRole = ROLE_INFO[role.role];
                const customRole = role.custom_role;
                
                return (
                  <div
                    key={role.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div
                      className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: customRole?.color || baseRole?.color || 'hsl(var(--primary))' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">
                          {customRole?.display_name || baseRole?.label || role.role}
                        </span>
                        {customRole && (
                          <Badge variant="outline" className="text-xs">
                            Custom Role
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {customRole?.description || baseRole?.description || 'No description'}
                      </p>
                      
                      {role.school_name && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          <span>Scoped to: {role.school_name}</span>
                        </div>
                      )}
                      
                      {/* Show custom role permissions */}
                      {customRole && customRole.permissions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {customRole.permissions.slice(0, 4).map((perm) => (
                            <Badge key={perm} variant="secondary" className="text-xs">
                              {PERMISSION_LABELS[perm as Permission]?.label || perm}
                            </Badge>
                          ))}
                          {customRole.permissions.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{customRole.permissions.length - 4} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* All Permissions */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Check className="h-4 w-4" />
            Your Permissions ({allPermissions.length})
          </h3>
          
          {allPermissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You have standard user permissions.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(PERMISSION_LABELS).map(([key, { label, description }]) => {
                const hasPermission = permissions.has(key as Permission);
                
                return (
                  <div
                    key={key}
                    className={`flex items-start gap-2 p-2 rounded-lg border ${
                      hasPermission 
                        ? 'bg-primary/5 border-primary/20' 
                        : 'bg-muted/30 border-transparent opacity-50'
                    }`}
                  >
                    <div className={`mt-0.5 ${hasPermission ? 'text-primary' : 'text-muted-foreground'}`}>
                      {hasPermission ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${!hasPermission && 'text-muted-foreground'}`}>
                        {label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Request Role Upgrade */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium flex items-center gap-2">
                <ArrowUpCircle className="h-4 w-4" />
                Request Role Upgrade
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Need additional permissions? Submit a request to an administrator.
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={hasPendingRequest}
                >
                  {hasPendingRequest ? 'Request Pending' : 'Request Upgrade'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Role Upgrade</DialogTitle>
                  <DialogDescription>
                    Explain why you need additional permissions. An administrator will review your request.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Requested Role</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div>
                              <span className="font-medium">{role.label}</span>
                              <span className="text-muted-foreground ml-2 text-xs">
                                {role.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Reason for Request</Label>
                    <Textarea
                      placeholder="Please explain why you need this role and how you'll use the additional permissions..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Be specific about your responsibilities and why you need these permissions.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitRequest}
                    disabled={!selectedRole || !reason.trim() || submitRequest.isPending}
                  >
                    {submitRequest.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Submit Request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Previous Requests */}
          {myRequests.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Your Requests</p>
              <div className="space-y-2">
                {myRequests.slice(0, 3).map((request) => (
                  <div
                    key={request.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-card text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium capitalize">{request.requested_role}</span>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {request.reason}
                      </p>
                      {request.admin_notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          Admin: {request.admin_notes}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(request.created_at), 'MMM d')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
