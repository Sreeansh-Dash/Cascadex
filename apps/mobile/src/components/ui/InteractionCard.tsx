import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { DangerBadge } from '@/components/ui/DangerBadge';

export const InteractionCard = ({ drugA, drugB, severity, desc }: { drugA: string, drugB: string, severity: 'critical'|'moderate'|'safe', desc: string }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.bgBorder }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.typography.subhead }]}>{drugA} + {drugB}</Text>
        <DangerBadge status={severity} />
      </View>
      <Text style={[styles.desc, { color: theme.colors.textSecondary, fontFamily: theme.typography.body }]}>{desc}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 16 },
  desc: { fontSize: 14 },
});
