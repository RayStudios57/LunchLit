import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { useAchievements, BADGES } from '@/hooks/useAchievements';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

export function BadgesView() {
  const { unlocked, isLoading } = useAchievements();

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

  const unlockedCount = unlocked.length;
  const totalCount = BADGES.length;
  const progressPct = (unlockedCount / totalCount) * 100;

  const categories = [
    { key: 'tasks' as const, label: 'Tasks', emoji: '✅' },
    { key: 'bragsheet' as const, label: 'Brag Sheet', emoji: '📝' },
    { key: 'general' as const, label: 'General', emoji: '🏅' },
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
            {unlockedCount === totalCount 
              ? '🎉 Congratulations! You\'ve unlocked all badges!' 
              : `${totalCount - unlockedCount} more to go!`}
          </p>
        </CardContent>
      </Card>

      {/* Badge Categories */}
      <TooltipProvider>
        {categories.map(cat => {
          const catBadges = BADGES.filter(b => b.category === cat.key);
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
                                ? 'bg-primary/10 ring-1 ring-primary/20'
                                : 'bg-secondary/30 opacity-50 grayscale'
                            }`}
                          >
                            <span className="text-3xl">{badge.icon}</span>
                            <span className="text-[11px] font-medium text-center leading-tight line-clamp-2">
                              {badge.name}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px]">
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
