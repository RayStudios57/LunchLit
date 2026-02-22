import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Plus, Trash2 } from 'lucide-react';
import { useBragSheetAcademics } from '@/hooks/useBragSheetAcademics';

const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'D-': 0.7,
  'F': 0.0,
};

const GRADE_OPTIONS = Object.keys(GRADE_POINTS);

interface CourseEntry {
  name: string;
  grade: string;
  credits: number;
}

export function GpaCalculatorWidget() {
  const { academics } = useBragSheetAcademics();
  const [courses, setCourses] = useState<CourseEntry[]>([
    { name: '', grade: 'A', credits: 1 },
  ]);

  const addCourse = () => setCourses(prev => [...prev, { name: '', grade: 'A', credits: 1 }]);
  const removeCourse = (i: number) => setCourses(prev => prev.filter((_, idx) => idx !== i));
  const updateCourse = (i: number, field: keyof CourseEntry, value: string | number) => {
    setCourses(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  };

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const totalPoints = courses.reduce((sum, c) => sum + GRADE_POINTS[c.grade] * c.credits, 0);
  const calculatedGpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          GPA Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {academics?.gpa_unweighted && (
          <div className="flex items-center gap-4 p-3 rounded-lg bg-primary/10">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{academics.gpa_unweighted}</p>
              <p className="text-xs text-muted-foreground">Current UW</p>
            </div>
            {academics.gpa_weighted && (
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{academics.gpa_weighted}</p>
                <p className="text-xs text-muted-foreground">Current W</p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          {courses.map((course, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="Course name"
                value={course.name}
                onChange={(e) => updateCourse(i, 'name', e.target.value)}
                className="flex-1 h-9 text-sm"
              />
              <Select value={course.grade} onValueChange={(v) => updateCourse(i, 'grade', v)}>
                <SelectTrigger className="w-20 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_OPTIONS.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={0.5}
                max={5}
                step={0.5}
                value={course.credits}
                onChange={(e) => updateCourse(i, 'credits', parseFloat(e.target.value) || 1)}
                className="w-16 h-9 text-sm"
              />
              {courses.length > 1 && (
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeCourse(i)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={addCourse} className="gap-1">
            <Plus className="h-3.5 w-3.5" /> Add Course
          </Button>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Estimated GPA</p>
            <p className="text-2xl font-bold text-primary">{calculatedGpa}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
