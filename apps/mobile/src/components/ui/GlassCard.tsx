import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { TOKENS } from '../../theme/tokens';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'danger' | 'warning';
  onPress?: () => void;
  style?: ViewStyle;
  glowIntensity?: 'low' | 'medium' | 'high';
}

const VARIANT_STYLES = {
  default: {
    borderColor: COLORS.glass.border,
    shadowConfig: TOKENS.shadow.glowTeal,
  },
  danger: {
    borderColor: COLORS.glass.borderDanger,
    shadowConfig: TOKENS.shadow.glowMagenta,
  },
  warning: {
    borderColor: 'rgba(255, 184, 0, 0.15)',
    shadowConfig: TOKENS.shadow.glowAmber,
  },
};

const INTENSITY = {
  low: 0.15,
  medium: 0.3,
  high: 0.5,
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  onPress,
  style,
  glowIntensity = 'low',
}) => {
  const variantStyle = VARIANT_STYLES[variant];
  const intensity = INTENSITY[glowIntensity];

  const cardStyle: ViewStyle = {
    ...styles.card,
    borderColor: variantStyle.borderColor,
    ...variantStyle.shadowConfig,
    shadowOpacity: intensity,
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[cardStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.glass.bg,
    borderWidth: 1,
    borderRadius: TOKENS.radius.lg,
    padding: TOKENS.spacing.md,
    overflow: 'hidden',
  },
});
