import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TOKENS } from '../../theme/tokens';

interface ScanOverlayProps {
  isLocked?: boolean;
  drugName?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FRAME_SIZE = SCREEN_WIDTH * 0.65;
const BRACKET_SIZE = 40;
const BRACKET_THICKNESS = 3;

export const ScanOverlay: React.FC<ScanOverlayProps> = ({
  isLocked = false,
  drugName,
}) => {
  const scanLineY = useRef(new Animated.Value(0)).current;
  const bracketScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (!isLocked) {
      // Scan line sweep
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineY, {
            toValue: FRAME_SIZE,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineY, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Bracket pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.4,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Lock animation
      Animated.spring(bracketScale, {
        toValue: 0.85,
        useNativeDriver: true,
        tension: 100,
        friction: 6,
      }).start();
      glowOpacity.setValue(1);
    }
  }, [isLocked]);

  const bracketColor = isLocked ? COLORS.primary : COLORS.secondary;

  const Corner = ({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) => {
    const isTop = position.includes('t');
    const isLeft = position.includes('l');

    return (
      <View
        style={[
          styles.corner,
          {
            top: isTop ? 0 : undefined,
            bottom: !isTop ? 0 : undefined,
            left: isLeft ? 0 : undefined,
            right: !isLeft ? 0 : undefined,
          },
        ]}
      >
        <View
          style={[
            styles.bracketH,
            {
              backgroundColor: bracketColor,
              top: isTop ? 0 : undefined,
              bottom: !isTop ? 0 : undefined,
              left: isLeft ? 0 : undefined,
              right: !isLeft ? 0 : undefined,
            },
          ]}
        />
        <View
          style={[
            styles.bracketV,
            {
              backgroundColor: bracketColor,
              top: isTop ? 0 : undefined,
              bottom: !isTop ? 0 : undefined,
              left: isLeft ? 0 : undefined,
              right: !isLeft ? 0 : undefined,
            },
          ]}
        />
      </View>
    );
  };

  return (
    <View style={styles.overlay}>
      {/* Vignette */}
      <View style={styles.vignette} />

      {/* HUD Text */}
      <Text style={styles.hudText}>SCANNING NDC BARCODE</Text>

      {/* Scan Frame */}
      <Animated.View
        style={[
          styles.frame,
          {
            width: FRAME_SIZE,
            height: FRAME_SIZE,
            transform: [{ scale: bracketScale }],
            opacity: glowOpacity,
          },
        ]}
      >
        <Corner position="tl" />
        <Corner position="tr" />
        <Corner position="bl" />
        <Corner position="br" />

        {/* Scan line */}
        {!isLocked && (
          <Animated.View
            style={[
              styles.scanLine,
              { transform: [{ translateY: scanLineY }] },
            ]}
          />
        )}
      </Animated.View>

      {/* Drug name when locked */}
      {isLocked && drugName && (
        <View style={styles.lockedInfo}>
          <Text style={styles.lockedLabel}>IDENTIFIED</Text>
          <Text style={styles.lockedName}>{drugName}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 4, 8, 0.55)',
  },
  hudText: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 11,
    color: COLORS.secondary,
    letterSpacing: 3,
    marginBottom: 24,
    textTransform: 'uppercase',
  },
  frame: {
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: BRACKET_SIZE,
    height: BRACKET_SIZE,
  },
  bracketH: {
    position: 'absolute',
    width: BRACKET_SIZE,
    height: BRACKET_THICKNESS,
  },
  bracketV: {
    position: 'absolute',
    width: BRACKET_THICKNESS,
    height: BRACKET_SIZE,
  },
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.6,
  },
  lockedInfo: {
    marginTop: 32,
    alignItems: 'center',
  },
  lockedLabel: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 3,
    marginBottom: 8,
  },
  lockedName: {
    fontFamily: 'Syne_700Bold',
    fontSize: 22,
    color: COLORS.text.primary,
  },
});
