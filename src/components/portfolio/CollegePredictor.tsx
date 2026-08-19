import { useState } from 'react';
import { useBragSheet } from '@/hooks/useBragSheet';
import { useBragSheetAcademics } from '@/hooks/useBragSheetAcademics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChartBar, AlertTriangle, TrendingUp, Trophy, Clock, GraduationCap, Sparkles, Search } from 'lucide-react';

interface PredictionResult {
  schoolName: string;
  probability: number;
  factors: {
    gpa: { score: number; label: string };
    activities: { score: number; label: string };
    hours: { score: number; label: string };
    awards: { score: number; label: string };
  };
  suggestions: string[];
  tier: 'reach' | 'match' | 'safety';
}

// Simplified mock data for common schools - in production, this would come from an API
const schoolProfiles: Record<string, { avgGPA: number; minGPA: number; activityWeight: number; hoursWeight: number; acceptanceRate: number }> = {
  'mit': { avgGPA: 4.17, minGPA: 3.9, activityWeight: 0.3, hoursWeight: 0.2, acceptanceRate: 4 },
  'harvard': { avgGPA: 4.18, minGPA: 3.9, activityWeight: 0.35, hoursWeight: 0.2, acceptanceRate: 3.4 },
  'stanford': { avgGPA: 4.18, minGPA: 3.9, activityWeight: 0.3, hoursWeight: 0.2, acceptanceRate: 3.7 },
  'yale': { avgGPA: 4.14, minGPA: 3.85, activityWeight: 0.3, hoursWeight: 0.2, acceptanceRate: 4.5 },
  'princeton': { avgGPA: 4.14, minGPA: 3.85, activityWeight: 0.3, hoursWeight: 0.2, acceptanceRate: 4.4 },
  'columbia': { avgGPA: 4.12, minGPA: 3.8, activityWeight: 0.25, hoursWeight: 0.15, acceptanceRate: 3.9 },
  'uc berkeley': { avgGPA: 4.0, minGPA: 3.7, activityWeight: 0.2, hoursWeight: 0.15, acceptanceRate: 11.4 },
  'ucla': { avgGPA: 4.0, minGPA: 3.7, activityWeight: 0.2, hoursWeight: 0.15, acceptanceRate: 8.6 },
  'unc': { avgGPA: 4.0, minGPA: 3.5, activityWeight: 0.2, hoursWeight: 0.15, acceptanceRate: 17 },
  'georgia tech': { avgGPA: 4.07, minGPA: 3.7, activityWeight: 0.2, hoursWeight: 0.15, acceptanceRate: 16 },
  'uva': { avgGPA: 4.0, minGPA: 3.6, activityWeight: 0.2, hoursWeight: 0.15, acceptanceRate: 19 },
  'umich': { avgGPA: 3.9, minGPA: 3.5, activityWeight: 0.2, hoursWeight: 0.15, acceptanceRate: 18 },
  'nyu': { avgGPA: 3.8, minGPA: 3.4, activityWeight: 0.25, hoursWeight: 0.2, acceptanceRate: 12.2 },
  'boston university': { avgGPA: 3.7, minGPA: 3.3, activityWeight: 0.2, hoursWeight: 0.15, acceptanceRate: 14 },
  'northeastern': { avgGPA: 3.8, minGPA: 3.4, activityWeight: 0.25, hoursWeight: 0.2, acceptanceRate: 7 },
  'usc': { avgGPA: 3.85, minGPA: 3.5, activityWeight: 0.25, hoursWeight: 0.15, acceptanceRate: 12 },
};

export function CollegePredictor() {
  const { entries, stats: bragStats } = useBragSheet();
  const { academics } = useBragSheetAcademics();
  const [schoolName, setSchoolName] = useState('');
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const totalHours = entries.reduce((sum, e) => sum + (e.hours_spent || 0), 0);
  const awardCount = entries.filter(e => e.category === 'award' || e.category === 'academic').length;
  const leadershipCount = entries.filter(e => e.category === 'leadership').length;
  const activityCount = entries.length;

  const calculatePrediction = () => {
    if (!schoolName.trim()) return;

    setIsCalculating(true);

    // Simulate calculation delay
    setTimeout(() => {
      const normalizedName = schoolName.toLowerCase().trim();
      
      // Find matching school or use default profile
      const schoolKey = Object.keys(schoolProfiles).find(key => normalizedName.includes(key));
      const profile = schoolKey ? schoolProfiles[schoolKey] : {
        avgGPA: 3.5,
        minGPA: 3.0,
        activityWeight: 0.2,
        hoursWeight: 0.15,
        acceptanceRate: 50,
      };

      const gpa = academics?.gpa_weighted || academics?.gpa_unweighted || 0;

      // Calculate individual factor scores (0-100)
      let gpaScore = 0;
      if (gpa >= profile.avgGPA) {
        gpaScore = 90 + Math.min(10, (gpa - profile.avgGPA) * 20);
      } else if (gpa >= profile.minGPA) {
        gpaScore = 60 + ((gpa - profile.minGPA) / (profile.avgGPA - profile.minGPA)) * 30;
      } else if (gpa > 0) {
        gpaScore = Math.max(10, (gpa / profile.minGPA) * 60);
      }

      const activityScore = Math.min(100, activityCount * 10 + leadershipCount * 15);
      const hoursScore = Math.min(100, (totalHours / 200) * 100);
      const awardsScore = Math.min(100, awardCount * 20);

      // Weighted probability calculation
      let probability = (
        gpaScore * 0.4 +
        activityScore * profile.activityWeight +
        hoursScore * profile.hoursWeight +
        awardsScore * 0.15
      );

      // Adjust based on acceptance rate
      probability = probability * (profile.acceptanceRate / 50);
      probability = Math.min(95, Math.max(5, probability));

      // Determine tier
      let tier: 'reach' | 'match' | 'safety';
      if (probability < 25) {
        tier = 'reach';
      } else if (probability < 60) {
        tier = 'match';
      } else {
        tier = 'safety';
      }

      // Generate suggestions
      const suggestions: string[] = [];
      if (gpaScore < 70) {
        suggestions.push('Focus on improving your GPA in remaining semesters');
      }
      if (activityCount < 5) {
        suggestions.push('Add more extracurricular activities to your profile');
      }
      if (leadershipCount < 2) {
        suggestions.push('Seek leadership positions in clubs or organizations');
      }
      if (totalHours < 100) {
        suggestions.push('Log more volunteer or work hours');
      }
      if (awardCount < 2) {
        suggestions.push('Pursue academic competitions or awards');
      }
      if (suggestions.length === 0) {
        suggestions.push('Your profile looks strong! Focus on essay writing and recommendations.');
      }

      setPrediction({
        schoolName: schoolName,
        probability: Math.round(probability),
        factors: {
          gpa: { score: Math.round(gpaScore), label: gpa > 0 ? `${gpa.toFixed(2)} GPA` : 'No GPA entered' },
          activities: { score: Math.round(activityScore), label: `${activityCount} activities` },
          hours: { score: Math.round(hoursScore), label: `${totalHours} hours` },
          awards: { score: Math.round(awardsScore), label: `${awardCount} awards` },
        },
        suggestions,
        tier,
      });

      setIsCalculating(false);
    }, 800);
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return 'bg-success';
    if (score >= 40) return 'bg-warning';
    return 'bg-destructive';
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'reach': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'match': return 'bg-warning/10 text-warning border-warning/30';
      case 'safety': return 'bg-success/10 text-success border-success/30';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> This is an <strong>estimate only</strong> based on available data. 
          Actual admission decisions depend on many factors including essays, recommendations, interviews, 
          and holistic review that cannot be predicted. Use this as a general guide, not a guarantee.
        </AlertDescription>
      </Alert>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBar className="w-5 h-5 text-primary" />
            College Acceptance Estimator
          </CardTitle>
          <CardDescription>
            Enter a school name to get an estimated probability based on your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="e.g., MIT, Harvard, UCLA, Georgia Tech..."
                onKeyDown={(e) => e.key === 'Enter' && calculatePrediction()}
              />
            </div>
            <Button onClick={calculatePrediction} disabled={isCalculating || !schoolName.trim()}>
              {isCalculating ? (
                <span className="animate-pulse">Calculating...</span>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Predict
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Try schools like MIT, Harvard, Stanford, Yale, UCLA, Georgia Tech, NYU, or any other university
          </p>
        </CardContent>
      </Card>

      {/* Your Profile Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Your Profile Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-secondary/30">
              <GraduationCap className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold">{academics?.gpa_weighted?.toFixed(2) || '—'}</p>
              <p className="text-xs text-muted-foreground">Weighted GPA</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/30">
              <Sparkles className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold">{activityCount}</p>
              <p className="text-xs text-muted-foreground">Activities</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/30">
              <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold">{totalHours}</p>
              <p className="text-xs text-muted-foreground">Hours Logged</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/30">
              <Trophy className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold">{awardCount}</p>
              <p className="text-xs text-muted-foreground">Awards</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prediction Results */}
      {prediction && (
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{prediction.schoolName}</CardTitle>
              <Badge variant="outline" className={getTierColor(prediction.tier)}>
                {prediction.tier.charAt(0).toUpperCase() + prediction.tier.slice(1)} School
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Probability */}
            <div className="text-center py-4">
              <p className="text-5xl font-bold text-primary">{prediction.probability}%</p>
              <p className="text-muted-foreground mt-1">Estimated Acceptance Probability</p>
              <p className="text-xs text-muted-foreground mt-2 italic">
                * This is an estimate, not a guarantee
              </p>
            </div>

            {/* Factor Breakdown */}
            <div className="space-y-4">
              <h4 className="font-medium">Factor Analysis</h4>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      GPA
                    </span>
                    <span>{prediction.factors.gpa.label}</span>
                  </div>
                  <Progress value={prediction.factors.gpa.score} className={`h-2 ${getProgressColor(prediction.factors.gpa.score)}`} />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      Activities
                    </span>
                    <span>{prediction.factors.activities.label}</span>
                  </div>
                  <Progress value={prediction.factors.activities.score} className={`h-2 ${getProgressColor(prediction.factors.activities.score)}`} />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Hours
                    </span>
                    <span>{prediction.factors.hours.label}</span>
                  </div>
                  <Progress value={prediction.factors.hours.score} className={`h-2 ${getProgressColor(prediction.factors.hours.score)}`} />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      Awards
                    </span>
                    <span>{prediction.factors.awards.label}</span>
                  </div>
                  <Progress value={prediction.factors.awards.score} className={`h-2 ${getProgressColor(prediction.factors.awards.score)}`} />
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Suggestions to Improve
              </h4>
              <ul className="space-y-1">
                {prediction.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
