import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

export const BottomSheetWrapper = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.sheet, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.bgBorder }]}>
      <View style={[styles.handle, { backgroundColor: theme.colors.bgBorder }]} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, borderWidth: 1, minHeight: 200 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
});
