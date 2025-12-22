import { useTheme } from '@/contexts/ThemeContext';

interface ThemeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ThemeLogo({ className = '', size = 'md' }: ThemeLogoProps) {
  const { theme, colorMode } = useTheme();

  // Size mappings
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-xl',
    lg: 'w-14 h-14 text-2xl',
  };

  // Get icon and gradient based on theme
  const getThemeStyles = () => {
    switch (theme) {
      case 'ocean':
        return {
          icon: '🌊',
          gradient: 'from-[hsl(200,80%,50%)] to-[hsl(180,70%,45%)]',
        };
      case 'sunset':
        return {
          icon: '🌅',
          gradient: 'from-[hsl(20,80%,55%)] to-[hsl(350,75%,55%)]',
        };
      case 'forest':
        return {
          icon: '🌲',
          gradient: 'from-[hsl(140,50%,35%)] to-[hsl(80,60%,45%)]',
        };
      case 'lavender':
        return {
          icon: '💜',
          gradient: 'from-[hsl(270,60%,60%)] to-[hsl(300,50%,55%)]',
        };
      case 'midnight':
        return {
          icon: '🌙',
          gradient: 'from-[hsl(230,70%,55%)] to-[hsl(260,60%,60%)]',
        };
      default: // 'default' emerald theme
        return {
          icon: '🍴',
          gradient: 'from-primary to-accent',
        };
    }
  };

  const { icon, gradient } = getThemeStyles();

  return (
    <div
      className={`rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-glow transition-all duration-300 ${sizeClasses[size]} ${className}`}
    >
      <span>{icon}</span>
    </div>
  );
}
