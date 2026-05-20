/**
 * History Screen — Medication Timeline
 * Vertical timeline showing medication changes over time.
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../src/theme/colors';
import { TOKENS } from '../../src/theme/tokens';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { DangerBadge } from '../../src/components/ui/DangerBadge';
import { usePatientStore } from '../../src/store/patient.store';
import type { Medication } from '../../src/api/patient.api';

// Demo timeline data
interface TimelineEntry {
  date: string;
  drugName: string;
  action: 'added' | 'removed' | 'changed';
  detail?: string;
  interactions?: number;
}

const DEMO_TIMELINE: TimelineEntry[] = [
  {
    date: '2026-05-20',
    drugName: 'Ibuprofen',
    action: 'added',
    detail: 'PRN for headache',
    interactions: 0,
  },
  {
    date: '2026-05-18',
    drugName: 'Codeine',
    action: 'added',
    detail: '30mg every 6h for back pain',
    interactions: 1,
  },
  {
    date: '2026-05-15',
    drugName: 'Fluoxetine',
    action: 'changed',
    detail: 'Dosage increased: 20mg → 40mg',
    interactions: 2,
  },
  {
    date: '2026-05-01',
    drugName: 'Omeprazole',
    action: 'removed',
    detail: 'Discontinued — no longer needed',
    interactions: 0,
  },
  {
    date: '2026-04-20',
    drugName: 'Fluoxetine',
    action: 'added',
    detail: '20mg daily for depression',
    interactions: 0,
  },
  {
    date: '2026-04-10',
    drugName: 'Atorvastatin',
    action: 'added',
    detail: '10mg daily for cholesterol',
    interactions: 0,
  },
];

const ACTION_CONFIG = {
  added: {
    color: COLORS.primary,
    label: 'ADDED',
    icon: '+',
  },
  removed: {
    color: COLORS.danger,
    label: 'REMOVED',
    icon: '−',
  },
  changed: {
    color: COLORS.warning,
    label: 'CHANGED',
    icon: '↻',
  },
};

export default function HistoryScreen() {
  const { medications, isLoadingMeds, fetchMedications } = usePatientStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchMedications();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMedications();
    setRefreshing(false);
  };

  const timeline = DEMO_TIMELINE;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: months[date.getMonth()],
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Medication Timeline</Text>
        <Text style={styles.headerSub}>
          {medications.length || 5} medications • {timeline.length} events
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {timeline.map((entry, index) => {
          const config = ACTION_CONFIG[entry.action];
          const dateInfo = formatDate(entry.date);
          const isLast = index === timeline.length - 1;

          return (
            <View key={`${entry.date}-${entry.drugName}`} style={styles.timelineRow}>
              {/* Date Column */}
              <View style={styles.dateCol}>
                <Text style={styles.dateDay}>{dateInfo.day}</Text>
                <Text style={styles.dateMonth}>{dateInfo.month}</Text>
              </View>

              {/* Timeline Line */}
              <View style={styles.lineCol}>
                <View style={[styles.dot, { backgroundColor: config.color }]}>
                  <Text style={styles.dotIcon}>{config.icon}</Text>
                </View>
                {!isLast && <View style={styles.line} />}
              </View>

              {/* Content Card */}
              <View style={styles.cardCol}>
                <GlassCard
                  variant={
                    entry.action === 'removed' ? 'danger'
                    : entry.action === 'changed' ? 'warning'
                    : 'default'
                  }
                  glowIntensity="low"
                >
                  <View style={styles.entryHeader}>
                    <Text style={[styles.actionLabel, { color: config.color }]}>
                      {config.label}
                    </Text>
                    {entry.interactions !== undefined && entry.interactions > 0 && (
                      <DangerBadge
                        severity={entry.interactions > 1 ? 'critical' : 'moderate'}
                        count={entry.interactions}
                        compact
                      />
                    )}
                  </View>
                  <Text style={styles.entryDrug}>{entry.drugName}</Text>
                  {entry.detail && (
                    <Text style={styles.entryDetail}>{entry.detail}</Text>
                  )}
                </GlassCard>
              </View>
            </View>
          );
        })}

        {/* End marker */}
        <View style={styles.endMarker}>
          <View style={styles.endDot} />
          <Text style={styles.endText}>BEGINNING OF RECORD</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.void,
  },
  header: {
    paddingHorizontal: TOKENS.spacing.lg,
    paddingTop: TOKENS.spacing.md,
    paddingBottom: TOKENS.spacing.md,
  },
  headerTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: 26,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  headerSub: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  scrollContent: {
    paddingHorizontal: TOKENS.spacing.md,
    paddingBottom: 120,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 100,
  },
  dateCol: {
    width: 44,
    alignItems: 'center',
    paddingTop: 14,
  },
  dateDay: {
    fontFamily: 'Syne_700Bold',
    fontSize: 18,
    color: COLORS.text.primary,
  },
  dateMonth: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 10,
    color: COLORS.text.muted,
    letterSpacing: 1.5,
  },
  lineCol: {
    width: 36,
    alignItems: 'center',
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    zIndex: 1,
  },
  dotIcon: {
    fontSize: 14,
    color: COLORS.bg.void,
    fontWeight: '700',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.bg.border,
    marginTop: -2,
  },
  cardCol: {
    flex: 1,
    paddingLeft: 8,
    paddingBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 10,
    letterSpacing: 2,
  },
  entryDrug: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 17,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  entryDetail: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  endMarker: {
    alignItems: 'center',
    paddingTop: 20,
    gap: 8,
  },
  endDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.bg.border,
  },
  endText: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 10,
    color: COLORS.text.muted,
    letterSpacing: 3,
  },
});
