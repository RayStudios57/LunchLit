import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ExternalLink, Loader2, Search, MapPin, GraduationCap, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';

interface Scholarship {
  title: string;
  url: string;
  description: string;
}

type Category = 'local' | 'school' | 'national';

export function ScholarshipsTab() {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [category, setCategory] = useState<Category>('local');
  const [location, setLocation] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<Category, Scholarship[]>>({ local: [], school: [], national: [] });

  const search = async () => {
    setLoading(true);
    try {
      const payload: Record<string, string> = { category };
      if (category === 'local') payload.location = location || 'United States';
      if (category === 'school') payload.schoolName = schoolName;
      if (category === 'national') {
        payload.gradeLevel = profile?.grade_level || 'high school';
        payload.keywords = keywords;
      }
      const { data, error } = await supabase.functions.invoke('find-scholarships', { body: payload });
      if (error) throw error;
      setResults((prev) => ({ ...prev, [category]: data?.scholarships ?? [] }));
      if (!data?.scholarships?.length) {
        toast({ title: 'No results', description: 'Try different keywords or another category.' });
      }
    } catch (e: any) {
      toast({ title: 'Search failed', description: e.message ?? 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <DollarSign className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-medium">Live scholarship finder</p>
          <p className="text-muted-foreground">We research the live web every time you search, so listings stay current.</p>
        </div>
      </div>

      <Tabs value={category} onValueChange={(v) => setCategory(v as Category)}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="local" className="gap-1"><MapPin className="w-4 h-4" />Local</TabsTrigger>
          <TabsTrigger value="school" className="gap-1"><GraduationCap className="w-4 h-4" />By School</TabsTrigger>
          <TabsTrigger value="national" className="gap-1"><Globe className="w-4 h-4" />National</TabsTrigger>
        </TabsList>

        <TabsContent value="local" className="space-y-3 pt-4">
          <Label htmlFor="loc">City / State</Label>
          <Input id="loc" placeholder="e.g. Austin, Texas" value={location} onChange={(e) => setLocation(e.target.value)} />
        </TabsContent>
        <TabsContent value="school" className="space-y-3 pt-4">
          <Label htmlFor="sch">College / University</Label>
          <Input id="sch" placeholder="e.g. University of Michigan" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
        </TabsContent>
        <TabsContent value="national" className="space-y-3 pt-4">
          <Label htmlFor="kw">Keywords (optional)</Label>
          <Input id="kw" placeholder="e.g. STEM, first-generation, women in tech" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
        </TabsContent>
      </Tabs>

      <Button onClick={search} disabled={loading} className="w-full">
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
        {loading ? 'Researching the web...' : 'Find scholarships'}
      </Button>

      <div className="space-y-3">
        {results[category].map((s, i) => (
          <Card key={i} className="card-elevated hover:border-primary/40 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm leading-snug">{s.title}</h3>
                  {s.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{s.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">{new URL(s.url).hostname.replace('www.', '')}</Badge>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    Open <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && results[category].length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            Search above to see live scholarship opportunities.
          </p>
        )}
      </div>
    </div>
  );
}
