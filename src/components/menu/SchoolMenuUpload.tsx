import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  FileJson, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import { z } from 'zod';

// Schema for validating menu items
const menuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  dietary: z.array(z.string()).optional(),
  calories: z.number().optional(),
});

const dayMenuSchema = z.object({
  date: z.string(),
  dayName: z.string().optional(),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner']).optional().default('lunch'),
  items: z.array(menuItemSchema),
});

const menuUploadSchema = z.array(dayMenuSchema);

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

interface ValidationResult {
  valid: boolean;
  data?: ParsedMenu[];
  errors: string[];
}

export function SchoolMenuUpload() {
  const [schoolName, setSchoolName] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [parsedData, setParsedData] = useState<ParsedMenu[] | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/["']/g, ''));
    const data: any[] = [];
    
    // Group by date
    const menusByDate: Record<string, any> = {};

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/["']/g, ''));
      const row: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Extract date (support various column names)
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

      // Extract item
      const itemName = row.item || row.name || row.food || row.menu_item || '';
      if (itemName) {
        menusByDate[date].items.push({
          name: itemName,
          description: row.description || row.desc || '',
          dietary: (row.dietary || row.diet || row.tags || '').split(';').filter(Boolean),
          calories: row.calories ? parseInt(row.calories) : undefined,
        });
      }
    }

    return Object.values(menusByDate);
  };

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

  const handleSubmit = async () => {
    if (!schoolName.trim() || !schoolEmail.trim() || !parsedData) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all fields and upload a valid menu file.',
        variant: 'destructive',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(schoolEmail)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('menu_uploads')
        .insert([{
          school_name: schoolName.trim(),
          school_email: schoolEmail.trim(),
          upload_data: parsedData as unknown as import('@/integrations/supabase/types').Json,
          status: 'pending',
        }]);

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: 'Menu submitted successfully!',
        description: 'We will review and publish your menu shortly.',
      });
    } catch (error) {
      console.error('Error submitting menu:', error);
      toast({
        title: 'Error submitting menu',
        description: 'Please try again later.',
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
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            School Menu Upload
          </CardTitle>
          <CardDescription>
            Upload your school's meal menu for students to view. We accept CSV, JSON, and TXT files.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* School Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                placeholder="e.g., Lincoln High School"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schoolEmail">Contact Email</Label>
              <Input
                id="schoolEmail"
                type="email"
                placeholder="admin@school.edu"
                value={schoolEmail}
                onChange={(e) => setSchoolEmail(e.target.value)}
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Menu File</Label>
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
                <p className="font-medium mb-1">Click to upload or drag and drop</p>
                <p className="text-sm text-muted-foreground">CSV, JSON, or TXT files</p>
              </label>
            </div>
          </div>

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
