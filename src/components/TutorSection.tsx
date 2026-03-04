import { useState } from 'react';
import { GraduationCap, Clock, Star, Plus, Trash2, Globe, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useTutors } from '@/hooks/useTutors';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';

export function TutorSection() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { tutors, isLoading, addTutor, deleteTutor } = useTutors(profile?.school_id);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    subject: '',
    availability: '',
    description: '',
    is_online: false,
    contact_info: '',
  });

  const handleSubmit = () => {
    if (!form.name || !form.subject) return;
    addTutor.mutate({
      name: form.name,
      subject: form.subject,
      availability: form.availability || null,
      description: form.description || null,
      is_online: form.is_online,
      contact_info: form.contact_info || null,
      rating: 5.0,
      school_id: form.is_online ? null : (profile?.school_id || null),
    }, {
      onSuccess: () => {
        setOpen(false);
        setForm({ name: '', subject: '', availability: '', description: '', is_online: false, contact_info: '' });
      }
    });
  };

  return (
    <section className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-info to-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-info-foreground" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-foreground">Tutoring</h2>
            <p className="text-sm text-muted-foreground">Get help from peers or offer your expertise</p>
          </div>
        </div>

        {user && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Tutor</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a Tutor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name or tutor name" />
                </div>
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Mathematics, Chemistry" />
                </div>
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <Input value={form.availability} onChange={e => setForm(p => ({ ...p, availability: e.target.value }))} placeholder="e.g. Mon, Wed - Period 6" />
                </div>
                <div className="space-y-2">
                  <Label>Contact Info</Label>
                  <Input value={form.contact_info} onChange={e => setForm(p => ({ ...p, contact_info: e.target.value }))} placeholder="Email, Discord, etc." />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What can you help with?" />
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={form.is_online} onCheckedChange={v => setForm(p => ({ ...p, is_online: v }))} />
                  <Label>Available online (visible to all schools)</Label>
                </div>
                <Button onClick={handleSubmit} disabled={!form.name || !form.subject || addTutor.isPending} className="w-full">
                  {addTutor.isPending ? 'Adding...' : 'Add Tutor'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4"><div className="h-20 bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      ) : tutors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No tutors available yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Be the first to offer tutoring help!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {tutors.map((tutor, index) => (
            <Card key={tutor.id} className="card-interactive opacity-0 animate-fade-up" style={{ animationDelay: `${index * 0.05}s` }}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display font-semibold text-foreground">{tutor.name}</h3>
                        <p className="text-sm text-primary font-medium">{tutor.subject}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {tutor.is_online ? (
                          <Badge variant="secondary" className="text-xs gap-1"><Globe className="w-3 h-3" /> Online</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs gap-1"><School className="w-3 h-3" /> School</Badge>
                        )}
                      </div>
                    </div>
                    {tutor.availability && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{tutor.availability}</span>
                      </div>
                    )}
                    {tutor.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tutor.description}</p>
                    )}
                    {tutor.contact_info && (
                      <p className="text-xs text-primary mt-1">📧 {tutor.contact_info}</p>
                    )}
                  </div>
                </div>
                {user && tutor.created_by === user.id && (
                  <Button variant="ghost" size="sm" className="w-full mt-2 text-destructive" onClick={() => deleteTutor.mutate(tutor.id)}>
                    <Trash2 className="w-3 h-3 mr-1" /> Remove
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Tutoring is peer-to-peer. Add yourself as a tutor to help others!
      </p>
    </section>
  );
}
