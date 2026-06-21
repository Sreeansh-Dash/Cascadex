import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { GlowButton } from '@/components/ui/GlowButton';
import { InputField } from '@/components/ui/InputField';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useAuthStore } from '@/store/auth.store';
import { useTheme } from '@/theme/ThemeContext';

export default function ForgotPassword() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { forgotPassword, isLoading } = useAuthStore();

  const handleSendLink = async () => {
    setErrorMsg('');
    if (!email) {
      setErrorMsg('Please enter your email');
      return;
    }

    const res = await forgotPassword(email);
    if (res.success) {
      // Simulate user clicking deep link from their email
      alert(`Simulation: Email sent! Redirecting via deep link...`);
      router.replace({ pathname: '/(auth)/reset-password', params: { token: res.resetToken } });
    } else {
      setErrorMsg(res.error || 'Something went wrong');
    }
  };

  return (
    <ScreenContainer padding>
      <SectionHeader title="Reset Password" />
      <Text style={[styles.desc, { color: theme.colors.textSecondary, fontFamily: theme.typography.body }]}>
        Enter your email address and we'll send you a link to reset your password.
      </Text>
      
      {errorMsg ? (
        <Text style={{ color: theme.colors.dangerStrong, marginBottom: 12, textAlign: 'center' }}>
          {errorMsg}
        </Text>
      ) : null}

      <View style={styles.form}>
        <InputField 
          label="Email" 
          value={email} 
          onChangeText={setEmail} 
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <GlowButton 
          label="Send Reset Link" 
          onPress={handleSendLink} 
          variant="primary" 
          size="lg" 
          loading={isLoading}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  desc: {
    fontSize: 14,
    marginBottom: 24,
    marginTop: -10,
  },
  form: {
    gap: 16,
  }
});
