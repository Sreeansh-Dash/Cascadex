import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

export const DrugGraphCanvas = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.canvas, { backgroundColor: theme.colors.bgPrimary, borderColor: theme.colors.bgBorder }]}>
      <Text style={{ color: theme.colors.textMuted }}>[Skia Graph Canvas Placeholder]</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: { flex: 1, minHeight: 300, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderRadius: 16 },
});
