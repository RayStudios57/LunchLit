import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { useAchievements, BADGES } from '@/hooks/useAchievements';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function AchievementBadges() {
  const { unlocked, isLoading } = useAchievements();

  if (isLoading) return null;

  const unlockedCount = unlocked.length;

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Badges
          </div>
          <span className="text-sm font-normal text-muted-foreground">
            {unlockedCount}/{BADGES.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="grid grid-cols-4 gap-3">
            {BADGES.map(badge => {
              const isUnlocked = unlocked.includes(badge.key);
              return (
                <Tooltip key={badge.key}>
                  <TooltipTrigger asChild>
                    <div
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                        isUnlocked
                          ? 'bg-primary/10 scale-100'
                          : 'bg-secondary/30 opacity-40 grayscale'
                      }`}
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <span className="text-[10px] font-medium text-center leading-tight line-clamp-2">
                        {badge.name}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="font-medium">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    {isUnlocked && <p className="text-xs text-primary mt-1">✓ Unlocked!</p>}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
