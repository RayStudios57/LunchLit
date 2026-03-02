import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award, Crown } from 'lucide-react';
import { useAchievements, ALL_BADGES_INCLUDING_MASTER, MASTER_BADGE } from '@/hooks/useAchievements';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

export function BadgesView() {
  const { unlocked, isLoading, allBadges } = useAchievements();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Card className="card-elevated animate-pulse">
          <CardHeader><div className="h-6 bg-muted rounded w-32" /></CardHeader>
          <CardContent><div className="h-40 bg-muted rounded" /></CardContent>
        </Card>
      </div>
    );
  }

  const totalBadges = ALL_BADGES_INCLUDING_MASTER;
  const unlockedCount = unlocked.length;
  const totalCount = totalBadges.length;
  const progressPct = (unlockedCount / totalCount) * 100;

  const hasMaster = unlocked.includes(MASTER_BADGE.key);

  const categories = [
    { key: 'tasks' as const, label: 'Tasks', emoji: '✅' },
    { key: 'bragsheet' as const, label: 'Brag Sheet', emoji: '📝' },
    { key: 'academic' as const, label: 'Academic', emoji: '📚' },
    { key: 'consistency' as const, label: 'Consistency', emoji: '🔥' },
    { key: 'exploration' as const, label: 'Exploration', emoji: '🧭' },
    { key: 'social' as const, label: 'Participation', emoji: '🤝' },
    { key: 'general' as const, label: 'Milestones', emoji: '🏅' },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-up">
      {/* Progress Overview */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Your Badges
          </CardTitle>
          <CardDescription>
            {unlockedCount} of {totalCount} badges unlocked
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={progressPct} className="h-3" />
          <p className="text-sm text-muted-foreground text-center">
            {hasMaster
              ? '👑 Legendary! You\'ve unlocked every badge including the Master badge!'
              : unlockedCount === totalCount - 1
                ? '🔥 So close! Unlock all badges to earn the Master badge!'
                : `${totalCount - unlockedCount} more to go!`}
          </p>
        </CardContent>
      </Card>

      {/* Master Badge - Special Display */}
      <Card className={`card-elevated ${hasMaster ? 'bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-orange-500/10 border-yellow-500/30' : 'opacity-60'}`}>
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${hasMaster ? 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg' : 'bg-secondary/50 grayscale'}`}>
              <span className="text-4xl">{MASTER_BADGE.icon}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Crown className={`w-5 h-5 ${hasMaster ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                <h3 className="font-display font-semibold text-lg">{MASTER_BADGE.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{MASTER_BADGE.description}</p>
              {hasMaster ? (
                <p className="text-xs text-yellow-600 mt-1 font-medium">✨ You are a legend!</p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">🔒 Unlock all other badges to earn this</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badge Categories */}
      <TooltipProvider>
        {categories.map(cat => {
          const catBadges = totalBadges.filter(b => b.category === cat.key && b.key !== MASTER_BADGE.key);
          if (catBadges.length === 0) return null;
          return (
            <Card key={cat.key} className="card-elevated">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base flex items-center gap-2">
                  <span>{cat.emoji}</span>
                  {cat.label}
                  <span className="text-sm font-normal text-muted-foreground ml-auto">
                    {catBadges.filter(b => unlocked.includes(b.key)).length}/{catBadges.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {catBadges.map(badge => {
                    const isUnlocked = unlocked.includes(badge.key);
                    return (
                      <Tooltip key={badge.key}>
                        <TooltipTrigger asChild>
                          <div
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all cursor-default ${
                              isUnlocked
                                ? 'bg-primary/10 ring-1 ring-primary/20 hover:ring-primary/40'
                                : 'bg-secondary/30 opacity-50 grayscale hover:opacity-70'
                            }`}
                          >
                            <span className="text-3xl">{badge.icon}</span>
                            <span className="text-[11px] font-medium text-center leading-tight line-clamp-2">
                              {badge.name}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[220px]">
                          <p className="font-medium">{badge.name}</p>
                          <p className="text-xs text-muted-foreground">{badge.description}</p>
                          {isUnlocked ? (
                            <p className="text-xs text-primary mt-1">✓ Unlocked!</p>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-1">🔒 Not yet unlocked</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </TooltipProvider>
    </div>
  );
}
