import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { storage } from '@/store/storage';
import { BiopunkTheme } from './BiopunkTheme';
import { PastelTheme } from './PastelTheme';

type ThemeMode = 'biopunk' | 'pastel';
type Theme = typeof BiopunkTheme;

interface ThemeContextType {
  mode: ThemeMode;
  theme: Theme;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'biopunk',
  theme: BiopunkTheme,
  setMode: () => {},
  toggleTheme: () => {},
});

const THEME_STORAGE_KEY = 'cascadex_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = storage.getString(THEME_STORAGE_KEY);
    if (saved === 'biopunk' || saved === 'pastel') return saved as ThemeMode;
    return systemColorScheme === 'dark' ? 'biopunk' : 'pastel';
  });

  const setMode = (newMode: ThemeMode) => {
    storage.set(THEME_STORAGE_KEY, newMode);
    setModeState(newMode);
  };

  const toggleTheme = () => {
    setMode(mode === 'biopunk' ? 'pastel' : 'biopunk');
  };

  const theme = mode === 'biopunk' ? BiopunkTheme : PastelTheme;

  return (
    <ThemeContext.Provider value={{ mode, theme, setMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
