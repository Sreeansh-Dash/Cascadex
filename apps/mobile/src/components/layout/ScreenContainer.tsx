import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View, ViewStyle, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  padding?: boolean;
  keyboardAvoiding?: boolean;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  style,
  scrollable = false,
  padding = true,
  keyboardAvoiding = true,
}) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const contentStyle = [
    styles.content,
    padding && styles.padding,
    style
  ];

  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={[contentStyle, { paddingBottom: insets.bottom + (padding ? 16 : 0) }]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[contentStyle, { paddingBottom: insets.bottom }]}>
      {children}
    </View>
  );

  return (
    <LinearGradient
      colors={theme.gradients.screenBg as any}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  padding: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});
