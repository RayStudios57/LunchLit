import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, CheckSquare, BookOpen, Trophy, Calculator, MessageCircle } from 'lucide-react';

interface QuickLinksProps {
  onNavigate: (tab: string) => void;
}

const LINKS = [
  { tab: 'tasks', icon: CheckSquare, label: 'Tasks', color: 'text-red-500' },
  { tab: 'classes', icon: BookOpen, label: 'Classes', color: 'text-green-500' },
  { tab: 'bragsheet', icon: Trophy, label: 'Brag Sheet', color: 'text-yellow-500' },
  { tab: 'portfolio', icon: Calculator, label: 'Portfolio', color: 'text-purple-500' },
  { tab: 'chat', icon: MessageCircle, label: 'AI Chat', color: 'text-pink-500' },
];

export function QuickLinks({ onNavigate }: QuickLinksProps) {
  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Quick Links
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2">
          {LINKS.map(link => (
            <button
              key={link.tab}
              onClick={() => onNavigate(link.tab)}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <link.icon className={`w-5 h-5 ${link.color}`} />
              <span className="text-[10px] font-medium text-muted-foreground">{link.label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
