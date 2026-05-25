import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ViewStyle, Animated } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

interface DangerBadgeProps {
  status: 'critical' | 'moderate' | 'safe' | 'pending';
  label?: string;
  style?: ViewStyle;
}

export const DangerBadge: React.FC<DangerBadgeProps> = ({ status, label, style }) => {
  const { theme } = useTheme();
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'critical') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      blinkAnim.setValue(1);
    }
  }, [status]);

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
    <Animated.View 
      style={[
        styles.badge, 
        { 
          backgroundColor: colors.bg, 
          borderColor: colors.border,
          opacity: blinkAnim 
        }, 
        style
      ]}
    >
      <Text style={[styles.text, { color: colors.text, fontFamily: theme.typography.subhead }]}>
        {label || defaultLabels[status]}
      </Text>
    </Animated.View>
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

