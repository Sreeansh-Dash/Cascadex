import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../theme/colors';
import { TOKENS } from '../../theme/tokens';
import { TYPE_SCALE } from '../../theme/typography';

interface GlowButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'teal' | 'magenta' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

const VARIANT_CONFIG = {
  teal: {
    gradient: ['#004D36', '#00FFB2'] as [string, string],
    shadow: TOKENS.shadow.glowTeal,
    textColor: COLORS.text.inverse,
  },
  magenta: {
    gradient: ['#4D001F', '#FF0066'] as [string, string],
    shadow: TOKENS.shadow.glowMagenta,
    textColor: '#FFF',
  },
  amber: {
    gradient: ['#4D3700', '#FFB800'] as [string, string],
    shadow: TOKENS.shadow.glowAmber,
    textColor: COLORS.text.inverse,
  },
};

const SIZE_CONFIG = {
  sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 13 },
  md: { paddingVertical: 14, paddingHorizontal: 28, fontSize: 15 },
  lg: { paddingVertical: 18, paddingHorizontal: 36, fontSize: 17 },
};

export const GlowButton: React.FC<GlowButtonProps> = ({
  title,
  onPress,
  variant = 'teal',
  size = 'md',
  disabled = false,
  loading = false,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const config = VARIANT_CONFIG[variant];
  const sizeConfig = SIZE_CONFIG[size];

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    if (!disabled) pulse.start();
    return () => pulse.stop();
  }, [disabled]);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        config.shadow,
        { transform: [{ scale: disabled ? 1 : pulseAnim }] },
        disabled && styles.disabled,
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={disabled ? ['#1A2332', '#2D4052'] : config.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            {
              paddingVertical: sizeConfig.paddingVertical,
              paddingHorizontal: sizeConfig.paddingHorizontal,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={config.textColor} size="small" />
          ) : (
            <Text
              style={[
                styles.text,
                {
                  color: disabled ? COLORS.text.muted : config.textColor,
                  fontSize: sizeConfig.fontSize,
                },
              ]}
            >
              {title}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: TOKENS.radius.pill,
    overflow: 'visible',
  },
  gradient: {
    borderRadius: TOKENS.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Syne_700Bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  disabled: {
    opacity: 0.5,
  },
});
