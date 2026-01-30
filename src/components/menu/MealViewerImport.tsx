import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Loader2, Link as LinkIcon, AlertCircle, FileText, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

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
  const [scrapedItems, setScrapedItems] = useState<MealItem[]>([]);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
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
    handleClose();
  };

  const handleScrapeUrl = async () => {
    if (!url.trim()) {
      toast({ title: 'Please enter a MealViewer URL', variant: 'destructive' });
      return;
    }

    // Validate URL format
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // Check if it's a MealViewer URL
    if (!formattedUrl.includes('mealviewer.com')) {
      toast({ 
        title: 'Invalid URL', 
        description: 'Please enter a valid MealViewer URL (e.g., schools.mealviewer.com/school/YourSchool)',
        variant: 'destructive' 
      });
      return;
    }

    setIsLoading(true);
    setScrapeError(null);
    setScrapedItems([]);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-mealviewer', {
        body: { url: formattedUrl },
      });

      if (error) throw error;

      if (!data.success) {
        setScrapeError(data.error || 'Failed to scrape menu');
        return;
      }

      if (!data.items || data.items.length === 0) {
        setScrapeError('No menu items found on this page. Try copying items manually instead.');
        return;
      }

      setScrapedItems(data.items);
      toast({ title: `Found ${data.items.length} menu items!` });

    } catch (error) {
      console.error('Error scraping MealViewer:', error);
      setScrapeError('Failed to fetch menu. The page may use dynamic loading. Try copying items manually.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportScraped = () => {
    if (scrapedItems.length === 0) return;
    onImport(scrapedItems);
    toast({ title: `Imported ${scrapedItems.length} items` });
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setUrl('');
    setManualInput('');
    setScrapedItems([]);
    setScrapeError(null);
  };

  const exampleFormat = `Grilled Chicken - Seasoned chicken breast (350 cal) [Gluten-Free]
Vegetable Stir Fry - Fresh vegetables with tofu (280 cal) [Vegetarian, Vegan]
Garden Salad
French Fries (420 cal)`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => open ? setIsOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" />
          Import Items
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Menu Items</DialogTitle>
          <DialogDescription>
            Scan a MealViewer link or paste menu items manually
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="gap-1.5">
              <Globe className="h-4 w-4" />
              Scan URL
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-1.5">
              <FileText className="h-4 w-4" />
              Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>MealViewer URL</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://schools.mealviewer.com/school/YourSchool"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleScrapeUrl} 
                  disabled={isLoading || !url.trim()}
                  size="sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Scan'
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste a MealViewer link and we'll extract the menu items automatically
              </p>
            </div>

            {scrapeError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{scrapeError}</AlertDescription>
              </Alert>
            )}

            {scrapedItems.length > 0 && (
              <div className="space-y-3">
                <Label>Found Items ({scrapedItems.length})</Label>
                <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1">
                  {scrapedItems.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="text-sm p-2 bg-secondary/50 rounded flex items-center justify-between"
                    >
                      <span>{item.name}</span>
                      {item.calories && (
                        <span className="text-xs text-muted-foreground">{item.calories} cal</span>
                      )}
                    </div>
                  ))}
                </div>
                <Button onClick={handleImportScraped} className="w-full">
                  Import {scrapedItems.length} Items
                </Button>
              </div>
            )}

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
                {' '}to find your school's menu page.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4 mt-4">
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

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={parseManualInput} disabled={isLoading}>
                Import Items
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
