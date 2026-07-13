import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeId, ThemeMode, ThemeColors, getThemeColors, THEMES, ThemeDef } from '@/constants/themes';

interface ThemeContextType {
  themeId: ThemeId;
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  themes: ThemeDef[];
  setThemeId: (id: ThemeId) => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme_prefs';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const deviceScheme = useColorScheme();
  const [themeId, setThemeIdState] = useState<ThemeId>('ocean');
  const [mode, setModeState] = useState<ThemeMode>('auto');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          const prefs = JSON.parse(raw);
          if (prefs.themeId) setThemeIdState(prefs.themeId);
          if (prefs.mode) setModeState(prefs.mode);
        } catch {}
      }
    });
  }, []);

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id);
    AsyncStorage.getItem(THEME_STORAGE_KEY).then(raw => {
      const prefs = raw ? JSON.parse(raw) : {};
      AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ ...prefs, themeId: id }));
    });
  };

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.getItem(THEME_STORAGE_KEY).then(raw => {
      const prefs = raw ? JSON.parse(raw) : {};
      AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ ...prefs, mode: m }));
    });
  };

  const isDark =
    mode === 'dark' ? true :
    mode === 'light' ? false :
    deviceScheme === 'dark';

  const colors = getThemeColors(themeId, isDark);

  return (
    <ThemeContext.Provider value={{ themeId, mode, isDark, colors, themes: THEMES, setThemeId, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
