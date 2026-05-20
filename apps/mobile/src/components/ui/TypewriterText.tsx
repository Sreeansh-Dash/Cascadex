import React, { useEffect, useState, useRef } from 'react';
import { Text, TextStyle, Animated } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPE_SCALE } from '../../theme/typography';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  style?: TextStyle;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 30,
  onComplete,
  style,
}) => {
  const [displayed, setDisplayed] = useState('');
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed('');
    indexRef.current = 0;

    const interval = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current <= text.length) {
        setDisplayed(text.slice(0, indexRef.current));
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, []);

  const isComplete = displayed.length >= text.length;

  return (
    <Text style={[defaultStyle, style]}>
      {displayed}
      {!isComplete && (
        <Animated.Text
          style={[
            { color: COLORS.primary, opacity: cursorOpacity },
          ]}
        >
          ▌
        </Animated.Text>
      )}
    </Text>
  );
};

const defaultStyle: TextStyle = {
  ...TYPE_SCALE.body,
  color: COLORS.text.primary,
};
