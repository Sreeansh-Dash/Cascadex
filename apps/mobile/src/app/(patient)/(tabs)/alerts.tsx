import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useTheme } from '@/theme/ThemeContext';
import { DangerBadge } from '@/components/ui/DangerBadge';

export default function PatientAlerts() {
  const { theme } = useTheme();

  return (
    <ScreenContainer scrollable padding>
      <Text style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.typography.display }]}>Active Alerts</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: theme.typography.body }]}>Critical drug interactions requiring your attention.</Text>

      <View style={[styles.card, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.bgBorder }]}>
        <View style={styles.cardHeader}>
          <DangerBadge status="critical" label="Critical" />
          <Text style={[styles.time, { color: theme.colors.textMuted }]}>2h ago</Text>
        </View>
        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary, fontFamily: theme.typography.heading }]}>Aspirin + Warfarin</Text>
        <Text style={[styles.cardBody, { color: theme.colors.textSecondary, fontFamily: theme.typography.body }]}>
          High risk of bleeding detected. Both medications inhibit platelet aggregation and blood clotting mechanisms.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.bgBorder }]}>
        <View style={styles.cardHeader}>
          <DangerBadge status="moderate" label="Moderate" />
          <Text style={[styles.time, { color: theme.colors.textMuted }]}>1d ago</Text>
        </View>
        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary, fontFamily: theme.typography.heading }]}>Lisinopril + Ibuprofen</Text>
        <Text style={[styles.cardBody, { color: theme.colors.textSecondary, fontFamily: theme.typography.body }]}>
          Potential reduction in antihypertensive effect and risk of renal impairment.
        </Text>
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
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  time: {
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 20,
  },
});
