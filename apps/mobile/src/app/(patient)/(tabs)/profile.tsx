import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
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
    <ScreenContainer scrollable padding hasTabBar={true}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.typography.display }]}>Profile</Text>
      </View>
      
      <View style={[styles.card, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.bgBorder }]}>
        <View style={styles.viewDetails}>
          <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono }]}>Full Name</Text>
          <Text style={[styles.value, { color: theme.colors.textPrimary, fontFamily: theme.typography.heading }]}>
            {user?.first_name} {user?.last_name || ''}
          </Text>
          
          <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono, marginTop: 16 }]}>Patient ID</Text>
          <Text style={[styles.value, { color: theme.colors.textPrimary, fontFamily: theme.typography.heading }]}>{user?.id || 'DEMO-PATIENT-001'}</Text>

          <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono, marginTop: 16 }]}>Email Address</Text>
          <Text style={[styles.value, { color: theme.colors.textPrimary, fontFamily: theme.typography.body }]}>{user?.email}</Text>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono, marginTop: 16 }]}>Age Range</Text>
              <Text style={[styles.value, { color: theme.colors.textPrimary, fontFamily: theme.typography.body }]}>
                {user?.age_range || 'Not provided'}
              </Text>
            </View>
            
            <View style={styles.col}>
              <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono, marginTop: 16 }]}>Weight Range</Text>
              <Text style={[styles.value, { color: theme.colors.textPrimary, fontFamily: theme.typography.body }]}>
                {user?.weight_range || 'Not provided'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.signOutBtn}>
        <GlowButton
          label="Sign Out"
          onPress={handleSignOut}
          variant="destructive"
          size="md"
          fullWidth
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  title: {
    fontSize: 32,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  label: {
    fontSize: 10,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
  },
  row: {
    flexDirection: 'row',
  },
  col: {
    flex: 1,
  },
  viewDetails: {
    gap: 2,
  },
  signOutBtn: {
    marginBottom: 40,
  }
});
