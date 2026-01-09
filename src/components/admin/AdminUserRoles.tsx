import { useState } from 'react';
import { useAdminUserRoles, AppRole } from '@/hooks/useAdminUserRoles';
import { useSchools } from '@/hooks/useSchools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Trash2, Users, Loader2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [foundUser, setFoundUser] = useState<{ id: string; email: string; full_name: string | null } | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole>('teacher');
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

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
      // Search in profiles by email pattern (since we can't access auth.users directly from client)
      // We'll try to find the user by their profile
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .limit(100);
      
      if (error) throw error;

      // For now, we'll show a message that user needs to search by user ID or name
      // In a real app, you'd have an edge function to search users by email
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

  const handleAddRole = async (userId: string) => {
    await addRole.mutateAsync({
      userId,
      role: selectedRole,
      schoolId: selectedSchool || undefined,
    });
    setIsAddDialogOpen(false);
    setFoundUser(null);
    setSearchEmail('');
    setSelectedRole('teacher');
    setSelectedSchool('');
  };

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
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
                          <Badge variant={roleBadgeVariants[role.role]}>
                            {roleLabels[role.role]}
                            {role.school_id && (
                              <span className="ml-1 opacity-75">
                                ({schools.find(s => s.id === role.school_id)?.name?.slice(0, 10) || 'School'})
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
                                  This will remove the {roleLabels[role.role]} role from this user.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => removeRole.mutate(role.id)}
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
                            Select a role and optionally a school to assign to this user.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Role</Label>
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
                          
                          <div className="space-y-2">
                            <Label>School (Optional - for scoped access)</Label>
                            <Select value={selectedSchool || "none"} onValueChange={(v) => setSelectedSchool(v === "none" ? "" : v)}>
                              <SelectTrigger>
                                <SelectValue placeholder="No school (global access)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No school (global access)</SelectItem>
                                {schools.map((school) => (
                                  <SelectItem key={school.id} value={school.id}>
                                    {school.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                              If a school is selected, the user's admin access will be limited to that school's data.
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={() => handleAddRole(user.id)}
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
      </CardContent>
    </Card>
  );
}
