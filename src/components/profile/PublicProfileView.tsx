import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, Users, Award, Crown, Shield } from 'lucide-react';
import { ALL_BADGES_INCLUDING_MASTER, MASTER_BADGE } from '@/hooks/useAchievements';
import { useAuth } from '@/contexts/AuthContext';

const OWNER_USER_ID = '724c21f3-d6ba-497a-8ad9-a80dab24b55d';

interface PublicProfile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  grade_level: string | null;
  school_name: string | null;
  is_public: boolean;
}

export function PublicProfileView() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['public-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, grade_level, school_name, is_public')
        .eq('is_public', true);
      if (error) throw error;
      return data as PublicProfile[];
    },
  });

  const { data: selectedBadges = [] } = useQuery({
    queryKey: ['user-badges', selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return [];
      const { data, error } = await supabase
        .from('user_achievements')
        .select('badge_key')
        .eq('user_id', selectedUserId);
      if (error) throw error;
      return data.map(d => d.badge_key);
    },
    enabled: !!selectedUserId,
  });

  const filtered = profiles.filter(p =>
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.school_name?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedProfile = profiles.find(p => p.user_id === selectedUserId);

  if (selectedUserId && selectedProfile) {
    const hasMaster = selectedBadges.includes(MASTER_BADGE.key);
    return (
      <div className="space-y-6 max-w-2xl mx-auto animate-fade-up">
        <Button variant="ghost" onClick={() => setSelectedUserId(null)}>← Back to profiles</Button>
        <Card className="card-elevated">
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={selectedProfile.avatar_url || undefined} />
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                  {selectedProfile.full_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="font-display text-2xl font-bold">{selectedProfile.full_name || 'Anonymous'}</h2>
                  {selectedUserId === OWNER_USER_ID && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white gap-1">
                      <Crown className="w-3 h-3" /> Owner
                    </Badge>
                  )}
                </div>
                {selectedProfile.grade_level && <p className="text-muted-foreground">{selectedProfile.grade_level}</p>}
                {selectedProfile.school_name && <p className="text-sm text-muted-foreground">{selectedProfile.school_name}</p>}
              </div>
              {hasMaster && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white gap-1">
                  <Crown className="w-3 h-3" /> LunchLit Master
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Badges ({selectedBadges.length}/{ALL_BADGES_INCLUDING_MASTER.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                {ALL_BADGES_INCLUDING_MASTER.map(badge => {
                  const isUnlocked = selectedBadges.includes(badge.key);
                  return (
                    <Tooltip key={badge.key}>
                      <TooltipTrigger asChild>
                        <div className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
                          isUnlocked ? 'bg-primary/10' : 'opacity-30 grayscale'
                        }`}>
                          <span className="text-2xl">{badge.icon}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Users className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-display font-bold text-xl">Student Profiles</h2>
          <p className="text-sm text-muted-foreground">Browse public profiles and their badges</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or school..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-4"><div className="h-16 bg-muted rounded" /></CardContent></Card>)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No public profiles found.</p>
            <p className="text-sm text-muted-foreground mt-1">Make your profile public in Settings to appear here!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map(p => (
            <Card
              key={p.user_id}
              className="card-interactive cursor-pointer"
              onClick={() => setSelectedUserId(p.user_id)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={p.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {p.full_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{p.full_name || 'Anonymous'}</p>
                    {p.user_id === OWNER_USER_ID && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-yellow-400 text-yellow-600 shrink-0">
                        <Crown className="w-2.5 h-2.5 mr-0.5" />Owner
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {p.grade_level && `${p.grade_level} · `}{p.school_name || 'No school'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
