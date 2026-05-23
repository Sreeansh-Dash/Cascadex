import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useTheme } from '@/theme/ThemeContext';
import { GlowButton } from '@/components/ui/GlowButton';

export default function Onboarding() {
  const { theme } = useTheme();
  return (
    <ScreenContainer padding>
      <View style={styles.container}>
        <Text style={{ color: theme.colors.textPrimary, fontFamily: theme.typography.display, fontSize: 32 }}>Welcome</Text>
        <GlowButton label="Sign In" onPress={() => router.push('/(auth)/sign-in')} variant="primary" size="lg" fullWidth />
        <GlowButton label="Create Account" onPress={() => router.push('/(auth)/sign-up/step-1-account')} variant="secondary" size="lg" fullWidth />
      </View>
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', gap: 16 } });
