import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

// Favicon paths matching the theme logos
const faviconMap: Record<string, string> = {
  'default': '/logos/logo-default-v2.png',
  'ocean': '/logos/logo-ocean-new.png',
  'sunset': '/logos/logo-sunset-v2.png',
  'forest': '/logos/logo-forest-v2.png',
  'lavender': '/logos/logo-lavender.png',
  'midnight': '/logos/logo-midnight.png',
};

export function useThemeFavicon() {
  const { theme } = useTheme();

  useEffect(() => {
    const faviconPath = faviconMap[theme] || faviconMap['default'];
    
    // Find existing favicon link or create one
    let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    
    link.type = 'image/png';
    link.href = faviconPath;
  }, [theme]);
}
