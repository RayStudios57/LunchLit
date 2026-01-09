import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export type ThemeName = 'default' | 'ocean' | 'sunset' | 'forest' | 'lavender' | 'midnight';
export type ColorMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeName;
  colorMode: ColorMode;
  setTheme: (theme: ThemeName) => void;
  setColorMode: (mode: ColorMode) => void;
  themes: { id: ThemeName; name: string; colors: { primary: string; accent: string } }[];
}

interface ThemeColors {
  primary: string;
  accent: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
}

const themes: ThemeContextType['themes'] = [
  { id: 'default', name: 'Emerald', colors: { primary: '160 60% 40%', accent: '35 90% 55%' } },
  { id: 'ocean', name: 'Ocean', colors: { primary: '200 80% 50%', accent: '180 70% 45%' } },
  { id: 'sunset', name: 'Sunset', colors: { primary: '20 80% 55%', accent: '350 75% 55%' } },
  { id: 'forest', name: 'Forest', colors: { primary: '140 50% 35%', accent: '80 60% 45%' } },
  { id: 'lavender', name: 'Lavender', colors: { primary: '270 60% 60%', accent: '300 50% 55%' } },
  { id: 'midnight', name: 'Midnight', colors: { primary: '230 70% 55%', accent: '260 60% 60%' } },
];

// Theme-specific color schemes for light and dark modes
const themeColorSchemes: Record<ThemeName, { light: ThemeColors; dark: ThemeColors }> = {
  default: {
    light: {
      primary: '160 60% 40%',
      accent: '35 90% 55%',
      background: '45 20% 97%',
      foreground: '160 30% 10%',
      card: '0 0% 100%',
      cardForeground: '160 30% 10%',
      muted: '45 20% 94%',
      mutedForeground: '160 15% 45%',
      border: '160 15% 88%',
    },
    dark: {
      primary: '160 55% 50%',
      accent: '35 85% 55%',
      background: '160 20% 8%',
      foreground: '45 20% 95%',
      card: '160 20% 12%',
      cardForeground: '45 20% 95%',
      muted: '160 15% 20%',
      mutedForeground: '160 10% 60%',
      border: '160 15% 22%',
    },
  },
  ocean: {
    light: {
      primary: '200 80% 50%',
      accent: '180 70% 45%',
      background: '200 30% 97%',
      foreground: '200 40% 10%',
      card: '0 0% 100%',
      cardForeground: '200 40% 10%',
      muted: '200 20% 94%',
      mutedForeground: '200 15% 45%',
      border: '200 20% 88%',
    },
    dark: {
      primary: '200 75% 55%',
      accent: '180 65% 50%',
      background: '200 30% 8%',
      foreground: '200 20% 95%',
      card: '200 25% 12%',
      cardForeground: '200 20% 95%',
      muted: '200 20% 18%',
      mutedForeground: '200 15% 60%',
      border: '200 20% 22%',
    },
  },
  sunset: {
    light: {
      primary: '20 80% 55%',
      accent: '350 75% 55%',
      background: '30 30% 97%',
      foreground: '20 40% 10%',
      card: '0 0% 100%',
      cardForeground: '20 40% 10%',
      muted: '30 25% 94%',
      mutedForeground: '20 15% 45%',
      border: '30 20% 88%',
    },
    dark: {
      primary: '20 75% 55%',
      accent: '350 70% 55%',
      background: '20 25% 8%',
      foreground: '30 25% 95%',
      card: '20 20% 12%',
      cardForeground: '30 25% 95%',
      muted: '20 15% 18%',
      mutedForeground: '20 10% 60%',
      border: '20 15% 22%',
    },
  },
  forest: {
    light: {
      primary: '140 50% 35%',
      accent: '80 60% 45%',
      background: '80 20% 97%',
      foreground: '140 35% 10%',
      card: '0 0% 100%',
      cardForeground: '140 35% 10%',
      muted: '80 15% 94%',
      mutedForeground: '140 15% 45%',
      border: '80 15% 88%',
    },
    dark: {
      primary: '140 45% 45%',
      accent: '80 55% 50%',
      background: '140 25% 8%',
      foreground: '80 20% 95%',
      card: '140 20% 12%',
      cardForeground: '80 20% 95%',
      muted: '140 15% 18%',
      mutedForeground: '140 10% 60%',
      border: '140 15% 22%',
    },
  },
  lavender: {
    light: {
      primary: '270 60% 60%',
      accent: '300 50% 55%',
      background: '270 25% 97%',
      foreground: '270 35% 10%',
      card: '0 0% 100%',
      cardForeground: '270 35% 10%',
      muted: '270 20% 94%',
      mutedForeground: '270 15% 45%',
      border: '270 15% 88%',
    },
    dark: {
      primary: '270 55% 65%',
      accent: '300 45% 60%',
      background: '270 25% 8%',
      foreground: '270 20% 95%',
      card: '270 20% 12%',
      cardForeground: '270 20% 95%',
      muted: '270 15% 18%',
      mutedForeground: '270 10% 60%',
      border: '270 15% 22%',
    },
  },
  midnight: {
    light: {
      primary: '230 70% 55%',
      accent: '260 60% 60%',
      background: '230 25% 97%',
      foreground: '230 35% 10%',
      card: '0 0% 100%',
      cardForeground: '230 35% 10%',
      muted: '230 20% 94%',
      mutedForeground: '230 15% 45%',
      border: '230 15% 88%',
    },
    dark: {
      primary: '230 65% 60%',
      accent: '260 55% 65%',
      background: '230 30% 6%',
      foreground: '230 20% 95%',
      card: '230 25% 10%',
      cardForeground: '230 20% 95%',
      muted: '230 20% 15%',
      mutedForeground: '230 15% 60%',
      border: '230 20% 20%',
    },
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<ThemeName>('midnight');
  const [colorMode, setColorModeState] = useState<ColorMode>('light');

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeName;
    const savedColorMode = localStorage.getItem('colorMode') as ColorMode;
    
    if (savedTheme && themes.some(t => t.id === savedTheme)) {
      setThemeState(savedTheme);
    }
    if (savedColorMode) {
      setColorModeState(savedColorMode);
    }
  }, []);

  // Load preferences from database when user logs in
  useEffect(() => {
    if (user) {
      supabase
        .from('user_preferences')
        .select('theme, color_mode')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            if (data.theme) setThemeState(data.theme as ThemeName);
            if (data.color_mode) setColorModeState(data.color_mode as ColorMode);
          }
        });
    }
  }, [user]);

  // Determine actual color mode (resolving 'system')
  const getResolvedColorMode = (): 'light' | 'dark' => {
    if (colorMode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return colorMode;
  };

  // Apply all theme colors to CSS variables
  useEffect(() => {
    const applyThemeColors = () => {
      const mode = getResolvedColorMode();
      const colors = themeColorSchemes[theme][mode];
      
      document.documentElement.style.setProperty('--primary', colors.primary);
      document.documentElement.style.setProperty('--accent', colors.accent);
      document.documentElement.style.setProperty('--background', colors.background);
      document.documentElement.style.setProperty('--foreground', colors.foreground);
      document.documentElement.style.setProperty('--card', colors.card);
      document.documentElement.style.setProperty('--card-foreground', colors.cardForeground);
      document.documentElement.style.setProperty('--popover', colors.card);
      document.documentElement.style.setProperty('--popover-foreground', colors.cardForeground);
      document.documentElement.style.setProperty('--muted', colors.muted);
      document.documentElement.style.setProperty('--muted-foreground', colors.mutedForeground);
      document.documentElement.style.setProperty('--border', colors.border);
      document.documentElement.style.setProperty('--input', colors.border);
      document.documentElement.style.setProperty('--ring', colors.primary);
      document.documentElement.style.setProperty('--secondary', colors.muted);
      document.documentElement.style.setProperty('--secondary-foreground', colors.foreground);
      
      // Update gradient
      const [h, s, l] = colors.primary.split(' ');
      document.documentElement.style.setProperty(
        '--gradient-hero', 
        `linear-gradient(135deg, hsl(${h}, ${s}, ${l}) 0%, hsl(${h}, ${parseInt(s) + 10}%, ${parseInt(l) - 10}%) 100%)`
      );
    };

    applyThemeColors();

    // Re-apply when system preference changes (only matters if colorMode is 'system')
    if (colorMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyThemeColors();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme, colorMode]);

  // Apply color mode
  useEffect(() => {
    const applyMode = (mode: 'light' | 'dark') => {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(mode);
    };

    if (colorMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyMode(mediaQuery.matches ? 'dark' : 'light');
      
      const handler = (e: MediaQueryListEvent) => applyMode(e.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyMode(colorMode);
    }
  }, [colorMode]);

  const setTheme = async (newTheme: ThemeName) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (user) {
      await supabase
        .from('user_preferences')
        .upsert({ user_id: user.id, theme: newTheme }, { onConflict: 'user_id' });
    }
  };

  const setColorMode = async (mode: ColorMode) => {
    setColorModeState(mode);
    localStorage.setItem('colorMode', mode);
    
    if (user) {
      await supabase
        .from('user_preferences')
        .upsert({ user_id: user.id, color_mode: mode }, { onConflict: 'user_id' });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, colorMode, setTheme, setColorMode, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
