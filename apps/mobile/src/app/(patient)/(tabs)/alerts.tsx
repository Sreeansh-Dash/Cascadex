import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useTheme } from '@/theme/ThemeContext';
import { DangerBadge } from '@/components/ui/DangerBadge';
import { usePatientStore } from '@/store/patient.store';

export default function PatientAlerts() {
  const { theme } = useTheme();
  const { alerts, medications } = usePatientStore();

  return (
    <ScreenContainer scrollable padding hasTabBar={true}>
      <Text style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.typography.display }]}>Active Alerts</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: theme.typography.body }]}>
        {alerts.length > 0 
          ? `Biochemical pathway interactions detected in your current regimen.`
          : `No drug-drug interactions detected in your metabolic network.`}
      </Text>

      {alerts.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.bgBorder }]}>
          <Text style={[styles.emptyText, { color: theme.colors.safeStrong, fontFamily: theme.typography.subhead }]}>
            ✓ All Clear
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary, fontFamily: theme.typography.body }]}>
            Your {medications.length} active medications are safe to take together based on known metabolic pathways.
          </Text>
        </View>
      ) : (
        alerts.map((alert) => {
          const isCritical = alert.severity === 'critical';
          
          return (
            <View 
              key={alert.chain_id} 
              style={[
                styles.card, 
                { 
                  backgroundColor: theme.colors.bgElevated, 
                  borderColor: isCritical ? theme.colors.dangerStrong : theme.colors.bgBorder,
                  borderWidth: isCritical ? 1.5 : 1
                }
              ]}
            >
              <View style={styles.cardHeader}>
                <DangerBadge status={alert.severity as any} label={alert.severity} />
                <Text style={[styles.pathway, { color: theme.colors.textMuted, fontFamily: theme.typography.mono }]}>
                  via {alert.via_enzyme}
                </Text>
              </View>
              <Text style={[styles.cardTitle, { color: theme.colors.textPrimary, fontFamily: theme.typography.heading }]}>
                {alert.perpetrator} + {alert.victim}
              </Text>
              <Text style={[styles.cardBody, { color: theme.colors.textSecondary, fontFamily: theme.typography.body }]}>
                {alert.consequence}
              </Text>
            </View>
          );
        })
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    marginBottom: 8,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pathway: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  }
});

