import { useState } from 'react';
import { useCreatorSocialLinks, SocialLink } from '@/hooks/useCreatorSocialLinks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail, Github, Linkedin, Twitter, Youtube, Globe, Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
const iconMap: Record<string, React.ComponentType<{
  className?: string;
}>> = {
  Mail,
  Github,
  Linkedin,
  Twitter,
  Youtube,
  Globe,
  ExternalLink
};
const platformOptions = [{
  value: 'email',
  label: 'Email',
  icon: 'Mail'
}, {
  value: 'github',
  label: 'GitHub',
  icon: 'Github'
}, {
  value: 'linkedin',
  label: 'LinkedIn',
  icon: 'Linkedin'
}, {
  value: 'twitter',
  label: 'Twitter/X',
  icon: 'Twitter'
}, {
  value: 'youtube',
  label: 'YouTube',
  icon: 'Youtube'
}, {
  value: 'website',
  label: 'Website',
  icon: 'Globe'
}, {
  value: 'other',
  label: 'Other',
  icon: 'ExternalLink'
}];
export function CreatorSocialLinks() {
  const {
    socialLinks,
    isLoading,
    isOwner,
    addLink,
    updateLink,
    deleteLink
  } = useCreatorSocialLinks();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [formData, setFormData] = useState({
    platform: '',
    url: '',
    icon: 'Globe'
  });
  const handleAdd = () => {
    const selectedPlatform = platformOptions.find(p => p.value === formData.platform);
    addLink.mutate({
      platform: formData.platform,
      url: formData.url,
      icon: selectedPlatform?.icon || 'Globe',
      display_order: socialLinks.length + 1
    });
    setFormData({
      platform: '',
      url: '',
      icon: 'Globe'
    });
    setIsAddOpen(false);
  };
  const handleUpdate = () => {
    if (!editingLink) return;
    const selectedPlatform = platformOptions.find(p => p.value === formData.platform);
    updateLink.mutate({
      id: editingLink.id,
      platform: formData.platform,
      url: formData.url,
      icon: selectedPlatform?.icon || editingLink.icon
    });
    setEditingLink(null);
    setFormData({
      platform: '',
      url: '',
      icon: 'Globe'
    });
  };
  const openEdit = (link: SocialLink) => {
    setEditingLink(link);
    setFormData({
      platform: link.platform,
      url: link.url,
      icon: link.icon
    });
  };
  if (isLoading) {
    return <div className="flex items-center justify-center gap-3 pt-2">Loading...</div>;
  }
  return <div className="space-y-3">
      

      {isOwner}
    </div>;
}