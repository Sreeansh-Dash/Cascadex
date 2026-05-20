import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TOKENS } from '../../theme/tokens';

interface DangerBadgeProps {
  severity: 'critical' | 'moderate' | 'safe' | 'unknown';
  compact?: boolean;
  count?: number;
}

const SEVERITY_CONFIG = {
  critical: {
    bg: 'rgba(255, 0, 102, 0.15)',
    border: 'rgba(255, 0, 102, 0.4)',
    text: '#FF0066',
    label: 'CRITICAL',
    shadow: TOKENS.shadow.glowMagenta,
  },
  moderate: {
    bg: 'rgba(255, 184, 0, 0.12)',
    border: 'rgba(255, 184, 0, 0.35)',
    text: '#FFB800',
    label: 'MODERATE',
    shadow: TOKENS.shadow.glowAmber,
  },
  safe: {
    bg: 'rgba(0, 255, 178, 0.10)',
    border: 'rgba(0, 255, 178, 0.3)',
    text: '#00FFB2',
    label: 'SAFE',
    shadow: TOKENS.shadow.glowTeal,
  },
  unknown: {
    bg: 'rgba(107, 130, 153, 0.12)',
    border: 'rgba(107, 130, 153, 0.3)',
    text: '#6B8299',
    label: 'UNKNOWN',
    shadow: TOKENS.shadow.card,
  },
};

export const DangerBadge: React.FC<DangerBadgeProps> = ({
  severity,
  compact = false,
  count,
}) => {
  const config = SEVERITY_CONFIG[severity];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
        },
        compact && styles.compact,
        severity === 'critical' && config.shadow,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.text }]} />
      <Text
        style={[
          styles.label,
          { color: config.text },
          compact && styles.compactLabel,
        ]}
      >
        {config.label}
      </Text>
      {count !== undefined && (
        <Text style={[styles.count, { color: config.text }]}>{count}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: TOKENS.radius.pill,
    borderWidth: 1,
    gap: 6,
  },
  compact: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  compactLabel: {
    fontSize: 9,
  },
  count: {
    fontFamily: 'SpaceMono_700Bold',
    fontSize: 12,
    marginLeft: 2,
  },
});
