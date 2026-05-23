import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';

export const StickyFooter = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom || 20, backgroundColor: theme.colors.bgPrimary, borderTopColor: theme.colors.bgBorder }]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1 },
});
