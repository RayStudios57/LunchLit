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
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Trash2, Edit, Shield, Loader2, 
  Users, School, UtensilsCrossed, BookOpen, CheckCircle, 
  MessageSquare, BarChart3, Settings, Crown, Star, Sparkles,
  GraduationCap, Briefcase, Heart, Zap, Award
} from 'lucide-react';

const AVAILABLE_PERMISSIONS = [
  { id: 'manage_users', label: 'Manage Users', description: 'Can view and modify user accounts' },
  { id: 'manage_schools', label: 'Manage Schools', description: 'Can add and edit schools' },
  { id: 'manage_menus', label: 'Manage Menus', description: 'Can add and edit meal schedules' },
  { id: 'manage_study_halls', label: 'Manage Study Halls', description: 'Can manage study hall availability' },
  { id: 'verify_entries', label: 'Verify Entries', description: 'Can verify brag sheet entries' },
  { id: 'manage_discussions', label: 'Manage Discussions', description: 'Can moderate and pin discussions' },
  { id: 'view_analytics', label: 'View Analytics', description: 'Can view usage analytics' },
  { id: 'manage_roles', label: 'Manage Roles', description: 'Can create and assign custom roles' },
  { id: 'manage_tasks', label: 'Manage Tasks', description: 'Can view and manage all user tasks' },
  { id: 'manage_brag_sheets', label: 'Manage Brag Sheets', description: 'Can view all brag sheet entries' },
  { id: 'manage_notifications', label: 'Manage Notifications', description: 'Can send system-wide notifications' },
  { id: 'view_reports', label: 'View Reports', description: 'Can access detailed reports and exports' },
  { id: 'manage_email_domains', label: 'Manage Email Domains', description: 'Can configure allowed email domains' },
  { id: 'impersonate_users', label: 'Impersonate Users', description: 'Can view app as another user (admin only)' },
];

const AVAILABLE_ICONS = [
  { id: 'shield', label: 'Shield', icon: Shield },
  { id: 'crown', label: 'Crown', icon: Crown },
  { id: 'star', label: 'Star', icon: Star },
  { id: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'graduation-cap', label: 'Graduation', icon: GraduationCap },
  { id: 'briefcase', label: 'Briefcase', icon: Briefcase },
  { id: 'heart', label: 'Heart', icon: Heart },
  { id: 'zap', label: 'Lightning', icon: Zap },
  { id: 'award', label: 'Award', icon: Award },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'book-open', label: 'Book', icon: BookOpen },
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

const getIconComponent = (iconId: string) => {
  const found = AVAILABLE_ICONS.find(i => i.id === iconId);
  return found ? found.icon : Shield;
};

export function AdminCustomRoles() {
  const { customRoles, isLoading, createCustomRole, updateCustomRole, deleteCustomRole } = useCustomRoles();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateCustomRoleInput>({
    name: '',
    display_name: '',
    description: '',
    color: '#6366f1',
    icon: 'shield',
    priority: 0,
    is_active: true,
    permissions: [],
  });

  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      description: '',
      color: '#6366f1',
      icon: 'shield',
      priority: 0,
      is_active: true,
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
      icon: formData.icon,
      priority: formData.priority,
      is_active: formData.is_active,
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
      icon: role.icon || 'shield',
      priority: role.priority ?? 0,
      is_active: role.is_active ?? true,
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
    <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor="priority">Priority Level</Label>
          <Select
            value={String(formData.priority ?? 0)}
            onValueChange={(val) => setFormData(prev => ({ ...prev, priority: parseInt(val) }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0 - Standard</SelectItem>
              <SelectItem value="1">1 - Elevated</SelectItem>
              <SelectItem value="2">2 - High</SelectItem>
              <SelectItem value="3">3 - Senior</SelectItem>
              <SelectItem value="4">4 - Lead</SelectItem>
              <SelectItem value="5">5 - Executive</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
      
      <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
        <div className="space-y-0.5">
          <Label htmlFor="is_active">Active Status</Label>
          <p className="text-xs text-muted-foreground">Inactive roles won't grant any permissions</p>
        </div>
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Icon</Label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_ICONS.map((iconOption) => {
            const IconComp = iconOption.icon;
            return (
              <button
                key={iconOption.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, icon: iconOption.id }))}
                className={`p-2 rounded-lg border-2 transition-all ${
                  formData.icon === iconOption.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-transparent bg-muted hover:bg-muted/80'
                }`}
                title={iconOption.label}
              >
                <IconComp className="h-5 w-5" />
              </button>
            );
          })}
        </div>
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
        <Label>Permissions ({formData.permissions?.length || 0} selected)</Label>
        <div className="grid gap-2 max-h-48 overflow-y-auto border rounded-lg p-2">
          {AVAILABLE_PERMISSIONS.map((perm) => (
            <div
              key={perm.id}
              className="flex items-start space-x-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
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
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customRoles.map((role) => {
                const IconComp = getIconComponent(role.icon);
                return (
                  <TableRow key={role.id} className={!role.is_active ? 'opacity-50' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: role.color + '20' }}
                        >
                          <IconComp className="h-4 w-4" style={{ color: role.color }} />
                        </div>
                        <div>
                          <span className="font-medium">{role.display_name}</span>
                          {role.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {role.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        Level {role.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={role.is_active ? 'default' : 'secondary'}>
                        {role.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(role.permissions || []).slice(0, 2).map((perm) => (
                          <Badge key={perm} variant="secondary" className="text-xs">
                            {AVAILABLE_PERMISSIONS.find(p => p.id === perm)?.label || perm}
                          </Badge>
                        ))}
                        {(role.permissions || []).length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 2} more
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
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
