import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { GlowButton } from '@/components/ui/GlowButton';
import { DangerBadge } from '@/components/ui/DangerBadge';

export default function PatientHomeGraph() {
  const { theme, toggleTheme } = useTheme();

  return (
    <ScreenContainer scrollable={false} padding={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>R</Text>
          </View>
          <Text style={[styles.greeting, { color: theme.colors.textPrimary, fontFamily: theme.typography.bodyMed }]}>
            Namaste, Ramesh
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Ionicons name="notifications-outline" size={24} color={theme.colors.textPrimary} style={styles.icon} />
          <Ionicons name="moon-outline" size={24} color={theme.colors.textPrimary} style={styles.icon} onPress={toggleTheme} />
        </View>
      </View>

      {/* Graph Area (Placeholder for Skia) */}
      <View style={styles.graphContainer}>
        <View style={[styles.graphPlaceholder, { borderColor: theme.colors.accent, backgroundColor: theme.colors.accentSurface }]}>
          <Ionicons name="git-network-outline" size={64} color={theme.colors.accent} />
          <Text style={[styles.graphPlaceholderText, { color: theme.colors.textPrimary, fontFamily: theme.typography.mono }]}>
            Skia Canvas Placeholder
          </Text>
        </View>
      </View>

      {/* Bottom Sheet Peek */}
      <View style={[styles.bottomSheetPeek, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.bgBorder }]}>
        <View style={[styles.dragHandle, { backgroundColor: theme.colors.bgBorder }]} />
        <View style={styles.chipsRow}>
          <DangerBadge status="critical" label="2 Critical" />
          <DangerBadge status="moderate" label="1 Moderate" />
          <DangerBadge status="safe" label="4 Safe" />
        </View>
      </View>

      {/* FAB */}
      <View style={styles.fabContainer}>
        <GlowButton
          label=""
          onPress={() => {}}
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
    paddingBottom: 100, // leave space for bottom sheet
  },
  graphPlaceholder: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  graphPlaceholderText: {
    marginTop: 16,
    fontSize: 14,
  },
  bottomSheetPeek: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
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
    bottom: 140, // above bottom sheet
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
});
