import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';

export const EmptyState = ({ title, message, icon }: { title: string, message: string, icon: keyof typeof Ionicons.glyphMap }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={theme.colors.textMuted} />
      <Text style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.typography.heading }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.colors.textSecondary, fontFamily: theme.typography.body }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  title: { fontSize: 20, marginTop: 16, marginBottom: 8, textAlign: 'center' },
  message: { fontSize: 14, textAlign: 'center' },
});
