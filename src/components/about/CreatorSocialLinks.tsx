import { useState } from 'react';
import { useCreatorSocialLinks, SocialLink } from '@/hooks/useCreatorSocialLinks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail, Github, Linkedin, Twitter, Youtube, Globe, Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Mail,
  Github,
  Linkedin,
  Twitter,
  Youtube,
  Globe,
  ExternalLink,
};

const platformOptions = [
  { value: 'email', label: 'Email', icon: 'Mail' },
  { value: 'github', label: 'GitHub', icon: 'Github' },
  { value: 'linkedin', label: 'LinkedIn', icon: 'Linkedin' },
  { value: 'twitter', label: 'Twitter/X', icon: 'Twitter' },
  { value: 'youtube', label: 'YouTube', icon: 'Youtube' },
  { value: 'website', label: 'Website', icon: 'Globe' },
  { value: 'other', label: 'Other', icon: 'ExternalLink' },
];

export function CreatorSocialLinks() {
  const { socialLinks, isLoading, isOwner, addLink, updateLink, deleteLink } = useCreatorSocialLinks();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [formData, setFormData] = useState({ platform: '', url: '', icon: 'Globe' });

  const handleAdd = () => {
    const selectedPlatform = platformOptions.find(p => p.value === formData.platform);
    addLink.mutate({
      platform: formData.platform,
      url: formData.url,
      icon: selectedPlatform?.icon || 'Globe',
      display_order: socialLinks.length + 1,
    });
    setFormData({ platform: '', url: '', icon: 'Globe' });
    setIsAddOpen(false);
  };

  const handleUpdate = () => {
    if (!editingLink) return;
    const selectedPlatform = platformOptions.find(p => p.value === formData.platform);
    updateLink.mutate({
      id: editingLink.id,
      platform: formData.platform,
      url: formData.url,
      icon: selectedPlatform?.icon || editingLink.icon,
    });
    setEditingLink(null);
    setFormData({ platform: '', url: '', icon: 'Globe' });
  };

  const openEdit = (link: SocialLink) => {
    setEditingLink(link);
    setFormData({ platform: link.platform, url: link.url, icon: link.icon });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center gap-3 pt-2">Loading...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-3">
        {socialLinks.map((link) => {
          const IconComponent = iconMap[link.icon] || Globe;
          return (
            <a
              key={link.id}
              href={link.url}
              target={link.platform === 'email' ? undefined : '_blank'}
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
              title={link.platform}
            >
              <IconComponent className="h-4 w-4 text-muted-foreground" />
            </a>
          );
        })}
      </div>

      {isOwner && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="h-3 w-3" /> Add Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Social Link</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Select value={formData.platform} onValueChange={(v) => setFormData({ ...formData, platform: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platformOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="URL (e.g., https://youtube.com/@channel)"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
                <Button onClick={handleAdd} disabled={!formData.platform || !formData.url} className="w-full">
                  Add Link
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={!!editingLink} onOpenChange={(open) => !open && setEditingLink(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Social Link</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Select value={formData.platform} onValueChange={(v) => setFormData({ ...formData, platform: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platformOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="URL"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button onClick={handleUpdate} disabled={!formData.platform || !formData.url} className="flex-1">
                    Save
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (editingLink) deleteLink.mutate(editingLink.id);
                      setEditingLink(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {socialLinks.length > 0 && (
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => openEdit(socialLinks[0])}>
              <Pencil className="h-3 w-3" /> Edit Links
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
