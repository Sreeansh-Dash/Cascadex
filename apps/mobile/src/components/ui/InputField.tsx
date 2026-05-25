import React, { ReactNode, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardTypeOptions, ReturnKeyTypeOptions } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
  strengthMeter?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  secureTextEntry = false,
  keyboardType = 'default',
  returnKeyType = 'done',
  onSubmitEditing,
  autoFocus = false,
  strengthMeter = false,
  leftIcon,
  rightIcon,
  autoCapitalize = 'sentences',
}) => {
  const { theme, mode } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureVisible, setIsSecureVisible] = useState(false);
  
  const focusAnim = useSharedValue(0);

  const handleFocus = () => {
    setIsFocused(true);
    focusAnim.value = withTiming(1, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusAnim.value = withTiming(0, { duration: 200 });
  };

  const animatedBorderStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusAnim.value,
      [0, 1],
      [error ? theme.colors.dangerStrong : theme.colors.inputBorder, error ? theme.colors.dangerStrong : theme.colors.inputFocus]
    );
    return {
      borderColor,
    };
  });

  const getStrength = () => {
    if (value.length === 0) return 0;
    if (value.length < 6) return 1;
    if (value.length < 10) return 2;
    return 3;
  };

  const renderStrengthMeter = () => {
    if (!strengthMeter) return null;
    const strength = getStrength();
    const colors = [theme.colors.bgBorder, theme.colors.dangerStrong, theme.colors.warnStrong, theme.colors.safeStrong];
    
    return (
      <View style={styles.strengthContainer}>
        <View style={[styles.strengthBar, { backgroundColor: strength >= 1 ? colors[1] : colors[0] }]} />
        <View style={[styles.strengthBar, { backgroundColor: strength >= 2 ? colors[2] : colors[0] }]} />
        <View style={[styles.strengthBar, { backgroundColor: strength >= 3 ? colors[3] : colors[0] }]} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono }]}>
        {label}
      </Text>
      
      <Animated.View style={[styles.inputContainer, { backgroundColor: theme.colors.inputBg }, animatedBorderStyle]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={[
            styles.input,
            { color: theme.colors.textPrimary, fontFamily: theme.typography.body }
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={secureTextEntry && !isSecureVisible}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          autoFocus={autoFocus}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor={theme.colors.accent}
          autoCapitalize={autoCapitalize}
        />
        
        {secureTextEntry && !rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={() => setIsSecureVisible(!isSecureVisible)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name={isSecureVisible ? 'eye-off' : 'eye'}
              size={24}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
        )}
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </Animated.View>
      
      {renderStrengthMeter()}
      
      {error ? (
        <Text style={[styles.errorText, { color: theme.colors.dangerStrong, fontFamily: theme.typography.body }]}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={[styles.hintText, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  leftIcon: {
    marginRight: 12,
  },
  rightIcon: {
    marginLeft: 12,
  },
  errorText: {
    fontSize: 14,
    marginTop: 6,
  },
  hintText: {
    fontSize: 14,
    marginTop: 6,
  },
  strengthContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
});
