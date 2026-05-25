import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { GlowButton } from '@/components/ui/GlowButton';
import { InputField } from '@/components/ui/InputField';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useTheme } from '@/theme/ThemeContext';

export default function Step1Account() {
  const { theme } = useTheme();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');

  const handleNext = () => {
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      return;
    }
    if (!email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    router.push({
      pathname: '/(auth)/sign-up/step-2-profile',
      params: { email, password }
    });
  };

  return (
    <ScreenContainer padding scrollable>
      <SectionHeader title="Step 1: Account Details" />
      <View style={styles.form}>
        {errorMsg ? (
          <Text style={[styles.errorText, { color: theme.colors.dangerStrong, fontFamily: theme.typography.subhead }]}>
            {errorMsg}
          </Text>
        ) : null}

        <InputField 
          label="Email Address" 
          value={email} 
          onChangeText={(txt) => { setErrorMsg(''); setEmail(txt); }} 
          placeholder="Enter email address"
          autoCapitalize="none"
        />

        <InputField 
          label="Password" 
          value={password} 
          onChangeText={(txt) => { setErrorMsg(''); setPassword(txt); }} 
          secureTextEntry 
          placeholder="Enter password (min 6 chars)"
          autoCapitalize="none"
        />

        <View style={{ height: 24 }} />

        <GlowButton 
          label="Next" 
          onPress={handleNext} 
          variant="primary" 
          size="lg" 
          fullWidth
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    marginTop: 20,
    gap: 16,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 8,
  }
});

