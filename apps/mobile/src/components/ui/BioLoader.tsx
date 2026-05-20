import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { COLORS } from '../../theme/colors';

interface BioLoaderProps {
  size?: number;
  style?: ViewStyle;
}

export const BioLoader: React.FC<BioLoaderProps> = ({ size = 80, style }) => {
  const pulse1 = useRef(new Animated.Value(0.6)).current;
  const pulse2 = useRef(new Animated.Value(0.8)).current;
  const pulse3 = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulse = (anim: Animated.Value, min: number, max: number, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: max, duration, useNativeDriver: true }),
          Animated.timing(anim, { toValue: min, duration, useNativeDriver: true }),
        ])
      );

    const spin = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 6000,
        useNativeDriver: true,
      })
    );

    createPulse(pulse1, 0.5, 1.2, 1800).start();
    createPulse(pulse2, 0.7, 1.1, 2200).start();
    createPulse(pulse3, 0.6, 1.3, 1500).start();
    spin.start();

    return () => {
      pulse1.stopAnimation();
      pulse2.stopAnimation();
      pulse3.stopAnimation();
      rotate.stopAnimation();
    };
  }, []);

  const spinInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const blobSize = size * 0.6;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Animated.View
        style={[
          styles.blob,
          {
            width: blobSize,
            height: blobSize,
            borderRadius: blobSize / 2,
            backgroundColor: COLORS.glow.teal,
            transform: [{ scale: pulse1 }, { rotate: spinInterpolate }],
            top: size * 0.1,
            left: size * 0.2,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.blob,
          {
            width: blobSize * 0.8,
            height: blobSize * 0.8,
            borderRadius: (blobSize * 0.8) / 2,
            backgroundColor: COLORS.glow.violet,
            transform: [{ scale: pulse2 }],
            top: size * 0.25,
            left: size * 0.35,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.blob,
          {
            width: blobSize * 0.7,
            height: blobSize * 0.7,
            borderRadius: (blobSize * 0.7) / 2,
            backgroundColor: COLORS.glow.cyan,
            transform: [{ scale: pulse3 }],
            top: size * 0.15,
            left: size * 0.1,
          },
        ]}
      />
      {/* Core bright dot */}
      <View
        style={[
          styles.core,
          {
            width: size * 0.12,
            height: size * 0.12,
            borderRadius: size * 0.06,
            top: size * 0.44,
            left: size * 0.44,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  blob: {
    position: 'absolute',
  },
  core: {
    position: 'absolute',
    backgroundColor: COLORS.primary,
  },
});
