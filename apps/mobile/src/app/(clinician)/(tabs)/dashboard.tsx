import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useTheme } from '@/theme/ThemeContext';
import { DangerBadge } from '@/components/ui/DangerBadge';
import { useAuthStore } from '@/store/auth.store';
import { GlowButton } from '@/components/ui/GlowButton';
import { router } from 'expo-router';

export default function ClinicianDashboard() {
  const { theme } = useTheme();
  const { user, signOut } = useAuthStore();

  const handleSignOut = () => {
    signOut();
    router.replace('/(auth)');
  };

  return (
    <ScreenContainer scrollable padding>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.typography.display }]}>Dashboard</Text>
        <GlowButton label="Sign Out" onPress={handleSignOut} variant="ghost" size="sm" />
      </View>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: theme.typography.body }]}>Welcome, Dr. {user?.firstName || 'Pharmacist'}</Text>

      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.bgBorder }]}>
          <Text style={[styles.statNumber, { color: theme.colors.textPrimary, fontFamily: theme.typography.mono }]}>12</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary, fontFamily: theme.typography.subhead }]}>Active Patients</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.bgBorder }]}>
          <Text style={[styles.statNumber, { color: theme.colors.dangerStrong, fontFamily: theme.typography.mono }]}>3</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary, fontFamily: theme.typography.subhead }]}>Critical Alerts</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, fontFamily: theme.typography.heading }]}>Recent Patients</Text>
      
      <View style={[styles.patientCard, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.bgBorder }]}>
        <View style={styles.patientInfo}>
          <Text style={[styles.patientName, { color: theme.colors.textPrimary, fontFamily: theme.typography.subhead }]}>Ramesh Kumar</Text>
          <Text style={[styles.patientId, { color: theme.colors.textMuted, fontFamily: theme.typography.mono }]}>DEMO-PATIENT-001</Text>
        </View>
        <DangerBadge status="critical" label="Alert" />
      </View>

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  patientCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    marginBottom: 4,
  },
  patientId: {
    fontSize: 12,
  },
});
