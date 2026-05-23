import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

export const ToastNotification = ({ message, visible, onHide }: { message: string, visible: boolean, onHide: () => void }) => {
  const { theme } = useTheme();
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      const timer = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => onHide());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, { opacity, backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.accent }]}>
      <Text style={[styles.text, { color: theme.colors.textPrimary, fontFamily: theme.typography.body }]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: { position: 'absolute', top: 50, left: 20, right: 20, padding: 16, borderRadius: 8, borderWidth: 1, zIndex: 9999 },
  text: { fontSize: 14, textAlign: 'center' },
});
