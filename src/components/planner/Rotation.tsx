import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings2 } from 'lucide-react';
import { format } from 'date-fns';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { getRotationPreview } from '@/lib/rotation';
import { useToast } from '@/hooks/use-toast';

export function RotationSettingsDialog() {
    const { preferences, updatePreference } = useUserPreferences();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);

    const [enabled, setEnabled] = useState(false);
    const [anchorDate, setAnchorDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [anchorLetter, setAnchorLetter] = useState<'A' | 'B'>('A');
    const [skipWeekends, setSkipWeekends] = useState(true);

    useEffect(() => {
        if (!preferences) return;
        setEnabled(preferences.schedule_rotation === 'ab');
        setAnchorDate(preferences.rotation_anchor_date || format(new Date(), 'yyyy-MM-dd'));
        setAnchorLetter(preferences.rotation_anchor_letter === 'B' ? 'B' : 'A');
        setSkipWeekends(preferences.rotation_skip_weekends !== false);
    }, [preferences]);

    const preview = getRotationPreview(
        {
            schedule_rotation: enabled ? 'ab' : 'none',
            rotation_anchor_date: anchorDate,
            rotation_anchor_letter: anchorLetter,
            rotation_skip_weekends: skipWeekends,
        },
        8
    );

    const handleSave = async () => {
        await updatePreference.mutateAsync({
            schedule_rotation: enabled ? 'ab' : 'none',
            rotation_anchor_date: anchorDate || null,
            rotation_anchor_letter: anchorLetter,
            rotation_skip_weekends: skipWeekends,
        });
        toast({ title: enabled ? 'A/B rotation saved!' : 'Rotation turned off' });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <Settings2 className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Rotation</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>A/B Day Rotation</DialogTitle>
                    <DialogDescription>
                        If your school alternates A days and B days, set it up here and your classes will only
                        show on the right days.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 pt-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="rotation-enabled">Use A/B days</Label>
                        <Switch id="rotation-enabled" checked={enabled} onCheckedChange={setEnabled} />
                    </div>

                    {enabled && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Starting date</Label>
                                    <Input
                                        type="date"
                                        value={anchorDate}
                                        onChange={(e) => setAnchorDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>That day is</Label>
                                    <Select value={anchorLetter} onValueChange={(v) => setAnchorLetter(v as 'A' | 'B')}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="A">A Day</SelectItem>
                                            <SelectItem value="B">B Day</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="skip-weekends">Skip weekends</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Weekends don't advance the rotation (Fri A → Mon B)
                                    </p>
                                </div>
                                <Switch
                                    id="skip-weekends"
                                    checked={skipWeekends}
                                    onCheckedChange={setSkipWeekends}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Preview</Label>
                                <div className="flex flex-wrap gap-2">
                                    {preview.map(({ date, letter }) => (
                                        <div
                                            key={date.toISOString()}
                                            className="flex flex-col items-center rounded-lg bg-secondary/60 px-2.5 py-1.5"
                                        >
                                            <span className="text-[10px] uppercase text-muted-foreground">
                                                {format(date, 'EEE d')}
                                            </span>
                                            <Badge variant={letter === 'A' ? 'default' : 'secondary'} className="mt-1">
                                                {letter}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <Button className="w-full" onClick={handleSave} disabled={updatePreference.isPending}>
                        Save rotation
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
