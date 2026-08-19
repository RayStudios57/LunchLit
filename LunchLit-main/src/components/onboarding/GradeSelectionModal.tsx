import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { GraduationCap, Check } from 'lucide-react';
import { GRADE_OPTIONS } from '@/config/grades';

interface GradeSelectionModalProps {
  open: boolean;
  onComplete: () => void;
}

export function GradeSelectionModal({ open, onComplete }: GradeSelectionModalProps) {
  const { updateProfile } = useProfile();
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedGrade) return;
    
    setIsSubmitting(true);
    try {
      await updateProfile.mutateAsync({ 
        grade_level: selectedGrade,
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
          <DialogTitle className="font-display text-xl">What grade are you in?</DialogTitle>
          <DialogDescription>
            This helps us personalize your experience
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
          {GRADE_OPTIONS.map(option => (
            <button
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

        <Button
          onClick={handleSubmit}
          disabled={!selectedGrade || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Saving...' : 'Continue'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
