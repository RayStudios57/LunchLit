import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Briefcase, TrendingUp, Target, ChevronRight, RotateCcw } from 'lucide-react';
import { useBragSheet } from '@/hooks/useBragSheet';
import { useBragSheetAcademics } from '@/hooks/useBragSheetAcademics';
import { usePresentationMode } from '@/contexts/PresentationModeContext';
import { dummyStrengthsResults } from '@/data/presentationDummyData';

interface Strength {
  name: string;
  score: number;
  description: string;
  careers: string[];
}

interface CareerPath {
  field: string;
  match: number;
  reason: string;
}

function analyzeStrengths(entries: any[], academics: any): { topStrengths: Strength[]; suggestedPaths: CareerPath[] } {
  const categoryHours: Record<string, number> = {};
  const categoryCount: Record<string, number> = {};
  
  entries.forEach(e => {
    categoryHours[e.category] = (categoryHours[e.category] || 0) + (e.hours_spent || 0);
    categoryCount[e.category] = (categoryCount[e.category] || 0) + 1;
  });

  const totalHours = Object.values(categoryHours).reduce((s, v) => s + v, 0);
  const totalEntries = entries.length;
  
  const strengths: Strength[] = [];

  // Analytical
  const stemHours = (categoryHours['academic'] || 0) + (categoryHours['club'] || 0);
  const stemScore = Math.min(95, 50 + (stemHours / Math.max(totalHours, 1)) * 80 + (academics?.gpa_weighted ? academics.gpa_weighted * 5 : 0));
  strengths.push({
    name: 'Analytical Thinking',
    score: Math.round(stemScore),
    description: 'Your ability to break down complex problems and find logical solutions based on your academic and club activities.',
    careers: ['Software Engineer', 'Data Scientist', 'Research Analyst', 'Financial Analyst'],
  });

  // Leadership
  const leadershipHours = (categoryHours['leadership'] || 0) + (categoryHours['club'] || 0);
  const hasLeaderRole = entries.some(e => e.position_role?.toLowerCase().includes('president') || e.position_role?.toLowerCase().includes('captain') || e.position_role?.toLowerCase().includes('leader'));
  const leaderScore = Math.min(95, 40 + (leadershipHours / Math.max(totalHours, 1)) * 60 + (hasLeaderRole ? 25 : 0));
  strengths.push({
    name: 'Leadership',
    score: Math.round(leaderScore),
    description: 'Your capacity to inspire, guide, and organize others toward shared goals.',
    careers: ['Project Manager', 'Entrepreneur', 'Team Lead', 'Executive Director'],
  });

  // Service & Empathy
  const serviceHours = (categoryHours['volunteering'] || 0);
  const serviceScore = Math.min(95, 30 + (serviceHours / Math.max(totalHours, 1)) * 100);
  strengths.push({
    name: 'Empathy & Service',
    score: Math.round(serviceScore),
    description: 'Your commitment to helping others and making a positive impact in your community.',
    careers: ['Healthcare Professional', 'Social Worker', 'Nonprofit Director', 'Counselor'],
  });

  // Communication
  const commEntries = entries.filter(e => ['extracurricular', 'leadership'].includes(e.category));
  const commScore = Math.min(95, 40 + (commEntries.length / Math.max(totalEntries, 1)) * 80);
  strengths.push({
    name: 'Communication',
    score: Math.round(commScore),
    description: 'Your ability to express ideas clearly and persuade others through verbal and written communication.',
    careers: ['Marketing Director', 'Public Relations', 'Attorney', 'Journalist'],
  });

  // Creativity
  const creativeEntries = entries.filter(e => ['club', 'award', 'other'].includes(e.category));
  const creativeScore = Math.min(95, 35 + (creativeEntries.length / Math.max(totalEntries, 1)) * 80);
  strengths.push({
    name: 'Creativity & Innovation',
    score: Math.round(creativeScore),
    description: 'Your ability to think outside the box and create new solutions or projects.',
    careers: ['UX Designer', 'Product Manager', 'Creative Director', 'Startup Founder'],
  });

  strengths.sort((a, b) => b.score - a.score);

  // Career paths
  const paths: CareerPath[] = [
    { field: 'STEM & Technology', match: Math.round((strengths.find(s => s.name === 'Analytical Thinking')?.score || 50) * 1.02), reason: 'Strong analytical foundation and problem-solving skills.' },
    { field: 'Healthcare & Life Sciences', match: Math.round((strengths.find(s => s.name === 'Empathy & Service')?.score || 50) * 1.0), reason: 'Compassion combined with academic rigor.' },
    { field: 'Business & Entrepreneurship', match: Math.round(((strengths.find(s => s.name === 'Leadership')?.score || 50) + (strengths.find(s => s.name === 'Communication')?.score || 50)) / 2.1), reason: 'Leadership and communication strengths ideal for business.' },
    { field: 'Creative Arts & Design', match: Math.round((strengths.find(s => s.name === 'Creativity & Innovation')?.score || 50) * 1.0), reason: 'Innovative thinking and creative problem-solving.' },
  ].sort((a, b) => b.match - a.match);

  return { topStrengths: strengths.slice(0, 5), suggestedPaths: paths };
}

export function StrengthsFinder() {
  const { entries } = useBragSheet();
  const { academics } = useBragSheetAcademics();
  const { isPresentationMode } = usePresentationMode();
  const [hasRun, setHasRun] = useState(false);
  const [results, setResults] = useState<{ topStrengths: Strength[]; suggestedPaths: CareerPath[] } | null>(null);

  if (isPresentationMode && !hasRun) {
    return (
      <div className="space-y-6">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Strengths Finder
            </CardTitle>
            <CardDescription>
              Discover your top strengths and potential career paths based on your activities, achievements, and academics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => { setResults(dummyStrengthsResults); setHasRun(true); }} className="w-full">
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze My Strengths
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasRun) {
    const hasEnoughData = entries.length >= 2;
    return (
      <div className="space-y-6">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Strengths Finder
            </CardTitle>
            <CardDescription>
              Discover your top strengths and potential career paths based on your activities, achievements, and academics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasEnoughData && (
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                <p>💡 Add at least 2 entries to your Brag Sheet to get more accurate results!</p>
              </div>
            )}
            <Button 
              onClick={() => {
                const r = analyzeStrengths(entries, academics);
                setResults(r);
                setHasRun(true);
              }}
              className="w-full"
              disabled={entries.length === 0}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze My Strengths
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = results!;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Your Strength Profile
        </h3>
        <Button variant="outline" size="sm" onClick={() => {
          setHasRun(false);
          setResults(null);
        }}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Re-analyze
        </Button>
      </div>

      {/* Top Strengths */}
      <div className="space-y-4">
        {data.topStrengths.map((strength, i) => (
          <Card key={i} className="card-elevated">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={i === 0 ? 'default' : 'secondary'} className="text-xs">
                    #{i + 1}
                  </Badge>
                  <h4 className="font-semibold">{strength.name}</h4>
                </div>
                <span className="text-sm font-bold text-primary">{strength.score}%</span>
              </div>
              <Progress value={strength.score} className="h-2 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">{strength.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {strength.careers.map(career => (
                  <Badge key={career} variant="outline" className="text-xs">
                    <Briefcase className="w-3 h-3 mr-1" />
                    {career}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Career Paths */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="w-5 h-5" />
            Suggested Career Paths
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.suggestedPaths.map((path, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{path.field}</h4>
                  <Badge variant={path.match >= 85 ? 'default' : 'secondary'} className="text-xs">
                    {path.match}% match
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{path.reason}</p>
              </div>
              <TrendingUp className={`w-5 h-5 ${path.match >= 85 ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
