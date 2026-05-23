import React from 'react';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { GlowButton } from '@/components/ui/GlowButton';
import { InputField } from '@/components/ui/InputField';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function ForgotPassword() {
  return (
    <ScreenContainer padding>
      <SectionHeader title="Reset Password" />
      <InputField label="Email" value="" onChangeText={()=>{}} />
      <GlowButton label="Send OTP" onPress={() => router.push('/(auth)/otp-verify')} variant="primary" size="lg" />
    </ScreenContainer>
  );
}
