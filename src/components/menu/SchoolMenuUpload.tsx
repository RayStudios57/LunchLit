import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  FileJson, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Calendar,
  Plus,
  Trash2,
  Smartphone
} from 'lucide-react';
import { z } from 'zod';

// CSV formula injection protection
function sanitizeCSVValue(value: string): string {
  const trimmed = value.trim().replace(/["']/g, '');
  // Remove formula injection prefixes
  if (/^[=+\-@\t\r]/.test(trimmed)) {
    return trimmed.substring(1);
  }
  return trimmed;
}

// Schema for validating menu items with max lengths
const menuItemSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  dietary: z.array(z.string().max(50)).max(10).optional(),
  calories: z.number().optional(),
});

const dayMenuSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dayName: z.string().max(20).optional(),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner']).optional().default('lunch'),
  items: z.array(menuItemSchema).min(1).max(50),
});

const menuUploadSchema = z.array(dayMenuSchema).min(1).max(7);

interface ParsedMenu {
  date: string;
  dayName?: string;
  meal_type: string;
  items: {
    name: string;
    description?: string;
    dietary?: string[];
    calories?: number;
  }[];
}

interface ManualMenuItem {
  name: string;
  description: string;
  calories: string;
}

interface ManualDay {
  date: string;
  items: ManualMenuItem[];
}

interface ValidationResult {
  valid: boolean;
  data?: ParsedMenu[];
  errors: string[];
}

export function SchoolMenuUpload() {
  const [activeTab, setActiveTab] = useState<'form' | 'file'>('form');
  const [schoolName, setSchoolName] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [parsedData, setParsedData] = useState<ParsedMenu[] | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [manualDays, setManualDays] = useState<ManualDay[]>([
    { date: '', items: [{ name: '', description: '', calories: '' }] }
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const parseCSV = useCallback((text: string): any[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => sanitizeCSVValue(h.toLowerCase()));
    const menusByDate: Record<string, any> = {};

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => sanitizeCSVValue(v));
      const row: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      const date = row.date || row.day || row.meal_date || '';
      if (!date) continue;

      if (!menusByDate[date]) {
        menusByDate[date] = {
          date,
          dayName: row.day_name || row.dayname || '',
          meal_type: row.meal_type || row.type || 'lunch',
          items: [],
        };
      }

      const itemName = row.item || row.name || row.food || row.menu_item || '';
      if (itemName) {
        menusByDate[date].items.push({
          name: itemName.slice(0, 200),
          description: (row.description || row.desc || '').slice(0, 500),
          dietary: (row.dietary || row.diet || row.tags || '').split(';').filter(Boolean).slice(0, 10),
          calories: row.calories ? parseInt(row.calories) : undefined,
        });
      }
    }

    return Object.values(menusByDate);
  }, []);

  const parseJSON = (text: string): any[] => {
    try {
      const parsed = JSON.parse(text);
      
      // Handle various JSON formats
      if (Array.isArray(parsed)) {
        return parsed;
      }
      
      // Handle { menus: [...] } format
      if (parsed.menus && Array.isArray(parsed.menus)) {
        return parsed.menus;
      }
      
      // Handle { dates: { "2024-01-15": {...} } } format
      if (parsed.dates && typeof parsed.dates === 'object') {
        return Object.entries(parsed.dates).map(([date, data]: [string, any]) => ({
          date,
          ...data,
        }));
      }

      return [];
    } catch {
      return [];
    }
  };

  const validateMenuData = (data: any[]): ValidationResult => {
    const errors: string[] = [];
    const validMenus: ParsedMenu[] = [];

    if (!Array.isArray(data) || data.length === 0) {
      return { valid: false, errors: ['No valid menu data found in file'] };
    }

    data.forEach((menu, index) => {
      try {
        // Try to normalize the data
        const normalized = {
          date: menu.date || menu.meal_date || '',
          dayName: menu.dayName || menu.day_name || menu.day || '',
          meal_type: menu.meal_type || menu.type || 'lunch',
          items: menu.items || menu.menu_items || menu.foods || [],
        };

        // Normalize items
        if (!Array.isArray(normalized.items)) {
          normalized.items = [];
        }

        normalized.items = normalized.items.map((item: any) => ({
          name: item.name || item.item || item.food || 'Unknown Item',
          description: item.description || item.desc || '',
          dietary: Array.isArray(item.dietary) 
            ? item.dietary 
            : (item.dietary || item.tags || '').toString().split(';').filter(Boolean),
          calories: typeof item.calories === 'number' ? item.calories : undefined,
        }));

        // Validate
        const result = dayMenuSchema.safeParse(normalized);
        if (result.success) {
          validMenus.push(result.data as ParsedMenu);
        } else {
          errors.push(`Row ${index + 1}: ${result.error.errors[0]?.message || 'Invalid format'}`);
        }
      } catch (err) {
        errors.push(`Row ${index + 1}: Unable to parse data`);
      }
    });

    return {
      valid: validMenus.length > 0,
      data: validMenus,
      errors,
    };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationErrors([]);
    setParsedData(null);

    try {
      const text = await file.text();
      let rawData: any[];

      if (file.name.endsWith('.json')) {
        rawData = parseJSON(text);
      } else if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        rawData = parseCSV(text);
      } else {
        setValidationErrors(['Unsupported file type. Please upload .csv, .json, or .txt files.']);
        return;
      }

      const result = validateMenuData(rawData);
      
      if (result.valid && result.data) {
        setParsedData(result.data);
        toast({
          title: 'File parsed successfully!',
          description: `Found ${result.data.length} days of menu data.`,
        });
      }
      
      if (result.errors.length > 0) {
        setValidationErrors(result.errors);
      }
    } catch (error) {
      setValidationErrors(['Error reading file. Please check the format and try again.']);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Manual entry handlers
  const addDay = () => {
    setManualDays([...manualDays, { date: '', items: [{ name: '', description: '', calories: '' }] }]);
  };

  const removeDay = (index: number) => {
    setManualDays(manualDays.filter((_, i) => i !== index));
  };

  const addItem = (dayIndex: number) => {
    const updated = [...manualDays];
    updated[dayIndex].items.push({ name: '', description: '', calories: '' });
    setManualDays(updated);
  };

  const removeItem = (dayIndex: number, itemIndex: number) => {
    const updated = [...manualDays];
    updated[dayIndex].items = updated[dayIndex].items.filter((_, i) => i !== itemIndex);
    setManualDays(updated);
  };

  const updateDay = (dayIndex: number, value: string) => {
    const updated = [...manualDays];
    updated[dayIndex].date = value;
    setManualDays(updated);
  };

  const updateItem = (dayIndex: number, itemIndex: number, field: keyof ManualMenuItem, value: string) => {
    const updated = [...manualDays];
    updated[dayIndex].items[itemIndex][field] = value;
    setManualDays(updated);
  };

  const convertManualToMenuData = (): ParsedMenu[] => {
    return manualDays
      .filter(day => day.date && day.items.some(item => item.name.trim()))
      .map(day => ({
        date: day.date,
        meal_type: 'lunch',
        items: day.items
          .filter(item => item.name.trim())
          .map(item => ({
            name: item.name.trim().slice(0, 200),
            description: item.description.trim().slice(0, 500),
            calories: item.calories ? parseInt(item.calories) : undefined,
          })),
      }));
  };

  const handleSubmit = async () => {
    const dataToSubmit = activeTab === 'form' ? convertManualToMenuData() : parsedData;
    
    if (!schoolName.trim() || !schoolEmail.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please fill in school name and email.',
        variant: 'destructive',
      });
      return;
    }

    if (!dataToSubmit || dataToSubmit.length === 0) {
      toast({
        title: 'Missing menu data',
        description: activeTab === 'form' 
          ? 'Please add at least one menu item.' 
          : 'Please upload a valid menu file.',
        variant: 'destructive',
      });
      return;
    }

    // Strict email validation
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(schoolEmail)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    if (schoolName.length > 200) {
      toast({
        title: 'School name too long',
        description: 'Maximum 200 characters allowed.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('menu_uploads')
        .insert([{
          school_name: schoolName.trim().slice(0, 200),
          school_email: schoolEmail.trim().toLowerCase(),
          upload_data: dataToSubmit as unknown as import('@/integrations/supabase/types').Json,
          status: 'pending',
        }]);

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: 'Menu submitted successfully!',
        description: 'We will review and publish your menu shortly.',
      });
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: 'Error submitting menu',
        description: err.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSchoolName('');
    setSchoolEmail('');
    setParsedData(null);
    setValidationErrors([]);
    setIsSubmitted(false);
    setManualDays([{ date: '', items: [{ name: '', description: '', calories: '' }] }]);
  };

  if (isSubmitted) {
    return (
      <Card className="card-elevated max-w-2xl mx-auto">
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
          <h3 className="font-display font-bold text-2xl mb-2">Thank You!</h3>
          <p className="text-muted-foreground mb-6">
            Your menu has been submitted successfully. We'll review it and publish it for students at {schoolName}.
          </p>
          <Button onClick={resetForm}>Submit Another Menu</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Mobile-friendly info banner */}
      <Card className="card-elevated border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Mobile-Friendly Form</p>
              <p className="text-sm text-muted-foreground">
                This form works great on your phone! Enter menus manually or upload a file.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            School Menu Upload
          </CardTitle>
          <CardDescription>
            Upload your school's meal menu for students to view.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* School Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name *</Label>
              <Input
                id="schoolName"
                placeholder="e.g., Lincoln High School"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schoolEmail">Contact Email *</Label>
              <Input
                id="schoolEmail"
                type="email"
                placeholder="admin@school.edu"
                value={schoolEmail}
                onChange={(e) => setSchoolEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Tabs for Manual vs File */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'form' | 'file')}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="form" className="gap-2">
                <Plus className="w-4 h-4" />
                Manual Entry
              </TabsTrigger>
              <TabsTrigger value="file" className="gap-2">
                <Upload className="w-4 h-4" />
                File Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="form" className="space-y-4">
              {manualDays.map((day, dayIndex) => (
                <Card key={dayIndex} className="border-dashed">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <Input
                          type="date"
                          value={day.date}
                          onChange={(e) => updateDay(dayIndex, e.target.value)}
                          className="w-auto"
                        />
                      </div>
                      {manualDays.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDay(dayIndex)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {day.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex gap-2 items-start">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Dish name *"
                            value={item.name}
                            onChange={(e) => updateItem(dayIndex, itemIndex, 'name', e.target.value)}
                            maxLength={200}
                          />
                          <div className="grid gap-2 sm:grid-cols-2">
                            <Input
                              placeholder="Description (optional)"
                              value={item.description}
                              onChange={(e) => updateItem(dayIndex, itemIndex, 'description', e.target.value)}
                              maxLength={500}
                            />
                            <Input
                              type="number"
                              placeholder="Calories (optional)"
                              value={item.calories}
                              onChange={(e) => updateItem(dayIndex, itemIndex, 'calories', e.target.value)}
                            />
                          </div>
                        </div>
                        {day.items.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(dayIndex, itemIndex)}
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addItem(dayIndex)}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Item
                    </Button>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={addDay} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Another Day
              </Button>
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              {/* File Upload */}
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  id="menu-file"
                />
                <label htmlFor="menu-file" className="cursor-pointer">
                  <div className="flex justify-center gap-4 mb-4">
                    <FileSpreadsheet className="w-10 h-10 text-muted-foreground" />
                    <FileJson className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-1">Click to upload</p>
                  <p className="text-sm text-muted-foreground">CSV, JSON, or TXT files (max 500KB)</p>
                </label>
              </div>

              {/* Parsed Data Preview */}
              {parsedData && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Preview ({parsedData.length} days)
                    </h4>
                    <Badge variant="secondary">{parsedData.reduce((sum, d) => sum + d.items.length, 0)} items total</Badge>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto space-y-3 border rounded-lg p-4">
                    {parsedData.map((day, i) => (
                      <div key={i} className="border-b last:border-0 pb-3 last:pb-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="font-medium">{day.date}</span>
                          {day.dayName && <span className="text-muted-foreground">({day.dayName})</span>}
                          <Badge variant="outline">{day.meal_type}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-6">
                          {day.items.map((item, j) => (
                            <Badge key={j} variant="secondary">{item.name}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Validation Issues</span>
              </div>
              <ul className="text-sm space-y-1 text-destructive">
                {validationErrors.slice(0, 5).map((error, i) => (
                  <li key={i}>• {error}</li>
                ))}
                {validationErrors.length > 5 && (
                  <li>• ...and {validationErrors.length - 5} more issues</li>
                )}
              </ul>
            </div>
          )}

          {/* Parsed Data Preview */}
          {parsedData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Preview ({parsedData.length} days)
                </h4>
                <Badge variant="secondary">{parsedData.reduce((sum, d) => sum + d.items.length, 0)} items total</Badge>
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-3 border rounded-lg p-4">
                {parsedData.map((day, i) => (
                  <div key={i} className="border-b last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="font-medium">{day.date}</span>
                      {day.dayName && <span className="text-muted-foreground">({day.dayName})</span>}
                      <Badge variant="outline">{day.meal_type}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-6">
                      {day.items.map((item, j) => (
                        <Badge key={j} variant="secondary">{item.name}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit} 
            disabled={!schoolName || !schoolEmail || !parsedData || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Menu'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Format Guide */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-base">File Format Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h5 className="font-medium mb-2">CSV Format</h5>
            <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-xs">
{`date,day_name,item,description,dietary
2024-01-15,Monday,Grilled Chicken,With vegetables,gluten-free
2024-01-15,Monday,Pasta Salad,Fresh and light,vegetarian
2024-01-16,Tuesday,Fish Tacos,With salsa,dairy-free`}
            </pre>
          </div>
          <div>
            <h5 className="font-medium mb-2">JSON Format</h5>
            <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-xs">
{`[
  {
    "date": "2024-01-15",
    "dayName": "Monday",
    "items": [
      {"name": "Grilled Chicken", "dietary": ["gluten-free"]}
    ]
  }
]`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
