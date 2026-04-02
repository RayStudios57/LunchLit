import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, Users, Award, Crown, UserPlus, Heart, Check, X, PartyPopper, Calendar, CheckSquare } from 'lucide-react';
import { ALL_BADGES_INCLUDING_MASTER, MASTER_BADGE } from '@/hooks/useAchievements';
import { useAuth } from '@/contexts/AuthContext';
import { useFriends } from '@/hooks/useFriends';
import { useToast } from '@/hooks/use-toast';

const OWNER_USER_ID = '724c21f3-d6ba-497a-8ad9-a80dab24b55d';

const CHEER_OPTIONS = ['🎉 Great job!', '💪 Keep going!', '🌟 You\'re amazing!', '🔥 On fire!', '📚 Study buddy!'];

interface PublicProfile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  grade_level: string | null;
  school_name: string | null;
  is_public: boolean;
}

export function FriendsView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [friendSearch, setFriendSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { acceptedFriends, pendingReceived, pendingSent, sendRequest, acceptRequest, removeFriend, sendCheer } = useFriends();

  // Public profiles for browsing
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

  // Search by user_id (for private profiles)
  const handleSearchById = async () => {
    if (!friendSearch.trim()) return;
    // Check if it looks like a name search or user ID
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, full_name, avatar_url, grade_level, school_name, is_public')
      .or(`full_name.ilike.%${friendSearch}%,user_id.eq.${friendSearch.length === 36 ? friendSearch : '00000000-0000-0000-0000-000000000000'}`)
      .limit(10);
    
    if (error || !data?.length) {
      toast({ title: 'No user found', description: 'Try searching by name or exact user ID', variant: 'destructive' });
      return;
    }
    
    if (data.length === 1) {
      setSelectedUserId(data[0].user_id);
    }
  };

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

  const { data: cheersReceived = [] } = useQuery({
    queryKey: ['cheers-received', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('cheers')
        .select('*')
        .eq('to_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Friend's schedule (only if they are an accepted friend)
  const isFriendOfSelected = acceptedFriends.some(f => f.friend_profile?.user_id === selectedUserId);
  
  const { data: friendSchedule = [] } = useQuery({
    queryKey: ['friend-schedule', selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return [];
      const { data, error } = await supabase
        .from('class_schedules')
        .select('*')
        .eq('user_id', selectedUserId)
        .order('day_of_week')
        .order('start_time');
      if (error) return [];
      return data;
    },
    enabled: !!selectedUserId && isFriendOfSelected,
  });

  // Friend's shared tasks
  const { data: friendSharedTasks = [] } = useQuery({
    queryKey: ['friend-shared-tasks', selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', selectedUserId)
        .eq('shared_with_friends', true)
        .eq('is_completed', false)
        .order('due_date', { ascending: true });
      if (error) return [];
      return data;
    },
    enabled: !!selectedUserId && isFriendOfSelected,
  });

  // My own schedule for comparison
  const { data: mySchedule = [] } = useQuery({
    queryKey: ['my-schedule-compare'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('class_schedules')
        .select('*')
        .eq('user_id', user.id)
        .order('day_of_week')
        .order('start_time');
      if (error) return [];
      return data;
    },
    enabled: !!user && isFriendOfSelected && !!selectedUserId,
  });

  const selectedProfile = profiles.find(p => p.user_id === selectedUserId);
  const isFriend = acceptedFriends.some(f => 
    f.friend_profile?.user_id === selectedUserId
  );
  const hasPending = pendingSent.some(f => 
    f.friend_user_id === selectedUserId
  );

  const filtered = profiles.filter(p =>
    p.user_id !== user?.id && (
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.school_name?.toLowerCase().includes(search.toLowerCase())
    )
  );

  // Selected profile detail view
  if (selectedUserId && selectedProfile) {
    const hasMaster = selectedBadges.includes(MASTER_BADGE.key);
    return (
      <div className="space-y-6 max-w-2xl mx-auto animate-fade-up">
        <Button variant="ghost" onClick={() => setSelectedUserId(null)}>← Back</Button>
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
              
              {/* Friend actions */}
              <div className="flex gap-2 mt-2">
                {user && selectedUserId !== user.id && (
                  isFriend ? (
                    <div className="flex gap-2">
                      {CHEER_OPTIONS.map(cheer => (
                        <Button key={cheer} variant="outline" size="sm" onClick={() => sendCheer.mutate({ toUserId: selectedUserId, message: cheer })}>
                          {cheer.split(' ')[0]}
                        </Button>
                      ))}
                    </div>
                  ) : hasPending ? (
                    <Badge variant="outline">Request Pending</Badge>
                  ) : (
                    <Button onClick={() => sendRequest.mutate(selectedUserId)} size="sm">
                      <UserPlus className="w-4 h-4 mr-1" /> Add Friend
                    </Button>
                  )
                )}
              </div>
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
          <h2 className="font-display font-bold text-xl">Friends</h2>
          <p className="text-sm text-muted-foreground">Connect with other students, cheer them on!</p>
        </div>
      </div>

      {/* Your Friend Code */}
      {user && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Your Friend Code</p>
              <p className="text-xs text-muted-foreground font-mono select-all">{user.id}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              navigator.clipboard.writeText(user.id);
              toast({ title: 'Friend code copied!' });
            }}>
              Copy
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="friends">
            Friends {acceptedFriends.length > 0 && `(${acceptedFriends.length})`}
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests {pendingReceived.length > 0 && `(${pendingReceived.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or school..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Search by user ID */}
          <div className="flex gap-2">
            <Input
              placeholder="Find by name or user ID..."
              value={friendSearch}
              onChange={e => setFriendSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearchById()}
            />
            <Button variant="outline" onClick={handleSearchById}>
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2, 3].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-4"><div className="h-16 bg-muted rounded" /></CardContent></Card>)}
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No profiles found.</p>
                <p className="text-sm text-muted-foreground mt-1">Search by user ID to find private profiles!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filtered.map(p => (
                <Card key={p.user_id} className="card-interactive cursor-pointer" onClick={() => setSelectedUserId(p.user_id)}>
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
        </TabsContent>

        <TabsContent value="friends" className="space-y-4">
          {/* Cheers received */}
          {cheersReceived.length > 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-3">
                <p className="text-sm font-medium flex items-center gap-2 mb-2">
                  <PartyPopper className="w-4 h-4 text-primary" /> Recent Cheers
                </p>
                <div className="flex flex-wrap gap-2">
                  {cheersReceived.slice(0, 5).map(c => (
                    <Badge key={c.id} variant="outline">{c.message}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {acceptedFriends.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No friends yet</p>
                <p className="text-sm text-muted-foreground mt-1">Browse profiles and send friend requests!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {acceptedFriends.map(f => (
                <Card key={f.id} className="card-interactive">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Avatar className="cursor-pointer" onClick={() => setSelectedUserId(f.friend_profile?.user_id || null)}>
                      <AvatarImage src={f.friend_profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {f.friend_profile?.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedUserId(f.friend_profile?.user_id || null)}>
                      <p className="font-medium truncate">{f.friend_profile?.full_name || 'Anonymous'}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {f.friend_profile?.school_name || 'No school'}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {CHEER_OPTIONS.slice(0, 3).map(cheer => (
                        <Button key={cheer} variant="ghost" size="sm" className="text-lg p-1 h-8 w-8" onClick={() => sendCheer.mutate({ toUserId: f.friend_profile?.user_id || '', message: cheer })}>
                          {cheer.split(' ')[0]}
                        </Button>
                      ))}
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeFriend.mutate(f.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {pendingReceived.length === 0 && pendingSent.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No pending requests</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {pendingReceived.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Received</p>
                  {pendingReceived.map(f => (
                    <Card key={f.id}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {f.friend_profile?.full_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{f.friend_profile?.full_name || 'Someone'}</p>
                        </div>
                        <Button size="sm" onClick={() => acceptRequest.mutate(f.id)}>
                          <Check className="w-4 h-4 mr-1" /> Accept
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => removeFriend.mutate(f.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {pendingSent.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Sent</p>
                  {pendingSent.map(f => (
                    <Card key={f.id}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-muted">
                            {f.friend_profile?.full_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{f.friend_profile?.full_name || 'Someone'}</p>
                        </div>
                        <Badge variant="outline">Pending</Badge>
                        <Button size="sm" variant="ghost" onClick={() => removeFriend.mutate(f.id)}>
                          <X className="w-4 h-4" /> Cancel
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
