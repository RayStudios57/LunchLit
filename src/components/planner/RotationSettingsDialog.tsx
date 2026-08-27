import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useToast } from '@/hooks/use-toast';
import { getRotationPreview, RotationLetter, parseLocalDate } from '@/lib/rotation';
import { RotateCw, Calendar, Sparkles, Check } from 'lucide-react';
import { format } from 'date-fns';

interface RotationSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RotationSettingsDialog({ open, onOpenChange }: RotationSettingsDialogProps) {
  const { preferences, updatePreference } = useUserPreferences();
  const { toast } = useToast();

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const [useRotation, setUseRotation] = useState(false);
  const [anchorDate, setAnchorDate] = useState(todayStr);
  const [anchorLetter, setAnchorLetter] = useState<RotationLetter>('A');
  const [skipWeekends, setSkipWeekends] = useState(true);

  // Sync state when preferences are loaded or dialog opens
  useEffect(() => {
    if (open && preferences) {
      setUseRotation(preferences.schedule_rotation === 'ab');
      setAnchorDate(preferences.rotation_anchor_date || todayStr);
      setAnchorLetter((preferences.rotation_anchor_letter as RotationLetter) || 'A');
      setSkipWeekends(preferences.rotation_skip_weekends !== false);
    }
  }, [open, preferences, todayStr]);

  const currentSettings = {
    schedule_rotation: useRotation ? 'ab' : 'none',
    rotation_anchor_date: anchorDate || todayStr,
    rotation_anchor_letter: anchorLetter,
    rotation_skip_weekends: skipWeekends,
  };

  const previewDays = useRotation ? getRotationPreview(currentSettings, 8) : [];

  const handleSave = async () => {
    try {
      await updatePreference.mutateAsync({
        schedule_rotation: useRotation ? 'ab' : 'none',
        rotation_anchor_date: anchorDate || todayStr,
        rotation_anchor_letter: anchorLetter,
        rotation_skip_weekends: skipWeekends,
      });

      toast({
        title: useRotation ? 'A/B Schedule rotation saved!' : 'Schedule rotation turned off',
        description: useRotation
          ? `Anchor date set to ${anchorDate} (${anchorLetter} Day)`
          : 'All classes will appear every week as usual.',
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error saving rotation settings',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <RotateCw className="w-5 h-5 text-primary" />
            A/B Day Rotation
          </DialogTitle>
          <DialogDescription>
            Alternate between A and B days automatically so your schedule always matches your school calendar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
            <div className="space-y-0.5">
              <Label htmlFor="use-rotation" className="font-medium cursor-pointer">
                Use A/B days
              </Label>
              <p className="text-xs text-muted-foreground">
                Classes switch between A days and B days
              </p>
            </div>
            <Switch
              id="use-rotation"
              checked={useRotation}
              onCheckedChange={setUseRotation}
            />
          </div>

          {useRotation && (
            <div className="space-y-4 animate-fade-up">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="anchor-date" className="flex items-center gap-1.5 text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  Starting Date
                </Label>
                <Input
                  id="anchor-date"
                  type="date"
                  value={anchorDate}
                  onChange={(e) => setAnchorDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Pick any known day from your school year as a reference point.
                </p>
              </div>

              {/* Anchor Letter */}
              <div className="space-y-2">
                <Label className="text-sm">That day is:</Label>
                <Select
                  value={anchorLetter}
                  onValueChange={(val) => setAnchorLetter(val as RotationLetter)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">🅰️ A Day</SelectItem>
                    <SelectItem value="B">🅱️ B Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Skip Weekends Switch */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                <div className="space-y-0.5">
                  <Label htmlFor="skip-weekends" className="text-sm font-medium cursor-pointer">
                    Skip weekends
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Fri A → Mon B (school days only)
                  </p>
                </div>
                <Switch
                  id="skip-weekends"
                  checked={skipWeekends}
                  onCheckedChange={setSkipWeekends}
                />
              </div>

              {/* Live Preview */}
              <div className="space-y-2 pt-1">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Upcoming School Days Preview
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {previewDays.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg border bg-card text-center flex flex-col items-center justify-center gap-1"
                    >
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {format(item.date, 'EEE, MMM d')}
                      </span>
                      <Badge
                        variant={item.letter === 'A' ? 'default' : 'secondary'}
                        className={`text-xs font-bold px-2 py-0.5 ${
                          item.letter === 'A'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-accent text-accent-foreground border-accent-foreground/20'
                        }`}
                      >
                        {item.letter} Day
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updatePreference.isPending}>
            <Check className="w-4 h-4 mr-1.5" />
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
