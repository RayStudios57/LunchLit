import { usePresentationMode } from '@/contexts/PresentationModeContext';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PresentationModeBanner() {
  const { isPresentationMode, togglePresentationMode } = usePresentationMode();

  if (!isPresentationMode) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-warning/90 text-warning-foreground px-4 py-2">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">
            You are in Presentation Mode — all results are dummy data
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePresentationMode}
          className="h-6 w-6 p-0 hover:bg-warning-foreground/20"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
