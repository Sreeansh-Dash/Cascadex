import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

export const TypewriterText = ({ text, delay = 50 }: { text: string, delay?: number }) => {
  const { theme } = useTheme();
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, delay);
    return () => clearInterval(interval);
  }, [text, delay]);

  return <Text style={[styles.text, { color: theme.colors.textPrimary, fontFamily: theme.typography.mono }]}>{displayedText}</Text>;
};

const styles = StyleSheet.create({
  text: { fontSize: 14, lineHeight: 20 },
});
