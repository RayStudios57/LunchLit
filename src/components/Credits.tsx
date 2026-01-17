import { Card, CardContent } from '@/components/ui/card';
import { Heart, Code } from 'lucide-react';

export function Credits() {
  return (
    <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
      <CardContent className="py-4">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Made with</span>
          <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
          <span>by</span>
        </div>
        <div className="text-center mt-2">
          <p className="font-semibold text-foreground">Ramakrishna Krishna</p>
        </div>
        <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
          <Code className="h-3 w-3" />
          <span>LunchLit © {new Date().getFullYear()}</span>
        </div>
      </CardContent>
    </Card>
  );
}