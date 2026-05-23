import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useTheme } from '@/theme/ThemeContext';
import { DangerBadge } from '@/components/ui/DangerBadge';

export default function ClinicianAlertsBoard() {
  const { theme } = useTheme();

  return (
    <ScreenContainer scrollable padding>
      <Text style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.typography.display }]}>Global Alerts</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: theme.typography.body }]}>Critical interactions across your patient cohort.</Text>

      <View style={[styles.alertCard, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.dangerStrong }]}>
        <View style={styles.alertHeader}>
          <Text style={[styles.patientName, { color: theme.colors.textPrimary, fontFamily: theme.typography.subhead }]}>Ramesh Kumar</Text>
          <DangerBadge status="critical" label="Critical" />
        </View>
        <Text style={[styles.drugInfo, { color: theme.colors.textSecondary, fontFamily: theme.typography.body }]}>Aspirin + Warfarin</Text>
        <Text style={[styles.alertTime, { color: theme.colors.textMuted, fontFamily: theme.typography.mono }]}>Detected 2h ago</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  alertCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  patientName: {
    fontSize: 18,
  },
  drugInfo: {
    fontSize: 16,
    marginBottom: 12,
  },
  alertTime: {
    fontSize: 12,
  },
});
