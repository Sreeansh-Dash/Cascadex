import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useTheme } from '@/theme/ThemeContext';

export default function Splash() {
  const { theme } = useTheme();

  useEffect(() => {
    setTimeout(() => { router.replace('/(auth)/onboarding'); }, 2000);
  }, []);

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={{ color: theme.colors.accent, fontFamily: theme.typography.display, fontSize: 48 }}>Cascadex</Text>
      </View>
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center' } });
