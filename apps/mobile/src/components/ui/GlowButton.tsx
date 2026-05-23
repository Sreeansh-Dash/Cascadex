import React, { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface GlowButtonProps {
  label: string;
  onPress: () => void;
  variant: 'primary' | 'secondary' | 'destructive' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  label,
  onPress,
  variant,
  size,
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
}) => {
  const { theme, mode } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.96);
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1);
    }
  };

  const handlePress = () => {
    if (disabled || loading) return;
    
    if (variant === 'destructive') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onPress();
  };

  const getHeight = () => {
    switch (size) {
      case 'sm': return 40;
      case 'md': return 52;
      case 'lg': return 56;
      default: return 56;
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return mode === 'biopunk' ? '#1E2E42' : '#D8CFC8';
    if (variant === 'primary') return theme.colors.btnPrimaryBg;
    if (variant === 'destructive') return theme.colors.btnDestructive;
    if (variant === 'secondary' || variant === 'ghost') return theme.colors.btnSecBg;
    return theme.colors.btnPrimaryBg;
  };

  const getBorderColor = () => {
    if (disabled) return 'transparent';
    if (variant === 'secondary') return theme.colors.btnSecBorder;
    if (variant === 'destructive') return theme.colors.btnDestructive;
    return 'transparent';
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.textMuted;
    if (variant === 'primary') return theme.colors.btnPrimaryText;
    if (variant === 'destructive') return '#FFFFFF';
    if (variant === 'secondary' || variant === 'ghost') return theme.colors.btnSecText;
    return theme.colors.btnPrimaryText;
  };

  const getGlowStyle = () => {
    if (disabled || variant === 'ghost' || variant === 'secondary') return {};
    if (mode === 'biopunk') {
      if (variant === 'primary') return theme.shadows.glowAccent;
      if (variant === 'destructive') return theme.shadows.glowDanger;
    } else {
      if (variant === 'primary') return theme.shadows.glowAccent;
      if (variant === 'destructive') return theme.shadows.glowDanger;
    }
    return {};
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={[animatedStyle, fullWidth && { width: '100%' }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[
          styles.button,
          {
            height: getHeight(),
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            borderWidth: variant === 'secondary' ? 1.5 : 0,
            opacity: disabled ? 0.6 : 1,
          },
          getGlowStyle(),
        ]}
      >
        <View style={styles.contentContainer}>
          {loading ? (
            <ActivityIndicator color={getTextColor()} />
          ) : (
            <>
              {icon && <View style={styles.iconContainer}>{icon}</View>}
              <Text style={[styles.label, { color: getTextColor(), fontFamily: theme.typography.subhead }]}>
                {label}
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 48,
    overflow: 'visible',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  label: {
    fontSize: 16,
  },
});
