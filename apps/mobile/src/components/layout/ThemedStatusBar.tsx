import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/theme/ThemeContext';

export const ThemedStatusBar = () => {
  const { theme } = useTheme();
  return <StatusBar style={theme.colors.statusBar as any} backgroundColor={theme.colors.bgPrimary} />;
};
