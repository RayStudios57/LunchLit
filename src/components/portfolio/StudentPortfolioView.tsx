import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useBragSheet } from '@/hooks/useBragSheet';
import { useBragSheetAcademics } from '@/hooks/useBragSheetAcademics';
import { useStudentGoals } from '@/hooks/useStudentGoals';
import { useTargetSchools } from '@/hooks/useTargetSchools';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { User, Mail, GraduationCap, Target, School, Trophy, TrendingUp, Lightbulb, Briefcase, ChartBar, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PortfolioOverview } from './PortfolioOverview';
import { GoalsManager } from './GoalsManager';
import { TargetSchoolsManager } from './TargetSchoolsManager';
import { CollegePredictor } from './CollegePredictor';
import { StrengthsFinder } from './StrengthsFinder';

export function StudentPortfolioView() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { entries, stats: bragStats } = useBragSheet();
  const { academics } = useBragSheetAcademics();
  const { goals, stats: goalStats } = useStudentGoals();
  const { schools, stats: schoolStats } = useTargetSchools();
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'schools' | 'predictor' | 'strengths'>('overview');

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Target className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-display font-bold mb-2">Student Portfolio</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Track your achievements, plan for college, and get insights on your academic journey.
        </p>
        <Button asChild>
          <Link to="/auth">Sign in to get started</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header Card */}
      <Card className="card-elevated bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold">{profile?.full_name || 'Student'}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </span>
                  {profile?.grade_level && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      {profile.grade_level}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bragStats.total}</p>
                <p className="text-xs text-muted-foreground">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Target className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{goalStats.total}</p>
                <p className="text-xs text-muted-foreground">Goals Set</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <School className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{schoolStats.total}</p>
                <p className="text-xs text-muted-foreground">Target Schools</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <TrendingUp className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{academics?.gpa_weighted?.toFixed(2) || '—'}</p>
                <p className="text-xs text-muted-foreground">Weighted GPA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Card className="card-elevated">
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="mb-6 flex flex-wrap h-auto gap-1">
              <TabsTrigger value="overview" className="flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="goals" className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                Goals
              </TabsTrigger>
              <TabsTrigger value="schools" className="flex items-center gap-1">
                <School className="w-4 h-4" />
                Target Schools
              </TabsTrigger>
              <TabsTrigger value="predictor" className="flex items-center gap-1">
                <ChartBar className="w-4 h-4" />
                Predictor
              </TabsTrigger>
              <TabsTrigger value="strengths" className="flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                Strengths
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <PortfolioOverview 
                entries={entries} 
                academics={academics} 
                goals={goals} 
                schools={schools}
              />
            </TabsContent>

            <TabsContent value="goals">
              <GoalsManager />
            </TabsContent>

            <TabsContent value="schools">
              <TargetSchoolsManager />
            </TabsContent>

            <TabsContent value="predictor">
              <CollegePredictor />
            </TabsContent>

            <TabsContent value="strengths">
              <StrengthsFinder />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
