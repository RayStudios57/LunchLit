import { useState } from 'react';
import { useTargetSchools, TargetSchool, TargetSchoolInsert } from '@/hooks/useTargetSchools';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, School, Trash2, Edit2, MapPin, Calendar } from 'lucide-react';

const statusLabels: Record<string, { label: string; color: string }> = {
  researching: { label: 'Researching', color: 'bg-muted' },
  applying: { label: 'Applying', color: 'bg-warning/10 text-warning' },
  applied: { label: 'Applied', color: 'bg-primary/10 text-primary' },
  accepted: { label: 'Accepted', color: 'bg-success/10 text-success' },
  rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive' },
  waitlisted: { label: 'Waitlisted', color: 'bg-warning/10 text-warning' },
  enrolled: { label: 'Enrolled', color: 'bg-success/10 text-success font-bold' },
};

export function TargetSchoolsManager() {
  const { schools, stats, addSchool, updateSchool, deleteSchool, isLoading } = useTargetSchools();
  const [isAdding, setIsAdding] = useState(false);
  const [editingSchool, setEditingSchool] = useState<TargetSchool | null>(null);
  const [formData, setFormData] = useState<TargetSchoolInsert>({
    school_name: '',
    location: null,
    application_deadline: null,
    admission_type: 'regular',
    status: 'researching',
    notes: null,
    is_reach: false,
    is_safety: false,
    is_match: false,
  });

  const resetForm = () => {
    setFormData({
      school_name: '',
      location: null,
      application_deadline: null,
      admission_type: 'regular',
      status: 'researching',
      notes: null,
      is_reach: false,
      is_safety: false,
      is_match: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.school_name.trim()) return;

    if (editingSchool) {
      await updateSchool.mutateAsync({ id: editingSchool.id, ...formData });
      setEditingSchool(null);
    } else {
      await addSchool.mutateAsync(formData);
      setIsAdding(false);
    }
    resetForm();
  };

  const openEdit = (school: TargetSchool) => {
    setEditingSchool(school);
    setFormData({
      school_name: school.school_name,
      location: school.location,
      application_deadline: school.application_deadline,
      admission_type: school.admission_type,
      status: school.status,
      notes: school.notes,
      is_reach: school.is_reach,
      is_safety: school.is_safety,
      is_match: school.is_match,
    });
  };

  const setSchoolCategory = (category: 'reach' | 'match' | 'safety') => {
    setFormData({
      ...formData,
      is_reach: category === 'reach',
      is_match: category === 'match',
      is_safety: category === 'safety',
    });
  };

  const getSchoolCategory = () => {
    if (formData.is_reach) return 'reach';
    if (formData.is_match) return 'match';
    if (formData.is_safety) return 'safety';
    return '';
  };

  const SchoolForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>School Name *</Label>
        <Input
          value={formData.school_name}
          onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
          placeholder="e.g., Massachusetts Institute of Technology"
          required
        />
      </div>

      <div>
        <Label>Location</Label>
        <Input
          value={formData.location || ''}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="e.g., Cambridge, MA"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Admission Type</Label>
          <Select 
            value={formData.admission_type} 
            onValueChange={(v) => setFormData({ ...formData, admission_type: v as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="early_decision">Early Decision</SelectItem>
              <SelectItem value="early_action">Early Action</SelectItem>
              <SelectItem value="regular">Regular Decision</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Application Deadline</Label>
          <Input
            type="date"
            value={formData.application_deadline || ''}
            onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value || null })}
          />
        </div>
      </div>

      <div>
        <Label>Status</Label>
        <Select 
          value={formData.status} 
          onValueChange={(v) => setFormData({ ...formData, status: v as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="researching">Researching</SelectItem>
            <SelectItem value="applying">Applying</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="waitlisted">Waitlisted</SelectItem>
            <SelectItem value="enrolled">Enrolled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>School Category</Label>
        <Select 
          value={getSchoolCategory()} 
          onValueChange={(v) => setSchoolCategory(v as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="reach">Reach (harder to get in)</SelectItem>
            <SelectItem value="match">Match (good chance)</SelectItem>
            <SelectItem value="safety">Safety (likely to get in)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Notes</Label>
        <Textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Why this school? What programs interest you?"
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={addSchool.isPending || updateSchool.isPending}>
          {editingSchool ? 'Update School' : 'Add School'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setIsAdding(false);
            setEditingSchool(null);
            resetForm();
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  // Group schools by category
  const reaches = schools.filter(s => s.is_reach);
  const matches = schools.filter(s => s.is_match);
  const safeties = schools.filter(s => s.is_safety);
  const uncategorized = schools.filter(s => !s.is_reach && !s.is_match && !s.is_safety);

  const SchoolCard = ({ school }: { school: TargetSchool }) => {
    const statusInfo = statusLabels[school.status] || statusLabels.researching;
    
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h5 className="font-medium">{school.school_name}</h5>
              {school.location && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {school.location}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className={`text-xs ${statusInfo.color}`}>
                  {statusInfo.label}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {school.admission_type.replace('_', ' ')}
                </Badge>
                {school.application_deadline && (
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(school.application_deadline).toLocaleDateString()}
                  </Badge>
                )}
              </div>
              {school.notes && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{school.notes}</p>
              )}
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => openEdit(school)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-destructive hover:text-destructive"
                onClick={() => deleteSchool.mutate(school.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Target Schools</h3>
          <p className="text-sm text-muted-foreground">Manage your college application list</p>
        </div>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add School
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Target School</DialogTitle>
            </DialogHeader>
            <SchoolForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="bg-destructive/10 text-destructive">
          {stats.reaches} Reach{stats.reaches !== 1 && 'es'}
        </Badge>
        <Badge variant="outline" className="bg-warning/10 text-warning">
          {stats.matches} Match{stats.matches !== 1 && 'es'}
        </Badge>
        <Badge variant="outline" className="bg-success/10 text-success">
          {stats.safeties} Safet{stats.safeties !== 1 ? 'ies' : 'y'}
        </Badge>
        {stats.accepted > 0 && (
          <Badge variant="outline" className="bg-success/10 text-success font-bold">
            ✓ {stats.accepted} Accepted
          </Badge>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingSchool} onOpenChange={(open) => !open && setEditingSchool(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit School</DialogTitle>
          </DialogHeader>
          <SchoolForm />
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : schools.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <School className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">No schools added</h3>
          <p className="text-muted-foreground text-sm mb-4">Start building your college list!</p>
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First School
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {reaches.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2 text-destructive">
                <School className="w-4 h-4" />
                Reach Schools
                <Badge variant="outline" className="text-xs bg-destructive/10">{reaches.length}</Badge>
              </h4>
              <div className="space-y-2">
                {reaches.map((school) => <SchoolCard key={school.id} school={school} />)}
              </div>
            </div>
          )}

          {matches.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2 text-warning">
                <School className="w-4 h-4" />
                Match Schools
                <Badge variant="outline" className="text-xs bg-warning/10">{matches.length}</Badge>
              </h4>
              <div className="space-y-2">
                {matches.map((school) => <SchoolCard key={school.id} school={school} />)}
              </div>
            </div>
          )}

          {safeties.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2 text-success">
                <School className="w-4 h-4" />
                Safety Schools
                <Badge variant="outline" className="text-xs bg-success/10">{safeties.length}</Badge>
              </h4>
              <div className="space-y-2">
                {safeties.map((school) => <SchoolCard key={school.id} school={school} />)}
              </div>
            </div>
          )}

          {uncategorized.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2 text-muted-foreground">
                <School className="w-4 h-4" />
                Uncategorized
                <Badge variant="outline" className="text-xs">{uncategorized.length}</Badge>
              </h4>
              <div className="space-y-2">
                {uncategorized.map((school) => <SchoolCard key={school.id} school={school} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
