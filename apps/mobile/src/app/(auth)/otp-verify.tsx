import React from 'react';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { GlowButton } from '@/components/ui/GlowButton';
import { InputField } from '@/components/ui/InputField';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function OTPVerify() {
  return (
    <ScreenContainer padding>
      <SectionHeader title="Verify OTP" />
      <InputField label="Code" value="" onChangeText={()=>{}} />
      <GlowButton label="Verify" onPress={() => router.push('/(auth)/reset-password')} variant="primary" size="lg" />
    </ScreenContainer>
  );
}
