import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Trophy, Target, BookOpen, MessageSquare, CheckSquare, Loader2, GraduationCap } from 'lucide-react';

interface UserActivityProps {
  userId: string;
  userName: string;
  onBack: () => void;
}

export function AdminUserActivity({ userId, userName, onBack }: UserActivityProps) {
  const { data: bragEntries = [], isLoading: loadingBrag } = useQuery({
    queryKey: ['admin-user-brag', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brag_sheet_entries')
        .select('id, title, category, hours_spent, verification_status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: goals = [], isLoading: loadingGoals } = useQuery({
    queryKey: ['admin-user-goals', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_goals')
        .select('id, title, status, goal_type, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['admin-user-tasks', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, is_completed, priority, due_date, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: discussions = [], isLoading: loadingDiscussions } = useQuery({
    queryKey: ['admin-user-discussions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discussions')
        .select('id, title, content, created_at')
        .eq('user_id', userId)
        .is('parent_id', null)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: academics } = useQuery({
    queryKey: ['admin-user-academics', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brag_sheet_academics')
        .select('gpa_weighted, gpa_unweighted')
        .eq('user_id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const isLoading = loadingBrag || loadingGoals || loadingTasks || loadingDiscussions;

  const completedTasks = tasks.filter(t => t.is_completed).length;
  const totalHours = bragEntries.reduce((s: number, e: any) => s + (e.hours_spent || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">{userName}'s Activity</h2>
          <p className="text-sm text-muted-foreground">View what this user has done on LunchLit</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card>
              <CardContent className="pt-4 text-center">
                <Trophy className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{bragEntries.length}</p>
                <p className="text-xs text-muted-foreground">Achievements</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <Target className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{goals.length}</p>
                <p className="text-xs text-muted-foreground">Goals</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <CheckSquare className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{completedTasks}/{tasks.length}</p>
                <p className="text-xs text-muted-foreground">Tasks Done</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <MessageSquare className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{discussions.length}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <GraduationCap className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{academics?.gpa_weighted?.toFixed(2) || '—'}</p>
                <p className="text-xs text-muted-foreground">GPA</p>
              </CardContent>
            </Card>
          </div>

          {/* Brag Sheet */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Brag Sheet ({bragEntries.length} entries, {totalHours} hours)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bragEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No entries yet.</p>
              ) : (
                <div className="space-y-2">
                  {bragEntries.map((entry: any) => (
                    <div key={entry.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <div>
                        <p className="font-medium text-sm">{entry.title}</p>
                        <div className="flex gap-2 mt-0.5">
                          <Badge variant="outline" className="text-xs">{entry.category}</Badge>
                          {entry.hours_spent && <span className="text-xs text-muted-foreground">{entry.hours_spent}h</span>}
                        </div>
                      </div>
                      <Badge variant={entry.verification_status === 'verified' ? 'default' : 'secondary'} className="text-xs">
                        {entry.verification_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4" />
                Goals ({goals.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {goals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No goals set.</p>
              ) : (
                <div className="space-y-2">
                  {goals.map((goal: any) => (
                    <div key={goal.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <p className="font-medium text-sm">{goal.title}</p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">{goal.goal_type}</Badge>
                        <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'} className="text-xs">{goal.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Posts */}
          {discussions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Recent Posts ({discussions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {discussions.map((d: any) => (
                    <div key={d.id} className="p-2 rounded bg-muted/50">
                      <p className="font-medium text-sm">{d.title || 'Reply'}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{d.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
