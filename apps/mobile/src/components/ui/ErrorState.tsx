import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';
import { GlowButton } from '@/components/ui/GlowButton';

export const ErrorState = ({ message, onRetry }: { message: string, onRetry?: () => void }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <Ionicons name="warning-outline" size={48} color={theme.colors.dangerStrong} />
      <Text style={[styles.message, { color: theme.colors.textPrimary, fontFamily: theme.typography.body }]}>{message}</Text>
      {onRetry && <GlowButton label="Retry" variant="secondary" size="md" onPress={onRetry} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  message: { fontSize: 16, marginTop: 16, marginBottom: 24, textAlign: 'center' },
});
