import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

export const TypewriterText = ({ text, delay = 20 }: { text: string, delay?: number }) => {
  const { theme } = useTheme();
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    // If the new text is shorter or totally different, reset
    if (!text.startsWith(displayedText)) {
      setDisplayedText('');
    }

    if (text.length > displayedText.length) {
      const interval = setInterval(() => {
        setDisplayedText(prev => {
          if (prev.length < text.length) {
            return text.substring(0, prev.length + 1);
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, delay);
      
      return () => clearInterval(interval);
    }
  }, [text, delay, displayedText]);

  return <Text style={[styles.text, { color: theme.colors.textPrimary, fontFamily: theme.typography.mono }]}>{displayedText}</Text>;
};

const styles = StyleSheet.create({
  text: { fontSize: 14, lineHeight: 22 },
});
