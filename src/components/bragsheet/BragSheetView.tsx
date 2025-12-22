import { useState } from 'react';
import { useBragSheet } from '@/hooks/useBragSheet';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Trophy, Clock, Award, TrendingUp, Sparkles } from 'lucide-react';
import { BragSheetEntryCard } from './BragSheetEntryCard';
import { BragSheetEntryForm } from './BragSheetEntryForm';
import { BragSheetSuggestions } from './BragSheetSuggestions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';

export function BragSheetView() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { entries, entriesByYear, stats, isLoading } = useBragSheet();
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'suggestions'>('timeline');

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Trophy className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-display font-bold mb-2">Your Brag Sheet</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Track your achievements, activities, and accomplishments throughout high school. 
          Perfect for college applications!
        </p>
        <Button asChild>
          <Link to="/auth">Sign in to get started</Link>
        </Button>
      </div>
    );
  }

  const sortedYears = Object.keys(entriesByYear).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Award className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.verified}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalHours}</p>
                <p className="text-xs text-muted-foreground">Hours Logged</p>
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
                <p className="text-2xl font-bold">{sortedYears.length}</p>
                <p className="text-xs text-muted-foreground">Years Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="card-elevated">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-display flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              My Brag Sheet
            </CardTitle>
            <CardDescription>
              {profile?.grade_level ? `Currently in ${profile.grade_level}` : 'Track your achievements across high school'}
            </CardDescription>
          </div>
          <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Achievement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Achievement</DialogTitle>
              </DialogHeader>
              <BragSheetEntryForm onSuccess={() => setIsAddingEntry(false)} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'timeline' | 'suggestions')}>
            <TabsList className="mb-4">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="suggestions" className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Suggestions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-lg mb-2">No achievements yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start building your portfolio by adding your first achievement!
                  </p>
                  <Button onClick={() => setIsAddingEntry(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Achievement
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {sortedYears.map((year) => (
                    <div key={year}>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-primary" />
                        {year}
                        <span className="text-sm font-normal text-muted-foreground">
                          ({entriesByYear[year].length} entries)
                        </span>
                      </h3>
                      <div className="space-y-3 ml-6 border-l-2 border-border pl-4">
                        {entriesByYear[year].map((entry) => (
                          <BragSheetEntryCard key={entry.id} entry={entry} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="suggestions">
              <BragSheetSuggestions />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
