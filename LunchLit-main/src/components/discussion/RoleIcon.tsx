import { 
  Shield, Crown, Star, Sparkles, Users, GraduationCap, 
  Briefcase, Heart, Zap, Award, Settings, BookOpen, User
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ICON_MAP: Record<string, any> = {
  shield: Shield,
  crown: Crown,
  star: Star,
  sparkles: Sparkles,
  users: Users,
  'graduation-cap': GraduationCap,
  briefcase: Briefcase,
  heart: Heart,
  zap: Zap,
  award: Award,
  settings: Settings,
  'book-open': BookOpen,
  user: User,
};

interface RoleIconProps {
  icon: string;
  color: string;
  roleName: string;
  size?: 'sm' | 'md' | 'lg';
}

export function RoleIcon({ icon, color, roleName, size = 'sm' }: RoleIconProps) {
  const IconComponent = ICON_MAP[icon] || Shield;
  
  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className="inline-flex items-center justify-center rounded-full p-1"
            style={{ backgroundColor: color + '20' }}
          >
            <IconComponent 
              className={sizeClasses[size]} 
              style={{ color }} 
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="capitalize">{roleName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
