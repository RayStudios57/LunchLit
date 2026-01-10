import { useState } from 'react';
import { useAdminUserRoles, AppRole } from '@/hooks/useAdminUserRoles';
import { useSchools } from '@/hooks/useSchools';
import { useCustomRoles } from '@/hooks/useCustomRoles';
import { useRoleRequests } from '@/hooks/useRoleRequests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Users, Loader2, Search, Clock, CheckCircle2, XCircle, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const roleLabels: Record<AppRole, string> = {
  admin: 'Admin',
  teacher: 'Teacher',
  counselor: 'Counselor',
  student: 'Student',
};

const roleBadgeVariants: Record<AppRole, 'destructive' | 'default' | 'secondary' | 'outline'> = {
  admin: 'destructive',
  teacher: 'default',
  counselor: 'default',
  student: 'secondary',
};

export function AdminUserRoles() {
  const { users, isLoading, addRole, removeRole } = useAdminUserRoles();
  const { schools } = useSchools();
  const { customRoles } = useCustomRoles();
  const { allRequests, reviewRequest, isLoading: requestsLoading } = useRoleRequests();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [foundUser, setFoundUser] = useState<{ id: string; email: string; full_name: string | null } | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole>('teacher');
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedCustomRole, setSelectedCustomRole] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Role request review state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.roles.some(r => r.role.toLowerCase().includes(searchLower))
    );
  });

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) return;
    
    setIsSearching(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .limit(100);
      
      if (error) throw error;

      toast({
        title: 'Search by name',
        description: 'Enter part of the user\'s name to find them in the list below.',
      });
      setSearchTerm(searchEmail);
      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Search failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddRole = async (userId: string, userEmail?: string, userName?: string) => {
    await addRole.mutateAsync({
      userId,
      role: selectedRole,
      schoolId: selectedSchool || undefined,
      customRoleId: selectedCustomRole || undefined,
    });
    
    // Send email notification
    if (userEmail) {
      await sendRoleNotification(userEmail, userName, roleLabels[selectedRole], 'added');
    }
    
    setIsAddDialogOpen(false);
    setFoundUser(null);
    setSearchEmail('');
    setSelectedRole('teacher');
    setSelectedSchool('');
    setSelectedCustomRole('');
  };

  const sendRoleNotification = async (
    email: string,
    userName: string | undefined,
    roleName: string,
    action: 'added' | 'removed'
  ) => {
    try {
      const { error } = await supabase.functions.invoke('send-role-notification', {
        body: {
          type: 'role_changed',
          userEmail: email,
          userName,
          roleName,
          action,
        },
      });
      
      if (error) {
        console.error('Failed to send email notification:', error);
      }
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  };

  const handleReviewRequest = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;
    
    setIsApproving(true);
    try {
      await reviewRequest.mutateAsync({
        requestId: selectedRequest.id,
        status,
        adminNotes: adminNotes || undefined,
      });

      // If approved, add the role
      if (status === 'approved') {
        const user = users.find(u => u.id === selectedRequest.user_id);
        if (user) {
          await addRole.mutateAsync({
            userId: selectedRequest.user_id,
            role: selectedRequest.requested_role as AppRole,
          });
        }
      }

      // Get user email to send notification
      const user = users.find(u => u.id === selectedRequest.user_id);
      if (user?.email) {
        try {
          await supabase.functions.invoke('send-role-notification', {
            body: {
              type: 'request_reviewed',
              userEmail: user.email,
              userName: user.full_name,
              roleName: selectedRequest.requested_role,
              status,
              adminNotes: adminNotes || undefined,
            },
          });
        } catch (err) {
          console.error('Error sending review notification:', err);
        }
      }

      setReviewDialogOpen(false);
      setSelectedRequest(null);
      setAdminNotes('');
    } finally {
      setIsApproving(false);
    }
  };

  const pendingRequests = allRequests.filter(r => r.status === 'pending');

  // Filter out schools with invalid IDs
  const validSchools = schools.filter(school => school.id && school.id.trim() !== '');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Role Management
            </CardTitle>
            <CardDescription>
              Assign and manage user roles and permissions
            </CardDescription>
          </div>
          {pendingRequests.length > 0 && (
            <Badge variant="destructive" className="gap-1">
              <Clock className="h-3 w-3" />
              {pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              Requests
              {pendingRequests.length > 0 && (
                <span className="ml-1 text-xs bg-destructive text-destructive-foreground rounded-full px-1.5">
                  {pendingRequests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No users found with assigned roles.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.full_name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">{user.email || user.id.slice(0, 8) + '...'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <div key={role.id} className="flex items-center gap-1">
                          <Badge 
                            variant={roleBadgeVariants[role.role]}
                            style={role.custom_role_color ? { backgroundColor: role.custom_role_color, color: 'white' } : undefined}
                          >
                            {role.custom_role_name || roleLabels[role.role]}
                            {role.school_id && (
                              <span className="ml-1 opacity-75">
                                ({validSchools.find(s => s.id === role.school_id)?.name?.slice(0, 10) || 'School'})
                              </span>
                            )}
                          </Badge>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-5 w-5">
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Role?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove the {roleLabels[role.role]} role from this user. They will be notified via email.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={async () => {
                                    await removeRole.mutateAsync(role.id);
                                    await sendRoleNotification(
                                      user.email,
                                      user.full_name || undefined,
                                      roleLabels[role.role],
                                      'removed'
                                    );
                                  }}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Role
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Role to {user.full_name || 'User'}</DialogTitle>
                          <DialogDescription>
                            Select a role and optionally a school to assign to this user. They will be notified via email.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Base Role</Label>
                            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin (Full access)</SelectItem>
                                <SelectItem value="teacher">Teacher (Verify entries)</SelectItem>
                                <SelectItem value="counselor">Counselor (Verify entries)</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {customRoles.length > 0 && (
                            <div className="space-y-2">
                              <Label>Custom Role (Optional - adds extra permissions)</Label>
                              <Select 
                                value={selectedCustomRole || "none"} 
                                onValueChange={(v) => setSelectedCustomRole(v === "none" ? "" : v)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="No custom role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">No custom role</SelectItem>
                                  {customRoles.map((cr) => (
                                    <SelectItem key={cr.id} value={cr.id}>
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-2 h-2 rounded-full"
                                          style={{ backgroundColor: cr.color }}
                                        />
                                        {cr.display_name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">
                                Custom roles add extra permissions on top of the base role.
                              </p>
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <Label>School (Optional - for scoped access)</Label>
                            <Select 
                              value={selectedSchool || "global"} 
                              onValueChange={(v) => setSelectedSchool(v === "global" ? "" : v)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="No school (global access)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="global">No school (global access)</SelectItem>
                                {validSchools.map((school) => (
                                  <SelectItem key={school.id} value={school.id}>
                                    {school.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                              If a school is selected, the user's access will be limited to that school's data.
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mr-auto">
                            <Mail className="h-3 w-3" />
                            User will be notified
                          </div>
                          <Button
                            onClick={() => handleAddRole(user.id, user.email, user.full_name || undefined)}
                            disabled={addRole.isPending}
                          >
                            {addRole.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Add Role
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
          </TabsContent>
          
          <TabsContent value="requests" className="space-y-4">
            {requestsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : allRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No role upgrade requests.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Requested Role</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allRequests.map((request) => {
                    const requestUser = users.find(u => u.id === request.user_id);
                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{requestUser?.full_name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(request.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {request.requested_role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm line-clamp-2 max-w-[200px]">{request.reason}</p>
                        </TableCell>
                        <TableCell>
                          {request.status === 'pending' && (
                            <Badge variant="outline" className="gap-1">
                              <Clock className="h-3 w-3" /> Pending
                            </Badge>
                          )}
                          {request.status === 'approved' && (
                            <Badge variant="default" className="gap-1 bg-green-600">
                              <CheckCircle2 className="h-3 w-3" /> Approved
                            </Badge>
                          )}
                          {request.status === 'rejected' && (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" /> Rejected
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {request.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setReviewDialogOpen(true);
                              }}
                            >
                              Review
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Role Request</DialogTitle>
              <DialogDescription>
                Review this role upgrade request and approve or reject it.
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4 py-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Requested Role:</span>
                    <Badge variant="outline" className="capitalize">{selectedRequest.requested_role}</Badge>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Reason:</span>
                    <p className="mt-1 text-sm">{selectedRequest.reason}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Admin Notes (Optional)</Label>
                  <Textarea
                    placeholder="Add notes about your decision..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mr-auto">
                <Mail className="h-3 w-3" />
                User will be notified
              </div>
              <Button
                variant="destructive"
                onClick={() => handleReviewRequest('rejected')}
                disabled={isApproving}
              >
                {isApproving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Reject
              </Button>
              <Button
                onClick={() => handleReviewRequest('approved')}
                disabled={isApproving}
              >
                {isApproving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
