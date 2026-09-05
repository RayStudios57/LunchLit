import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfile } from '@/hooks/useProfile';
import { useSchools } from '@/hooks/useSchools';
import { GraduationCap, Check, School } from 'lucide-react';
import { GRADE_OPTIONS } from '@/config/grades';

interface GradeSelectionModalProps {
  open: boolean;
  onComplete: () => void;
}

export function GradeSelectionModal({ open, onComplete }: GradeSelectionModalProps) {
  const { updateProfile, profile } = useProfile();
  const { schools } = useSchools();
  const [selectedGrade, setSelectedGrade] = useState<string | null>(profile?.grade_level || null);
  const [schoolName, setSchoolName] = useState(profile?.school_name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedGrade) return;
    
    setIsSubmitting(true);
    try {
      const trimmedSchool = schoolName.trim();
      const matched = schools.find(s => s.name.toLowerCase() === trimmedSchool.toLowerCase());
      await updateProfile.mutateAsync({ 
        grade_level: selectedGrade,
        school_name: trimmedSchool || null,
        school_id: matched ? matched.id : null,
        last_grade_progression: new Date().toISOString(),
      });
      onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow mb-4">
            <GraduationCap className="w-7 h-7 text-primary-foreground" />
          </div>
          <DialogTitle className="font-display text-xl">Welcome to LunchLit!</DialogTitle>
          <DialogDescription>
            Let's personalize your school experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">What grade are you in?</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GRADE_OPTIONS.map(option => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setSelectedGrade(option.value)}
                  className={`relative p-3 rounded-xl border-2 text-left transition-all ${
                    selectedGrade === option.value
                      ? 'border-primary bg-primary/5 shadow-glow'
                      : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                  }`}
                >
                  <span className="text-xl mb-1 block">{option.emoji}</span>
                  <span className="font-medium text-xs leading-tight block">{option.label}</span>
                  {selectedGrade === option.value && (
                    <Check className="absolute top-2 right-2 w-3 h-3 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="onboarding-school" className="text-sm font-medium flex items-center gap-1.5">
              <School className="w-4 h-4 text-primary" />
              High School (optional)
            </Label>
            <Input
              id="onboarding-school"
              placeholder="e.g. Lincoln High School"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              list="onboarding-school-suggestions"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && selectedGrade) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <datalist id="onboarding-school-suggestions">
              {schools.map(school => (
                <option key={school.id} value={school.name} />
              ))}
            </datalist>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!selectedGrade || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Saving...' : 'Get Started'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
