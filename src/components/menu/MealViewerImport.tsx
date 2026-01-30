import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Loader2, Link as LinkIcon, AlertCircle, FileText, Globe, X, Calendar, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';

interface MealItem {
  name: string;
  description?: string;
  calories?: number;
  dietary?: string[];
}

interface DayMeals {
  date: string;
  items: MealItem[];
  selected: boolean;
}

interface MealViewerImportProps {
  onImport: (items: MealItem[]) => void;
  onImportMultipleDays?: (days: { date: string; items: MealItem[] }[]) => void;
}

export function MealViewerImport({ onImport, onImportMultipleDays }: MealViewerImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedItems, setScrapedItems] = useState<MealItem[]>([]);
  const [multiDayMeals, setMultiDayMeals] = useState<DayMeals[]>([]);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const parseManualInput = () => {
    if (!manualInput.trim()) {
      toast({ title: 'Please enter menu items', variant: 'destructive' });
      return;
    }

    const lines = manualInput.split('\n').filter(l => l.trim());
    const items: MealItem[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const calorieMatch = trimmed.match(/\((\d+)\s*cal(?:ories?)?\)/i);
      const calories = calorieMatch ? parseInt(calorieMatch[1]) : undefined;

      const tagMatch = trimmed.match(/\[([^\]]+)\]/);
      const dietary = tagMatch 
        ? tagMatch[1].split(',').map(t => t.trim()).filter(Boolean)
        : [];

      let cleaned = trimmed
        .replace(/\(\d+\s*cal(?:ories?)?\)/i, '')
        .replace(/\[[^\]]+\]/, '')
        .trim();

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

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

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
    setMultiDayMeals([]);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-mealviewer', {
        body: { url: formattedUrl, multiDay: true },
      });

      if (error) throw error;

      if (!data.success) {
        setScrapeError(data.error || 'Failed to scrape menu');
        return;
      }

      // Handle multi-day response
      if (data.days && data.days.length > 0) {
        const daysWithSelection: DayMeals[] = data.days.map((day: { date: string; items: MealItem[] }) => ({
          ...day,
          selected: true,
        }));
        setMultiDayMeals(daysWithSelection);
        // Expand all days by default
        setExpandedDays(new Set(daysWithSelection.map((d: DayMeals) => d.date)));
        toast({ title: `Found menus for ${data.days.length} days!` });
      } else if (data.items && data.items.length > 0) {
        // Single day response
        setScrapedItems(data.items);
        toast({ title: `Found ${data.items.length} menu items!` });
      } else {
        setScrapeError('No menu items found on this page. Try copying items manually instead.');
      }

    } catch (error) {
      console.error('Error scraping MealViewer:', error);
      setScrapeError('Failed to fetch menu. The page may use dynamic loading. Try copying items manually.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = (index: number) => {
    setScrapedItems(prev => prev.filter((_, i) => i !== index));
  };

  const removeItemFromDay = (dayDate: string, itemIndex: number) => {
    setMultiDayMeals(prev => prev.map(day => {
      if (day.date === dayDate) {
        return {
          ...day,
          items: day.items.filter((_, i) => i !== itemIndex),
        };
      }
      return day;
    }));
  };

  const toggleDaySelection = (dayDate: string) => {
    setMultiDayMeals(prev => prev.map(day => {
      if (day.date === dayDate) {
        return { ...day, selected: !day.selected };
      }
      return day;
    }));
  };

  const toggleDayExpanded = (dayDate: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(dayDate)) {
        next.delete(dayDate);
      } else {
        next.add(dayDate);
      }
      return next;
    });
  };

  const selectAllDays = () => {
    setMultiDayMeals(prev => prev.map(day => ({ ...day, selected: true })));
  };

  const deselectAllDays = () => {
    setMultiDayMeals(prev => prev.map(day => ({ ...day, selected: false })));
  };

  const handleImportScraped = () => {
    if (scrapedItems.length === 0) return;
    onImport(scrapedItems);
    toast({ title: `Imported ${scrapedItems.length} items` });
    handleClose();
  };

  const handleImportMultipleDays = () => {
    const selectedDays = multiDayMeals.filter(day => day.selected && day.items.length > 0);
    
    if (selectedDays.length === 0) {
      toast({ title: 'No days selected', variant: 'destructive' });
      return;
    }

    if (onImportMultipleDays) {
      onImportMultipleDays(selectedDays.map(d => ({ date: d.date, items: d.items })));
      toast({ title: `Imported menus for ${selectedDays.length} days` });
    } else {
      // Fallback: import all items from selected days as single batch
      const allItems = selectedDays.flatMap(d => d.items);
      onImport(allItems);
      toast({ title: `Imported ${allItems.length} items from ${selectedDays.length} days` });
    }
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setUrl('');
    setManualInput('');
    setScrapedItems([]);
    setMultiDayMeals([]);
    setScrapeError(null);
    setExpandedDays(new Set());
  };

  const formatDayLabel = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, 'EEEE, MMM d');
    } catch {
      return dateStr;
    }
  };

  const selectedDaysCount = multiDayMeals.filter(d => d.selected).length;
  const totalItemsCount = multiDayMeals
    .filter(d => d.selected)
    .reduce((sum, d) => sum + d.items.length, 0);

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
                Paste a MealViewer link and we'll extract menus for multiple days automatically
              </p>
            </div>

            {scrapeError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{scrapeError}</AlertDescription>
              </Alert>
            )}

            {/* Multi-day results */}
            {multiDayMeals.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Found {multiDayMeals.length} Days
                  </Label>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={selectAllDays}>
                      Select All
                    </Button>
                    <Button variant="ghost" size="sm" onClick={deselectAllDays}>
                      Deselect All
                    </Button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto border rounded-lg divide-y">
                  {multiDayMeals.map((day) => (
                    <Collapsible 
                      key={day.date} 
                      open={expandedDays.has(day.date)}
                      onOpenChange={() => toggleDayExpanded(day.date)}
                    >
                      <div className="flex items-center gap-2 p-2 bg-secondary/30 hover:bg-secondary/50">
                        <Checkbox
                          checked={day.selected}
                          onCheckedChange={() => toggleDaySelection(day.date)}
                        />
                        <CollapsibleTrigger className="flex-1 flex items-center justify-between text-sm">
                          <span className="font-medium">{formatDayLabel(day.date)}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{day.items.length} items</Badge>
                            {expandedDays.has(day.date) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent>
                        <div className="p-2 space-y-1 bg-background">
                          {day.items.map((item, idx) => (
                            <div 
                              key={idx} 
                              className="text-sm p-2 bg-secondary/30 rounded flex items-center justify-between gap-2 group"
                            >
                              <div className="flex-1 min-w-0">
                                <span className="truncate block">{item.name}</span>
                                {item.calories && (
                                  <span className="text-xs text-muted-foreground">{item.calories} cal</span>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeItemFromDay(day.date, idx)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          {day.items.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-2">
                              No items remaining
                            </p>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>

                <Button 
                  onClick={handleImportMultipleDays} 
                  className="w-full"
                  disabled={selectedDaysCount === 0 || totalItemsCount === 0}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Import {selectedDaysCount} Day{selectedDaysCount !== 1 ? 's' : ''} ({totalItemsCount} items)
                </Button>
              </div>
            )}

            {/* Single-day results */}
            {scrapedItems.length > 0 && multiDayMeals.length === 0 && (
              <div className="space-y-3">
                <Label>Found Items ({scrapedItems.length})</Label>
                <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1">
                  {scrapedItems.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="text-sm p-2 bg-secondary/50 rounded flex items-center justify-between gap-2 group"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="truncate block">{item.name}</span>
                        {item.calories && (
                          <span className="text-xs text-muted-foreground">{item.calories} cal</span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeItem(idx)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={handleImportScraped} 
                  className="w-full"
                  disabled={scrapedItems.length === 0}
                >
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
