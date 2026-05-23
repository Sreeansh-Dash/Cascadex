import React from 'react';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { GlowButton } from '@/components/ui/GlowButton';
import { InputField } from '@/components/ui/InputField';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function ResetPassword() {
  return (
    <ScreenContainer padding>
      <SectionHeader title="New Password" />
      <InputField label="Password" value="" onChangeText={()=>{}} secureTextEntry />
      <GlowButton label="Save & Sign In" onPress={() => router.replace('/(auth)/sign-in')} variant="primary" size="lg" />
    </ScreenContainer>
  );
}
