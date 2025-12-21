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

const themes: ThemeContextType['themes'] = [
  { id: 'default', name: 'Emerald', colors: { primary: '160 60% 40%', accent: '35 90% 55%' } },
  { id: 'ocean', name: 'Ocean', colors: { primary: '200 80% 50%', accent: '180 70% 45%' } },
  { id: 'sunset', name: 'Sunset', colors: { primary: '20 80% 55%', accent: '350 75% 55%' } },
  { id: 'forest', name: 'Forest', colors: { primary: '140 50% 35%', accent: '80 60% 45%' } },
  { id: 'lavender', name: 'Lavender', colors: { primary: '270 60% 60%', accent: '300 50% 55%' } },
  { id: 'midnight', name: 'Midnight', colors: { primary: '230 70% 55%', accent: '260 60% 60%' } },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<ThemeName>('default');
  const [colorMode, setColorModeState] = useState<ColorMode>('system');

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

  // Apply theme colors to CSS variables
  useEffect(() => {
    const themeConfig = themes.find(t => t.id === theme) || themes[0];
    document.documentElement.style.setProperty('--primary', themeConfig.colors.primary);
    document.documentElement.style.setProperty('--ring', themeConfig.colors.primary);
    document.documentElement.style.setProperty('--accent', themeConfig.colors.accent);
    
    // Update gradient
    const [h, s, l] = themeConfig.colors.primary.split(' ');
    document.documentElement.style.setProperty(
      '--gradient-hero', 
      `linear-gradient(135deg, hsl(${h}, ${s}, ${l}) 0%, hsl(${h}, ${parseInt(s) + 10}%, ${parseInt(l) - 10}%) 100%)`
    );
  }, [theme]);

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
