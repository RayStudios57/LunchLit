import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, Loader2, Search, GraduationCap, Eye, Trash2, Copy, Shield, Globe, Lock, UserPlus, UserX, CheckSquare, Trophy, MessageSquare } from 'lucide-react';
import { AdminUserActivity } from './AdminUserActivity';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  school_name: string | null;
  grade_level: string | null;
  is_graduated: boolean;
  is_public: boolean | null;
  allow_friend_requests: boolean | null;
  created_at: string;
}

interface UserStats {
  tasks_total: number;
  tasks_completed: number;
  achievements_count: number;
  friends_count: number;
  discussions_count: number;
  roles: string[];
}

export function AdminProfiles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingUser, setViewingUser] = useState<{ id: string; name: string } | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  // Fetch aggregated stats for all users
  const { data: userStatsMap = {} } = useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: async () => {
      const [tasksRes, achievementsRes, friendsRes, discussionsRes, rolesRes] = await Promise.all([
        supabase.from('tasks').select('user_id, is_completed'),
        supabase.from('user_achievements').select('user_id'),
        supabase.from('friends').select('user_id, friend_user_id, status').eq('status', 'accepted'),
        supabase.from('discussions').select('user_id').is('parent_id', null),
        supabase.from('user_roles').select('user_id, role'),
      ]);

      const stats: Record<string, UserStats> = {};
      const ensure = (uid: string) => {
        if (!stats[uid]) stats[uid] = { tasks_total: 0, tasks_completed: 0, achievements_count: 0, friends_count: 0, discussions_count: 0, roles: [] };
      };

      tasksRes.data?.forEach((t: any) => {
        ensure(t.user_id);
        stats[t.user_id].tasks_total++;
        if (t.is_completed) stats[t.user_id].tasks_completed++;
      });

      achievementsRes.data?.forEach((a: any) => {
        ensure(a.user_id);
        stats[a.user_id].achievements_count++;
      });

      friendsRes.data?.forEach((f: any) => {
        ensure(f.user_id);
        stats[f.user_id].friends_count++;
        ensure(f.friend_user_id);
        stats[f.friend_user_id].friends_count++;
      });

      discussionsRes.data?.forEach((d: any) => {
        ensure(d.user_id);
        stats[d.user_id].discussions_count++;
      });

      rolesRes.data?.forEach((r: any) => {
        ensure(r.user_id);
        if (!stats[r.user_id].roles.includes(r.role)) {
          stats[r.user_id].roles.push(r.role);
        }
      });

      return stats;
    },
  });

  // Track online presence
  useEffect(() => {
    const channel = supabase.channel('admin-presence-tracker', {
      config: { presence: { key: 'admin-tracker' } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const online = new Set<string>();
        Object.values(state).forEach((presences: any) => {
          presences.forEach((p: any) => {
            if (p.user_id) online.add(p.user_id);
          });
        });
        setOnlineUsers(online);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredProfiles = profiles.filter(profile => {
    const searchLower = searchTerm.toLowerCase();
    return (
      profile.full_name?.toLowerCase().includes(searchLower) ||
      profile.school_name?.toLowerCase().includes(searchLower) ||
      profile.grade_level?.toLowerCase().includes(searchLower) ||
      profile.user_id.toLowerCase().includes(searchLower)
    );
  });

  const gradeLabels: Record<string, string> = {
    freshman: '9th',
    sophomore: '10th',
    junior: '11th',
    senior: '12th',
  };

  const roleBadgeVariants: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
    admin: 'destructive',
    teacher: 'default',
    counselor: 'default',
    student: 'secondary',
  };

  const handleDeleteAccount = async (userId: string) => {
    setDeletingUserId(userId);
    try {
      const { data, error } = await supabase.functions.invoke('admin-delete-account', {
        body: { targetUserId: userId },
      });
      if (error) throw error;
      toast({ title: 'Account deleted', description: 'The user account has been permanently deleted.' });
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
    } catch (err: any) {
      toast({ title: 'Error deleting account', description: err.message, variant: 'destructive' });
    } finally {
      setDeletingUserId(null);
    }
  };

  const copyFriendCode = (userId: string) => {
    navigator.clipboard.writeText(userId);
    toast({ title: 'Copied!', description: 'Friend code copied to clipboard.' });
  };

  if (viewingUser) {
    return (
      <Card>
        <CardContent className="pt-6">
          <AdminUserActivity
            userId={viewingUser.id}
            userName={viewingUser.name}
            onBack={() => setViewingUser(null)}
          />
        </CardContent>
      </Card>
    );
  }

  const totalOnline = profiles.filter(p => onlineUsers.has(p.user_id)).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          All User Profiles
        </CardTitle>
        <CardDescription className="flex items-center gap-4">
          <span>{profiles.length} total users</span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            {totalOnline} online now
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, school, grade, or friend code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No profiles found.</p>
          </div>
        ) : (
          <TooltipProvider>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {filteredProfiles.length} user{filteredProfiles.length !== 1 ? 's' : ''} found
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Friend Code</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Privacy</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.map((profile) => {
                    const isOnline = onlineUsers.has(profile.user_id);
                    const stats = (userStatsMap as Record<string, UserStats>)[profile.user_id];

                    return (
                      <TableRow key={profile.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={profile.avatar_url || undefined} />
                                <AvatarFallback>
                                  {profile.full_name?.charAt(0) || '?'}
                                </AvatarFallback>
                              </Avatar>
                              {isOnline && (
                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{profile.full_name || 'Anonymous'}</p>
                              <div className="flex items-center gap-1">
                                {profile.grade_level ? (
                                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                                    <GraduationCap className="h-2.5 w-2.5 mr-0.5" />
                                    {gradeLabels[profile.grade_level] || profile.grade_level}
                                  </Badge>
                                ) : null}
                                {profile.is_graduated && (
                                  <Badge variant="outline" className="text-[10px] px-1 py-0 text-green-600 border-green-600">
                                    Grad
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={isOnline ? 'default' : 'secondary'} className={`text-xs ${isOnline ? 'bg-green-600 hover:bg-green-700' : ''}`}>
                            {isOnline ? 'Online' : 'Offline'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="font-mono text-xs h-7 px-2"
                                onClick={() => copyFriendCode(profile.user_id)}
                              >
                                {profile.user_id.slice(0, 8)}...
                                <Copy className="h-3 w-3 ml-1" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-mono text-xs">{profile.user_id}</p>
                              <p className="text-xs text-muted-foreground">Click to copy</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-0.5">
                            {stats?.roles?.length ? stats.roles.map(role => (
                              <Badge key={role} variant={roleBadgeVariants[role] || 'outline'} className="text-[10px] px-1 py-0">
                                {role}
                              </Badge>
                            )) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Tooltip>
                              <TooltipTrigger className="flex items-center gap-0.5">
                                <CheckSquare className="h-3 w-3" />
                                <span>{stats?.tasks_completed || 0}/{stats?.tasks_total || 0}</span>
                              </TooltipTrigger>
                              <TooltipContent>Tasks completed / total</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger className="flex items-center gap-0.5">
                                <Trophy className="h-3 w-3" />
                                <span>{stats?.achievements_count || 0}</span>
                              </TooltipTrigger>
                              <TooltipContent>Badges earned</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger className="flex items-center gap-0.5">
                                <Users className="h-3 w-3" />
                                <span>{stats?.friends_count || 0}</span>
                              </TooltipTrigger>
                              <TooltipContent>Friends</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger className="flex items-center gap-0.5">
                                <MessageSquare className="h-3 w-3" />
                                <span>{stats?.discussions_count || 0}</span>
                              </TooltipTrigger>
                              <TooltipContent>Discussion posts</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger>
                                {profile.is_public ? (
                                  <Globe className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Lock className="h-4 w-4 text-muted-foreground" />
                                )}
                              </TooltipTrigger>
                              <TooltipContent>{profile.is_public ? 'Public profile' : 'Private profile'}</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger>
                                {profile.allow_friend_requests !== false ? (
                                  <UserPlus className="h-4 w-4 text-blue-500" />
                                ) : (
                                  <UserX className="h-4 w-4 text-muted-foreground" />
                                )}
                              </TooltipTrigger>
                              <TooltipContent>
                                {profile.allow_friend_requests !== false ? 'Accepting friend requests' : 'Not accepting friend requests'}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setViewingUser({ id: profile.user_id, name: profile.full_name || 'Anonymous' })}
                              title="View user activity"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title="Delete account"
                                  disabled={deletingUserId === profile.user_id}
                                >
                                  {deletingUserId === profile.user_id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete this account?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete {profile.full_name || 'this user'}'s account and all their data. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => handleDeleteAccount(profile.user_id)}
                                  >
                                    Delete Account
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}
