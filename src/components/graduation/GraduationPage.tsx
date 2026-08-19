import { useBragSheet, BragCategory } from '@/hooks/useBragSheet';
import { useProfile } from '@/hooks/useProfile';
import { useGradeProgression } from '@/hooks/useGradeProgression';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  GraduationCap, 
  Trophy, 
  Clock, 
  Award, 
  Download, 
  Sparkles,
  Heart,
  Briefcase,
  Users,
  Star,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const categoryConfig: Record<BragCategory, { label: string; icon: React.ElementType }> = {
  volunteering: { label: 'Volunteering', icon: Heart },
  job: { label: 'Work Experience', icon: Briefcase },
  award: { label: 'Awards', icon: Award },
  internship: { label: 'Internships', icon: GraduationCap },
  leadership: { label: 'Leadership', icon: Star },
  club: { label: 'Clubs', icon: Users },
  extracurricular: { label: 'Extracurriculars', icon: Trophy },
  academic: { label: 'Academic', icon: GraduationCap },
  other: { label: 'Other', icon: Star },
};

export function GraduationPage() {
  const { profile } = useProfile();
  const { isGraduated, undoGraduation } = useGradeProgression();
  const { entries, stats, entriesByYear } = useBragSheet();

  const sortedYears = Object.keys(entriesByYear).sort((a, b) => a.localeCompare(b));

  // Group entries by category for summary
  const entriesByCategory = entries.reduce((acc, entry) => {
    if (!acc[entry.category]) acc[entry.category] = [];
    acc[entry.category].push(entry);
    return acc;
  }, {} as Record<BragCategory, typeof entries>);

  const handleExportSummary = () => {
    // Generate a text summary for copying
    let summary = `BRAG SHEET SUMMARY\n`;
    summary += `${profile?.full_name || 'Student'}\n`;
    summary += `Graduated: ${format(new Date(), 'MMMM yyyy')}\n\n`;
    
    summary += `OVERVIEW\n`;
    summary += `• Total Achievements: ${stats.total}\n`;
    summary += `• Total Hours: ${stats.totalHours}\n`;
    summary += `• Years Active: ${sortedYears.length}\n\n`;

    Object.entries(entriesByCategory).forEach(([category, items]) => {
      const config = categoryConfig[category as BragCategory];
      summary += `${config.label.toUpperCase()}\n`;
      items.forEach(item => {
        summary += `• ${item.title}`;
        if (item.hours_spent) summary += ` (${item.hours_spent} hours)`;
        summary += `\n`;
        if (item.description) summary += `  ${item.description}\n`;
        if (item.impact) summary += `  Impact: ${item.impact}\n`;
      });
      summary += `\n`;
    });

    // Download as text file
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brag-sheet-summary-${profile?.full_name?.replace(/\s+/g, '-') || 'student'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isGraduated) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <GraduationCap className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-display font-bold mb-2">Not Graduated Yet</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          This page will be available once you complete your senior year!
        </p>
        <Button asChild variant="outline">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-up">
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary via-accent to-primary mb-6 shadow-glow">
          <GraduationCap className="w-12 h-12 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-display font-bold mb-2">
          🎓 Congratulations, Graduate!
        </h1>
        <p className="text-xl text-muted-foreground mb-4">
          {profile?.full_name || 'Student'}
        </p>
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-lg">Class of {new Date().getFullYear()}</span>
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-elevated text-center">
          <CardContent className="pt-6">
            <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Achievements</p>
          </CardContent>
        </Card>
        
        <Card className="card-elevated text-center">
          <CardContent className="pt-6">
            <Clock className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats.totalHours}</p>
            <p className="text-sm text-muted-foreground">Hours Logged</p>
          </CardContent>
        </Card>
        
        <Card className="card-elevated text-center">
          <CardContent className="pt-6">
            <Award className="w-8 h-8 text-warning mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats.verified}</p>
            <p className="text-sm text-muted-foreground">Verified</p>
          </CardContent>
        </Card>
        
        <Card className="card-elevated text-center">
          <CardContent className="pt-6">
            <GraduationCap className="w-8 h-8 text-accent-foreground mx-auto mb-2" />
            <p className="text-3xl font-bold">{sortedYears.length}</p>
            <p className="text-sm text-muted-foreground">Years Active</p>
          </CardContent>
        </Card>
      </div>

      {/* Brag Sheet Summary by Category */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Your Brag Sheet Summary
          </CardTitle>
          <CardDescription>
            A complete overview of your high school achievements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(entriesByCategory).map(([category, items]) => {
            const config = categoryConfig[category as BragCategory];
            const CategoryIcon = config.icon;
            
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <CategoryIcon className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{config.label}</h3>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>
                <div className="space-y-2 ml-7">
                  {items.map(item => (
                    <div key={item.id} className="p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.grade_level} • {item.school_year}
                            {item.hours_spent && ` • ${item.hours_spent} hours`}
                          </p>
                        </div>
                        {item.verification_status === 'verified' && (
                          <Badge variant="outline" className="bg-success/10 text-success">
                            Verified
                          </Badge>
                        )}
                      </div>
                      {item.impact && (
                        <p className="text-sm mt-2">
                          <span className="font-medium text-primary">Impact:</span> {item.impact}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <Separator className="mt-4" />
              </div>
            );
          })}

          {entries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No entries in your Brag Sheet yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" onClick={handleExportSummary}>
          <Download className="w-5 h-5 mr-2" />
          Export Summary for College Apps
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link to="/">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to LunchLit
          </Link>
        </Button>
      </div>

      {/* Undo Graduation */}
      <div className="text-center pt-4">
        <Button variant="ghost" size="sm" onClick={undoGraduation} className="text-muted-foreground">
          Made a mistake? Undo graduation
        </Button>
      </div>
    </div>
  );
}
