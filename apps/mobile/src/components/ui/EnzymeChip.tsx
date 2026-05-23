import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

export const EnzymeChip = ({ label }: { label: string }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.chip, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.nodeEnzyme }]}>
      <Text style={[styles.text, { color: theme.colors.textPrimary, fontFamily: theme.typography.mono }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  text: { fontSize: 12 },
});
