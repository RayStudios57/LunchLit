import { useState, useEffect } from 'react';
import { useBragSheetAcademics } from '@/hooks/useBragSheetAcademics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Plus, X, BookOpen, School, FlaskConical } from 'lucide-react';

interface TestScore {
  type: string;
  subject?: string;
  score: string;
  date?: string;
}

interface Course {
  name: string;
  teacher: string;
  grade?: string;
  year?: string;
}

export function BragSheetAcademicsForm() {
  const { academics, isLoading, saveAcademics } = useBragSheetAcademics();
  
  const [gpaWeighted, setGpaWeighted] = useState('');
  const [gpaUnweighted, setGpaUnweighted] = useState('');
  const [testScores, setTestScores] = useState<TestScore[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [colleges, setColleges] = useState<string[]>([]);
  const [newCollege, setNewCollege] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // New score form
  const [newScoreType, setNewScoreType] = useState('SAT');
  const [newScoreSubject, setNewScoreSubject] = useState('');
  const [newScoreValue, setNewScoreValue] = useState('');

  // New course form
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseTeacher, setNewCourseTeacher] = useState('');

  useEffect(() => {
    if (academics) {
      setGpaWeighted(academics.gpa_weighted?.toString() || '');
      setGpaUnweighted(academics.gpa_unweighted?.toString() || '');
      setTestScores(academics.test_scores || []);
      setCourses(academics.courses || []);
      setColleges(academics.colleges_applying || []);
    }
  }, [academics]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveAcademics.mutateAsync({
        gpa_weighted: gpaWeighted ? parseFloat(gpaWeighted) : null,
        gpa_unweighted: gpaUnweighted ? parseFloat(gpaUnweighted) : null,
        test_scores: testScores,
        courses: courses,
        colleges_applying: colleges.length > 0 ? colleges : null,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addTestScore = () => {
    if (!newScoreValue) return;
    setTestScores([...testScores, {
      type: newScoreType,
      subject: newScoreSubject || undefined,
      score: newScoreValue,
    }]);
    setNewScoreType('SAT');
    setNewScoreSubject('');
    setNewScoreValue('');
  };

  const removeTestScore = (index: number) => {
    setTestScores(testScores.filter((_, i) => i !== index));
  };

  const addCourse = () => {
    if (!newCourseName || !newCourseTeacher) return;
    setCourses([...courses, {
      name: newCourseName,
      teacher: newCourseTeacher,
    }]);
    setNewCourseName('');
    setNewCourseTeacher('');
  };

  const removeCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const addCollege = () => {
    if (!newCollege || colleges.includes(newCollege)) return;
    setColleges([...colleges, newCollege]);
    setNewCollege('');
  };

  const removeCollege = (college: string) => {
    setColleges(colleges.filter(c => c !== college));
  };

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  return (
    <div className="space-y-6">
      {/* GPA Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="w-5 h-5 text-primary" />
            GPA
          </CardTitle>
          <CardDescription>Enter your weighted and unweighted GPA</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gpa-weighted">Weighted GPA</Label>
            <Input
              id="gpa-weighted"
              type="number"
              step="0.01"
              max="5"
              placeholder="e.g., 4.5"
              value={gpaWeighted}
              onChange={(e) => setGpaWeighted(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gpa-unweighted">Unweighted GPA</Label>
            <Input
              id="gpa-unweighted"
              type="number"
              step="0.01"
              max="4"
              placeholder="e.g., 3.9"
              value={gpaUnweighted}
              onChange={(e) => setGpaUnweighted(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Test Scores Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FlaskConical className="w-5 h-5 text-primary" />
            Test Scores
          </CardTitle>
          <CardDescription>SAT, ACT, AP, IB scores</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {testScores.map((score, idx) => (
              <Badge key={idx} variant="secondary" className="gap-2 py-1.5">
                {score.type}{score.subject ? ` - ${score.subject}` : ''}: {score.score}
                <button onClick={() => removeTestScore(idx)} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2 items-end flex-wrap">
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <Select value={newScoreType} onValueChange={setNewScoreType}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAT">SAT</SelectItem>
                  <SelectItem value="ACT">ACT</SelectItem>
                  <SelectItem value="AP">AP</SelectItem>
                  <SelectItem value="IB">IB</SelectItem>
                  <SelectItem value="PSAT">PSAT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 flex-1 min-w-[120px]">
              <Label className="text-xs">Subject (optional)</Label>
              <Input
                placeholder="e.g., Math"
                value={newScoreSubject}
                onChange={(e) => setNewScoreSubject(e.target.value)}
              />
            </div>
            <div className="space-y-1 w-24">
              <Label className="text-xs">Score</Label>
              <Input
                placeholder="1500"
                value={newScoreValue}
                onChange={(e) => setNewScoreValue(e.target.value)}
              />
            </div>
            <Button type="button" size="sm" onClick={addTestScore}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Courses Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5 text-primary" />
            Courses Taken
          </CardTitle>
          <CardDescription>List your courses with their teachers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {courses.map((course, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div>
                  <span className="font-medium">{course.name}</span>
                  <span className="text-muted-foreground"> — {course.teacher}</span>
                </div>
                <button onClick={() => removeCourse(idx)} className="text-muted-foreground hover:text-destructive">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 items-end">
            <div className="space-y-1 flex-1">
              <Label className="text-xs">Course Name</Label>
              <Input
                placeholder="e.g., AP Calculus BC"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
              />
            </div>
            <div className="space-y-1 flex-1">
              <Label className="text-xs">Teacher Name</Label>
              <Input
                placeholder="e.g., Mr. Smith"
                value={newCourseTeacher}
                onChange={(e) => setNewCourseTeacher(e.target.value)}
              />
            </div>
            <Button type="button" size="sm" onClick={addCourse}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Colleges Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <School className="w-5 h-5 text-primary" />
            Colleges You're Applying To
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {colleges.map((college) => (
              <Badge key={college} variant="secondary" className="gap-2 py-1.5">
                {college}
                <button onClick={() => removeCollege(college)} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Stanford University"
              value={newCollege}
              onChange={(e) => setNewCollege(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCollege())}
            />
            <Button type="button" size="sm" onClick={addCollege}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        {isSaving ? 'Saving...' : 'Save Academic Information'}
      </Button>
    </div>
  );
}
