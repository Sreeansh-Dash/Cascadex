import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

export const SectionHeader = ({ title }: { title: string }) => {
  const { theme } = useTheme();
  return <Text style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.typography.heading }]}>{title}</Text>;
};

const styles = StyleSheet.create({
  title: { fontSize: 20, marginBottom: 12, marginTop: 24 },
});
