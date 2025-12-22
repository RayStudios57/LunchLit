import { useTheme } from '@/contexts/ThemeContext';

interface ThemeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Logo paths for each theme
const logoMap: Record<string, string> = {
  // Cache-busted filenames for themes that were not showing reliably
  'default': '/logos/logo-default-v2.png',
  'ocean': '/logos/logo-ocean-v2.png',
  'sunset': '/logos/logo-sunset-v2.png',
  'forest': '/logos/logo-forest-v2.png',

  // Working themes (leave unchanged)
  'lavender': '/logos/logo-lavender.png',
  'midnight': '/logos/logo-midnight.png',

  // Dark mode variants
  'default-dark': '/logos/logo-default-dark.png',
  'ocean-dark': '/logos/logo-ocean-v2.png',
  'sunset-dark': '/logos/logo-sunset-v2.png',
  'forest-dark': '/logos/logo-forest-v2.png',
  'lavender-dark': '/logos/logo-lavender.png',
  'midnight-dark': '/logos/logo-midnight.png',
};

export function ThemeLogo({ className = '', size = 'md' }: ThemeLogoProps) {
  const { theme, colorMode } = useTheme();

  // Size mappings
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  // Determine if we should use dark variant
  const isDark = colorMode === 'dark' || 
    (colorMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Get logo path - try dark variant first if in dark mode
  const darkKey = `${theme}-dark`;
  const logoPath = isDark && logoMap[darkKey] ? logoMap[darkKey] : logoMap[theme] || logoMap['default'];

  return (
    <img
      src={logoPath}
      alt="LunchLit Logo"
      className={`${sizeClasses[size]} rounded-xl object-contain transition-all duration-300 ${className}`}
    />
  );
}
