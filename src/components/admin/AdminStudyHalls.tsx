import { useState } from 'react';
import { useStudyHalls, StudyHall } from '@/hooks/useStudyHalls';
import { useSchools } from '@/hooks/useSchools';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Plus, Trash2, Users, MapPin, Edit2 } from 'lucide-react';

export function AdminStudyHalls() {
  const { studyHalls, isLoading, createStudyHall, deleteStudyHall, updateOccupancy } = useStudyHalls();
  const { schools } = useSchools();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHall, setEditingHall] = useState<StudyHall | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    teacher: '',
    capacity: 30,
    school_id: '',
    periods: '',
  });

  const handleCreate = () => {
    createStudyHall.mutate({
      name: formData.name,
      location: formData.location,
      teacher: formData.teacher || null,
      capacity: formData.capacity,
      current_occupancy: 0,
      is_available: true,
      school_id: formData.school_id || null,
      periods: formData.periods.split(',').map(p => p.trim()).filter(Boolean),
    });
    setFormData({ name: '', location: '', teacher: '', capacity: 30, school_id: '', periods: '' });
    setIsDialogOpen(false);
  };

  const handleOccupancyChange = (hallId: string, newOccupancy: number) => {
    updateOccupancy.mutate({ id: hallId, occupancy: newOccupancy });
  };

  if (isLoading) {
    return (
      <Card className="card-elevated animate-pulse">
        <CardContent className="h-64" />
      </Card>
    );
  }

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-display flex items-center gap-2">
              <Users className="w-5 h-5" />
              Study Halls Management
            </CardTitle>
            <CardDescription>
              Manage study halls and update live occupancy
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Study Hall
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Study Hall</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Library Study Hall"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Main Library, 2nd Floor"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teacher</Label>
                  <Input
                    value={formData.teacher}
                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                    placeholder="Mrs. Thompson"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Capacity</Label>
                    <Input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 30 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>School</Label>
                    <Select
                      value={formData.school_id}
                      onValueChange={(v) => setFormData({ ...formData, school_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select school" />
                      </SelectTrigger>
                      <SelectContent>
                        {schools.map(school => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Periods (comma-separated)</Label>
                  <Input
                    value={formData.periods}
                    onChange={(e) => setFormData({ ...formData, periods: e.target.value })}
                    placeholder="Period 1, Period 3, Period 5"
                  />
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={!formData.name || !formData.location || createStudyHall.isPending}
                  className="w-full"
                >
                  Create Study Hall
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {studyHalls.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No study halls created yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Occupancy</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studyHalls.map(hall => (
                <TableRow key={hall.id}>
                  <TableCell className="font-medium">{hall.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      {hall.location}
                    </div>
                  </TableCell>
                  <TableCell>{hall.teacher || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[200px]">
                      <span className="text-sm w-12">
                        {hall.current_occupancy}/{hall.capacity}
                      </span>
                      <Slider
                        value={[hall.current_occupancy]}
                        max={hall.capacity}
                        step={1}
                        onValueChange={([value]) => handleOccupancyChange(hall.id, value)}
                        className="flex-1"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={hall.is_available ? 'default' : 'secondary'}>
                      {hall.is_available ? 'Available' : 'Full'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteStudyHall.mutate(hall.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
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
