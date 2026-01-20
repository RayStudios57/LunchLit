import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Loader2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MealItem {
  name: string;
  description?: string;
  calories?: number;
  dietary?: string[];
}

interface MealViewerImportProps {
  onImport: (items: MealItem[]) => void;
}

export function MealViewerImport({ onImport }: MealViewerImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const parseManualInput = () => {
    if (!manualInput.trim()) {
      toast({ title: 'Please enter menu items', variant: 'destructive' });
      return;
    }

    // Parse line-by-line format:
    // Item Name - Description (Calories cal) [Tag1, Tag2]
    // or just: Item Name
    const lines = manualInput.split('\n').filter(l => l.trim());
    const items: MealItem[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Parse calories in parentheses
      const calorieMatch = trimmed.match(/\((\d+)\s*cal(?:ories?)?\)/i);
      const calories = calorieMatch ? parseInt(calorieMatch[1]) : undefined;

      // Parse dietary tags in brackets
      const tagMatch = trimmed.match(/\[([^\]]+)\]/);
      const dietary = tagMatch 
        ? tagMatch[1].split(',').map(t => t.trim()).filter(Boolean)
        : [];

      // Remove calories and tags from the line to get name/description
      let cleaned = trimmed
        .replace(/\(\d+\s*cal(?:ories?)?\)/i, '')
        .replace(/\[[^\]]+\]/, '')
        .trim();

      // Split by dash for name - description
      const dashIndex = cleaned.indexOf(' - ');
      let name = cleaned;
      let description = '';

      if (dashIndex > 0) {
        name = cleaned.substring(0, dashIndex).trim();
        description = cleaned.substring(dashIndex + 3).trim();
      }

      if (name) {
        items.push({
          name,
          description: description || undefined,
          calories,
          dietary,
        });
      }
    }

    if (items.length === 0) {
      toast({ title: 'No valid items found', variant: 'destructive' });
      return;
    }

    onImport(items);
    toast({ title: `Imported ${items.length} items` });
    setIsOpen(false);
    setManualInput('');
    setUrl('');
  };

  const exampleFormat = `Grilled Chicken - Seasoned chicken breast (350 cal) [Gluten-Free]
Vegetable Stir Fry - Fresh vegetables with tofu (280 cal) [Vegetarian, Vegan]
Garden Salad
French Fries (420 cal)`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" />
          Import Items
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Menu Items</DialogTitle>
          <DialogDescription>
            Paste menu items from MealViewer or other sources
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <LinkIcon className="h-4 w-4" />
            <AlertDescription>
              Visit{' '}
              <a 
                href="https://schools.mealviewer.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                schools.mealviewer.com
              </a>
              {' '}to find your school's menu, then copy the items below.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Menu Items</Label>
            <Textarea
              placeholder={exampleFormat}
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Format: <code>Item Name - Description (Calories cal) [Tag1, Tag2]</code>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={parseManualInput} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Import Items
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
