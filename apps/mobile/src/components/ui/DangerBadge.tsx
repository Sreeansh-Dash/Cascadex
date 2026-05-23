import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

interface DangerBadgeProps {
  status: 'critical' | 'moderate' | 'safe' | 'pending';
  label?: string;
  style?: ViewStyle;
}

export const DangerBadge: React.FC<DangerBadgeProps> = ({ status, label, style }) => {
  const { theme } = useTheme();

  const getColors = () => {
    switch (status) {
      case 'critical':
        return {
          bg: theme.colors.dangerSurface,
          text: theme.colors.dangerStrong,
          border: theme.colors.dangerStrong,
        };
      case 'moderate':
        return {
          bg: theme.colors.warnSurface,
          text: theme.colors.warnStrong,
          border: theme.colors.warnStrong,
        };
      case 'safe':
        return {
          bg: theme.colors.safeSurface,
          text: theme.colors.safeStrong,
          border: theme.colors.safeStrong,
        };
      case 'pending':
      default:
        return {
          bg: theme.colors.bgElevated,
          text: theme.colors.textSecondary,
          border: theme.colors.bgBorder,
        };
    }
  };

  const colors = getColors();
  
  const defaultLabels = {
    critical: 'Critical',
    moderate: 'Moderate',
    safe: 'Safe',
    pending: 'Pending',
  };

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.border }, style]}>
      <Text style={[styles.text, { color: colors.text, fontFamily: theme.typography.subhead }]}>
        {label || defaultLabels[status]}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999, // Pill shape
    borderWidth: 1,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
});
