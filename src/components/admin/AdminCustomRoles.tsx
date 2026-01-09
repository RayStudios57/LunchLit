import { useState } from 'react';
import { useCustomRoles, CreateCustomRoleInput } from '@/hooks/useCustomRoles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Edit, Shield, Loader2 } from 'lucide-react';

const AVAILABLE_PERMISSIONS = [
  { id: 'manage_users', label: 'Manage Users', description: 'Can view and modify user accounts' },
  { id: 'manage_schools', label: 'Manage Schools', description: 'Can add and edit schools' },
  { id: 'manage_menus', label: 'Manage Menus', description: 'Can add and edit meal schedules' },
  { id: 'manage_study_halls', label: 'Manage Study Halls', description: 'Can manage study hall availability' },
  { id: 'verify_entries', label: 'Verify Entries', description: 'Can verify brag sheet entries' },
  { id: 'manage_discussions', label: 'Manage Discussions', description: 'Can moderate and pin discussions' },
  { id: 'view_analytics', label: 'View Analytics', description: 'Can view usage analytics' },
  { id: 'manage_roles', label: 'Manage Roles', description: 'Can create and assign custom roles' },
];

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#d946ef', // fuchsia
  '#ec4899', // pink
];

export function AdminCustomRoles() {
  const { customRoles, isLoading, createCustomRole, updateCustomRole, deleteCustomRole } = useCustomRoles();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateCustomRoleInput>({
    name: '',
    display_name: '',
    description: '',
    color: '#6366f1',
    permissions: [],
  });

  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      description: '',
      color: '#6366f1',
      permissions: [],
    });
  };

  const handleCreate = async () => {
    if (!formData.display_name.trim()) return;
    
    await createCustomRole.mutateAsync({
      ...formData,
      name: formData.display_name.toLowerCase().replace(/\s+/g, '_'),
    });
    
    setIsCreateOpen(false);
    resetForm();
  };

  const handleUpdate = async (id: string) => {
    await updateCustomRole.mutateAsync({
      id,
      display_name: formData.display_name,
      description: formData.description,
      color: formData.color,
      permissions: formData.permissions,
    });
    
    setEditingRole(null);
    resetForm();
  };

  const handleEditClick = (role: typeof customRoles[0]) => {
    setFormData({
      name: role.name,
      display_name: role.display_name,
      description: role.description || '',
      color: role.color,
      permissions: role.permissions || [],
    });
    setEditingRole(role.id);
  };

  const togglePermission = (permId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions?.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...(prev.permissions || []), permId],
    }));
  };

  const RoleForm = ({ onSubmit, isEdit = false }: { onSubmit: () => void; isEdit?: boolean }) => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="display_name">Role Name *</Label>
        <Input
          id="display_name"
          value={formData.display_name}
          onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
          placeholder="e.g., Cafeteria Staff"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="What can this role do?"
          rows={2}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, color }))}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${
                formData.color === color ? 'border-foreground scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Permissions</Label>
        <div className="grid gap-2 max-h-48 overflow-y-auto">
          {AVAILABLE_PERMISSIONS.map((perm) => (
            <div
              key={perm.id}
              className="flex items-start space-x-3 p-2 rounded-lg border bg-muted/50"
            >
              <Checkbox
                id={perm.id}
                checked={formData.permissions?.includes(perm.id)}
                onCheckedChange={() => togglePermission(perm.id)}
              />
              <div className="grid gap-0.5">
                <label htmlFor={perm.id} className="text-sm font-medium cursor-pointer">
                  {perm.label}
                </label>
                <p className="text-xs text-muted-foreground">{perm.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <DialogFooter>
        <Button
          onClick={onSubmit}
          disabled={!formData.display_name.trim() || createCustomRole.isPending || updateCustomRole.isPending}
        >
          {(createCustomRole.isPending || updateCustomRole.isPending) && (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          )}
          {isEdit ? 'Update Role' : 'Create Role'}
        </Button>
      </DialogFooter>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Custom Roles
            </CardTitle>
            <CardDescription>
              Create and manage custom roles with specific permissions
            </CardDescription>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Custom Role</DialogTitle>
                <DialogDescription>
                  Define a new role with specific permissions
                </DialogDescription>
              </DialogHeader>
              <RoleForm onSubmit={handleCreate} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : customRoles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No custom roles created yet.</p>
            <p className="text-sm">Create your first custom role to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: role.color }}
                      />
                      <span className="font-medium">{role.display_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {role.description || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(role.permissions || []).slice(0, 3).map((perm) => (
                        <Badge key={perm} variant="secondary" className="text-xs">
                          {AVAILABLE_PERMISSIONS.find(p => p.id === perm)?.label || perm}
                        </Badge>
                      ))}
                      {(role.permissions || []).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Dialog open={editingRole === role.id} onOpenChange={(open) => {
                        if (!open) {
                          setEditingRole(null);
                          resetForm();
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(role)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Edit Role</DialogTitle>
                            <DialogDescription>
                              Modify the role settings and permissions
                            </DialogDescription>
                          </DialogHeader>
                          <RoleForm onSubmit={() => handleUpdate(role.id)} isEdit />
                        </DialogContent>
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Role?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the "{role.display_name}" role and remove it from all assigned users.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteCustomRole.mutate(role.id)}
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
  );
}
