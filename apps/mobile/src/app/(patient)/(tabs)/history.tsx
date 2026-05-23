import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useTheme } from '@/theme/ThemeContext';

export default function PatientHistory() {
  const { theme } = useTheme();

  return (
    <ScreenContainer scrollable padding>
      <Text style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.typography.display }]}>Medical History</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: theme.typography.body }]}>Your past medications and interaction logs.</Text>

      <View style={styles.timeline}>
        <View style={styles.timelineItem}>
          <View style={[styles.dot, { backgroundColor: theme.colors.safeStrong }]} />
          <View style={[styles.timelineContent, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.bgBorder }]}>
            <Text style={[styles.itemTitle, { color: theme.colors.textPrimary, fontFamily: theme.typography.subhead }]}>Started Metformin</Text>
            <Text style={[styles.itemDate, { color: theme.colors.textMuted, fontFamily: theme.typography.mono }]}>May 12, 2026</Text>
          </View>
        </View>

        <View style={styles.timelineItem}>
          <View style={[styles.dot, { backgroundColor: theme.colors.warnStrong }]} />
          <View style={[styles.timelineContent, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.bgBorder }]}>
            <Text style={[styles.itemTitle, { color: theme.colors.textPrimary, fontFamily: theme.typography.subhead }]}>Dose Adjusted: Lisinopril</Text>
            <Text style={[styles.itemDate, { color: theme.colors.textMuted, fontFamily: theme.typography.mono }]}>April 28, 2026</Text>
          </View>
        </View>
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
  timeline: {
    marginLeft: 8,
    borderLeftWidth: 2,
    borderColor: '#3D5470',
    paddingLeft: 20,
    gap: 24,
  },
  timelineItem: {
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    left: -27,
    top: 20,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineContent: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  itemTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
  },
});
