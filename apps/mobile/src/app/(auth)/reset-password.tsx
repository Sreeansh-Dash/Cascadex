import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { GlowButton } from '@/components/ui/GlowButton';
import { InputField } from '@/components/ui/InputField';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useAuthStore } from '@/store/auth.store';
import { useTheme } from '@/theme/ThemeContext';

export default function ResetPassword() {
  const { theme } = useTheme();
  const { token } = useLocalSearchParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { resetPassword, isLoading } = useAuthStore();

  const handleSave = async () => {
    setErrorMsg('');
    if (!password) {
      setErrorMsg('Please enter a new password');
      return;
    }
    if (!token) {
      setErrorMsg('Invalid or missing reset token');
      return;
    }

    const res = await resetPassword(token, password);
    if (res.success) {
      alert('Password reset successfully! You can now sign in.');
      router.replace('/(auth)/'); // Go back to sign in
    } else {
      setErrorMsg(res.error || 'Failed to reset password');
    }
  };

  return (
    <ScreenContainer padding>
      <SectionHeader title="New Password" />
      <Text style={[styles.desc, { color: theme.colors.textSecondary, fontFamily: theme.typography.body }]}>
        Please enter your new secure password.
      </Text>

      {errorMsg ? (
        <Text style={{ color: theme.colors.dangerStrong, marginBottom: 12, textAlign: 'center' }}>
          {errorMsg}
        </Text>
      ) : null}

      <View style={styles.form}>
        <InputField 
          label="New Password" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry 
        />
        <GlowButton 
          label="Save & Sign In" 
          onPress={handleSave} 
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
