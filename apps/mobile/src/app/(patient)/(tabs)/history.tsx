import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useTheme } from '@/theme/ThemeContext';
import { usePatientStore } from '@/store/patient.store';

export default function PatientHistory() {
  const { theme } = useTheme();
  const { history } = usePatientStore();

  return (
    <ScreenContainer scrollable padding hasTabBar={true}>
      <Text style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.typography.display }]}>Medical History</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: theme.typography.body }]}>Your past medications and interaction logs.</Text>

      {history.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.bgBorder }]}>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary, fontFamily: theme.typography.subhead }]}>
            No History Available
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>
            When you add medications to your graph, they will appear in your timeline here.
          </Text>
        </View>
      ) : (
        <View style={styles.timeline}>
          {history.map((item, index) => {
            // Pick a color based on action type
            let dotColor = theme.colors.safeStrong;
            if (item.action === 'removed') dotColor = theme.colors.dangerStrong;
            else if (item.action === 'adjusted') dotColor = theme.colors.warnStrong;

            return (
              <View key={item.id} style={styles.timelineItem}>
                <View style={[styles.dot, { backgroundColor: dotColor }]} />
                <View style={[styles.timelineContent, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.bgBorder }]}>
                  <Text style={[styles.itemTitle, { color: theme.colors.textPrimary, fontFamily: theme.typography.subhead }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.itemDose, { color: theme.colors.textSecondary, fontFamily: theme.typography.body }]}>
                    Dose: {item.dose || 'N/A'}
                  </Text>
                  <Text style={[styles.itemDate, { color: theme.colors.textMuted, fontFamily: theme.typography.mono }]}>
                    {item.date} at {item.time}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
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
  itemDose: {
    fontSize: 13,
    marginBottom: 6,
  },
  itemDate: {
    fontSize: 11,
  },
  emptyCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
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

