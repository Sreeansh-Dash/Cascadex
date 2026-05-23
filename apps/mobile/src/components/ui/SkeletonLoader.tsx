import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

export const SkeletonLoader = ({ width = '100%', height = 20, style }: any) => {
  const { theme } = useTheme();
  return <View style={[styles.skeleton, { width, height, backgroundColor: theme.colors.bgBorder }, style]} />;
};

const styles = StyleSheet.create({
  skeleton: { borderRadius: 4, opacity: 0.5 },
});
