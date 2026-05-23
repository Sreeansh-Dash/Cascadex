import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

export const DrugCard = ({ name, dose }: { name: string, dose: string }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.cardBg, borderColor: theme.colors.bgBorder }]}>
      <Text style={[styles.name, { color: theme.colors.textPrimary, fontFamily: theme.typography.heading }]}>{name}</Text>
      <Text style={[styles.dose, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono }]}>{dose}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  name: { fontSize: 18, marginBottom: 4 },
  dose: { fontSize: 14 },
});
