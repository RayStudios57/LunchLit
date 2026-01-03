import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Trash2, Pencil, School, Loader2, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface School {
  id: string;
  name: string;
  address: string | null;
  created_at: string;
}

export function AdminSchools() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [newSchool, setNewSchool] = useState({ name: '', address: '' });

  const { data: schools = [], isLoading } = useQuery({
    queryKey: ['admin-schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as School[];
    },
  });

  const addSchool = useMutation({
    mutationFn: async (school: { name: string; address: string }) => {
      const { data, error } = await supabase
        .from('schools')
        .insert({ name: school.name, address: school.address || null })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-schools'] });
      toast({ title: 'School added successfully' });
      setIsAddOpen(false);
      setNewSchool({ name: '', address: '' });
    },
    onError: (error) => {
      toast({ title: 'Error adding school', description: error.message, variant: 'destructive' });
    },
  });

  const updateSchool = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name: string; address: string }) => {
      const { data, error } = await supabase
        .from('schools')
        .update({ name: updates.name, address: updates.address || null })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-schools'] });
      toast({ title: 'School updated successfully' });
      setEditingSchool(null);
    },
    onError: (error) => {
      toast({ title: 'Error updating school', description: error.message, variant: 'destructive' });
    },
  });

  const deleteSchool = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-schools'] });
      toast({ title: 'School deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting school', description: error.message, variant: 'destructive' });
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              School Management
            </CardTitle>
            <CardDescription>
              Add and manage schools in the system
            </CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Add School
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New School</DialogTitle>
                <DialogDescription>
                  Enter the school's details below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>School Name</Label>
                  <Input
                    placeholder="e.g., Lincoln High School"
                    value={newSchool.name}
                    onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address (Optional)</Label>
                  <Input
                    placeholder="e.g., 123 Main St, City, State"
                    value={newSchool.address}
                    onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => addSchool.mutate(newSchool)}
                  disabled={!newSchool.name.trim() || addSchool.isPending}
                >
                  {addSchool.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add School
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
        ) : schools.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <School className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No schools added yet.</p>
            <p className="text-sm">Click "Add School" to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell className="font-medium">{school.name}</TableCell>
                  <TableCell>
                    {school.address ? (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {school.address}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Dialog open={editingSchool?.id === school.id} onOpenChange={(open) => !open && setEditingSchool(null)}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setEditingSchool(school)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit School</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>School Name</Label>
                              <Input
                                value={editingSchool?.name || ''}
                                onChange={(e) => setEditingSchool(prev => prev ? { ...prev, name: e.target.value } : null)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Address</Label>
                              <Input
                                value={editingSchool?.address || ''}
                                onChange={(e) => setEditingSchool(prev => prev ? { ...prev, address: e.target.value } : null)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={() => editingSchool && updateSchool.mutate({
                                id: editingSchool.id,
                                name: editingSchool.name,
                                address: editingSchool.address || '',
                              })}
                              disabled={updateSchool.isPending}
                            >
                              {updateSchool.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                              Save Changes
                            </Button>
                          </DialogFooter>
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
                            <AlertDialogTitle>Delete School?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{school.name}" and may affect associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteSchool.mutate(school.id)}
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