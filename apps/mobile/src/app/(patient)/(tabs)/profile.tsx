import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useTheme } from '@/theme/ThemeContext';
import { GlowButton } from '@/components/ui/GlowButton';
import { useAuthStore } from '@/store/auth.store';
import { router } from 'expo-router';

export default function PatientProfile() {
  const { theme } = useTheme();
  const { user, signOut } = useAuthStore();

  const handleSignOut = () => {
    signOut();
    router.replace('/(auth)');
  };

  return (
    <ScreenContainer scrollable padding>
      <Text style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.typography.display }]}>Profile</Text>
      
      <View style={[styles.card, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.bgBorder }]}>
        <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono }]}>Name</Text>
        <Text style={[styles.value, { color: theme.colors.textPrimary, fontFamily: theme.typography.heading }]}>{user?.firstName || 'Ramesh'}</Text>
        
        <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono, marginTop: 16 }]}>Patient ID</Text>
        <Text style={[styles.value, { color: theme.colors.textPrimary, fontFamily: theme.typography.heading }]}>{user?.id || 'DEMO-PATIENT-001'}</Text>
      </View>

      <GlowButton
        label="Sign Out"
        onPress={handleSignOut}
        variant="destructive"
        size="md"
        fullWidth
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    marginBottom: 24,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 32,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
  },
});
