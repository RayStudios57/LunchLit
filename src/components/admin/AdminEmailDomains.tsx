import { useState } from 'react';
import { useEmailDomains, AppRole } from '@/hooks/useEmailDomains';
import { useSchools } from '@/hooks/useSchools';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Trash2, Edit2, Shield, ShieldAlert, Loader2 } from 'lucide-react';

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

export function AdminEmailDomains() {
  const { domains, isLoading, addDomain, updateDomain, deleteDomain } = useEmailDomains();
  const { schools } = useSchools();
  const { isAdmin } = useUserRoles();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<string | null>(null);
  
  // Form state
  const [domain, setDomain] = useState('');
  const [autoAssignRole, setAutoAssignRole] = useState<AppRole>('teacher');
  const [schoolId, setSchoolId] = useState<string>('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setDomain('');
    setAutoAssignRole('teacher');
    setSchoolId('');
    setDescription('');
    setEditingDomain(null);
  };

  const handleSubmit = async () => {
    if (!domain.trim()) return;
    
    if (editingDomain) {
      await updateDomain.mutateAsync({
        id: editingDomain,
        domain: domain.trim(),
        autoAssignRole,
        schoolId: schoolId || undefined,
        description: description || undefined,
      });
    } else {
      await addDomain.mutateAsync({
        domain: domain.trim(),
        autoAssignRole,
        schoolId: schoolId || undefined,
        description: description || undefined,
      });
    }
    
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (domainData: typeof domains[0]) => {
    setDomain(domainData.domain);
    setAutoAssignRole(domainData.auto_assign_role);
    setSchoolId(domainData.school_id || '');
    setDescription(domainData.description || '');
    setEditingDomain(domainData.id);
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteDomain.mutateAsync(id);
  };

  if (!isAdmin) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
            <p className="text-lg font-medium">Access Denied</p>
            <p className="text-sm text-muted-foreground">
              You need admin privileges to access this page.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Email Domain Management
              </CardTitle>
              <CardDescription>
                Configure school email domains and auto-assign roles on signup
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Domain
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingDomain ? 'Edit Domain' : 'Add Email Domain'}
                  </DialogTitle>
                  <DialogDescription>
                    Users signing up with this email domain will automatically be assigned the selected role.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="domain">Email Domain</Label>
                    <Input
                      id="domain"
                      placeholder="school.edu"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the domain without @ (e.g., "school.edu")
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Auto-assign Role</Label>
                    <Select value={autoAssignRole} onValueChange={(v) => setAutoAssignRole(v as AppRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="counselor">Counselor</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="school">Associated School (Optional)</Label>
                    <Select value={schoolId} onValueChange={setSchoolId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a school..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No school</SelectItem>
                        {schools.map((school) => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      placeholder="e.g., Main campus staff"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    resetForm();
                    setIsAddDialogOpen(false);
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={!domain.trim() || addDomain.isPending || updateDomain.isPending}
                  >
                    {(addDomain.isPending || updateDomain.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingDomain ? 'Update' : 'Add'} Domain
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : domains.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No email domains configured yet.</p>
              <p className="text-sm">Add a domain to enable auto-role assignment on signup.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Auto-assign Role</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono">@{d.domain}</TableCell>
                    <TableCell>
                      <Badge variant={roleBadgeVariants[d.auto_assign_role]}>
                        {roleLabels[d.auto_assign_role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {schools.find(s => s.id === d.school_id)?.name || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {d.description || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(d)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Domain?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove @{d.domain} from the allowed list. New users with this domain will no longer be auto-assigned roles.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(d.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• When a user signs up with an email matching a configured domain, they are automatically assigned the corresponding role.</p>
          <p>• If a school is associated, the user's role will be linked to that school.</p>
          <p>• Teachers and counselors can verify student brag sheet entries from their linked school.</p>
        </CardContent>
      </Card>
    </div>
  );
}
