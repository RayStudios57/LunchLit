import { useState, useRef } from 'react';
import { useTasks, Task } from '@/hooks/useTasks';
import { useClassSchedule, ClassSchedule } from '@/hooks/useClassSchedule';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Download, Upload, FileJson, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

// Validation schemas
const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
  due_time: z.string().nullable().optional(),
  is_completed: z.boolean().optional().default(false),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  category: z.enum(['homework', 'test', 'project', 'general']).optional().default('general'),
});

const classSchema = z.object({
  class_name: z.string().min(1),
  teacher_name: z.string().nullable().optional(),
  room_number: z.string().nullable().optional(),
  day_of_week: z.number().min(0).max(6),
  start_time: z.string(),
  end_time: z.string(),
  color: z.string().optional().default('#10b981'),
});

type ImportResult = {
  success: number;
  failed: number;
  errors: string[];
};

export function ImportExportView() {
  const { tasks, addTask } = useTasks();
  const { classes, addClass } = useClassSchedule();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [dataType, setDataType] = useState<'tasks' | 'classes'>('tasks');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Export functions
  const exportToJSON = (data: Task[] | ClassSchedule[], filename: string) => {
    const exportData = data.map(item => {
      const { id, user_id, created_at, updated_at, ...rest } = item as Task & ClassSchedule;
      return rest;
    });
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `${filename}.json`);
  };

  const exportToCSV = (data: Task[] | ClassSchedule[], filename: string) => {
    if (data.length === 0) return;
    
    const exportData = data.map(item => {
      const { id, user_id, created_at, updated_at, ...rest } = item as Task & ClassSchedule;
      return rest;
    });
    
    const headers = Object.keys(exportData[0]);
    const csvRows = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => {
          const value = (row as Record<string, unknown>)[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
          return String(value);
        }).join(',')
      )
    ];
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    downloadBlob(blob, `${filename}.csv`);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Export complete', description: `Downloaded ${filename}` });
  };

  // Import functions
  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      const obj: Record<string, string> = {};
      headers.forEach((header, i) => {
        obj[header] = values[i] || '';
      });
      return obj;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    setImportResult(null);
    
    try {
      const text = await file.text();
      const isJSON = file.name.endsWith('.json');
      
      let data: unknown[];
      
      if (isJSON) {
        try {
          data = JSON.parse(text);
          if (!Array.isArray(data)) {
            throw new Error('JSON must be an array');
          }
        } catch {
          toast({ title: 'Invalid JSON', description: 'File must contain a valid JSON array', variant: 'destructive' });
          return;
        }
      } else {
        data = parseCSV(text);
      }
      
      const result: ImportResult = { success: 0, failed: 0, errors: [] };
      
      for (let i = 0; i < data.length; i++) {
        try {
          if (dataType === 'tasks') {
            const parsed = taskSchema.parse(data[i]);
            await addTask.mutateAsync(parsed as Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>);
          } else {
            // Convert string day_of_week to number if needed
            const item = data[i] as Record<string, unknown>;
            if (typeof item.day_of_week === 'string') {
              item.day_of_week = parseInt(item.day_of_week, 10);
            }
            const parsed = classSchema.parse(item);
            await addClass.mutateAsync(parsed as Omit<ClassSchedule, 'id' | 'user_id' | 'created_at' | 'updated_at'>);
          }
          result.success++;
        } catch (error) {
          result.failed++;
          result.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
        }
      }
      
      setImportResult(result);
      
      if (result.success > 0) {
        toast({ title: 'Import complete', description: `Successfully imported ${result.success} items` });
      }
    } catch (error) {
      toast({ title: 'Import failed', description: 'Please check your file format', variant: 'destructive' });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-up">
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="font-display">Import & Export Data</CardTitle>
          <CardDescription>Back up or share your schedules and tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={dataType} onValueChange={(v) => setDataType(v as 'tasks' | 'classes')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="classes">Class Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Tasks
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {tasks.length} tasks available
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => exportToJSON(tasks, 'tasks')}>
                      <FileJson className="w-4 h-4 mr-1" />
                      JSON
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => exportToCSV(tasks, 'tasks')}>
                      <FileSpreadsheet className="w-4 h-4 mr-1" />
                      CSV
                    </Button>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Import Tasks
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload JSON or CSV file
                  </p>
                  <Button size="sm" onClick={handleImport} disabled={isImporting}>
                    {isImporting ? 'Importing...' : 'Choose File'}
                  </Button>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="classes" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Classes
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {classes.length} classes available
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => exportToJSON(classes, 'classes')}>
                      <FileJson className="w-4 h-4 mr-1" />
                      JSON
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => exportToCSV(classes, 'classes')}>
                      <FileSpreadsheet className="w-4 h-4 mr-1" />
                      CSV
                    </Button>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Import Classes
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload JSON or CSV file
                  </p>
                  <Button size="sm" onClick={handleImport} disabled={isImporting}>
                    {isImporting ? 'Importing...' : 'Choose File'}
                  </Button>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            onChange={handleFileChange}
            className="hidden"
          />

          {importResult && (
            <Card className={`p-4 ${importResult.failed > 0 ? 'border-warning' : 'border-success'}`}>
              <div className="flex items-start gap-3">
                {importResult.failed > 0 ? (
                  <AlertCircle className="w-5 h-5 text-warning shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                )}
                <div>
                  <p className="font-medium">
                    Imported {importResult.success} of {importResult.success + importResult.failed} items
                  </p>
                  {importResult.errors.length > 0 && (
                    <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside">
                      {importResult.errors.slice(0, 5).map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                      {importResult.errors.length > 5 && (
                        <li>...and {importResult.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
