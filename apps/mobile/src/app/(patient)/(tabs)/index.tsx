import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { GlowButton } from '@/components/ui/GlowButton';
import { DangerBadge } from '@/components/ui/DangerBadge';
import { useAppStore } from '@/store/app.store';
import { usePatientStore } from '@/store/patient.store';
import { DrugGraphCanvas } from '@/components/graph/DrugGraphCanvas';
import { router } from 'expo-router';

export default function PatientHomeGraph() {
  const { theme, toggleTheme } = useTheme();
  const { displayName } = useAppStore();
  const { medications, graph, alerts } = usePatientStore();

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const moderateCount = alerts.filter((a) => a.severity === 'moderate').length;
  const safeCount = Math.max(0, medications.length - criticalCount - moderateCount);

  // Derive avatar initial from display name or fallback
  const avatarInitial = (displayName || 'U')[0].toUpperCase();
  const greetingName = displayName || 'there';

  return (
    <ScreenContainer scrollable={false} padding={false} hasTabBar={true}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
          <Text style={[styles.greeting, { color: theme.colors.textPrimary, fontFamily: theme.typography.bodyMed }]}>
            Namaste, {greetingName}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={theme.colors.textPrimary}
            style={styles.icon}
            onPress={() => router.push('/(patient)/notifications')}
          />
          <Ionicons name="moon-outline" size={24} color={theme.colors.textPrimary} style={styles.icon} onPress={toggleTheme} />
        </View>
      </View>

      {/* Graph Area */}
      <View style={styles.graphContainer}>
        <DrugGraphCanvas graphData={graph} />
      </View>

      {/* Bottom Sheet Peek */}
      <View style={[styles.bottomSheetPeek, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.bgBorder }]}>
        <View style={[styles.dragHandle, { backgroundColor: theme.colors.bgBorder }]} />
        <View style={styles.chipsRow}>
          <DangerBadge status="critical" label={`${criticalCount} Critical`} />
          <DangerBadge status="moderate" label={`${moderateCount} Moderate`} />
          <DangerBadge status="safe" label={`${safeCount} Safe`} />
        </View>
      </View>

      {/* FAB */}
      <View style={styles.fabContainer}>
        <GlowButton
          label=""
          onPress={() => router.push('/(patient)/add-medication')}
          variant="primary"
          size="lg"
          icon={<Ionicons name="add" size={24} color={theme.colors.btnPrimaryText} />}
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
    paddingHorizontal: 20,
    marginTop: 10,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3D5470',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  greeting: {
    fontSize: 18,
  },
  headerRight: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 16,
  },
  graphContainer: {
    flex: 1,
    padding: 20,
    paddingBottom: 230, // leave space for bottom sheet + FAB above tab bar
  },
  bottomSheetPeek: {
    position: 'absolute',
    bottom: 80, // Sit directly above absolute tab bar (which has height 80)
    left: 0,
    right: 0,
    height: 120,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    zIndex: 100,
  },
  dragHandle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 210, // above bottom sheet (which sits at bottom 80 and is 120 tall: 80 + 120 = 200)
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    zIndex: 110,
  },
});
