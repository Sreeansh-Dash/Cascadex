import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { GlowButton } from '@/components/ui/GlowButton';
import { InputField } from '@/components/ui/InputField';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function Step2Profile() {
  return (
    <ScreenContainer padding>
      <SectionHeader title="Step 2: Profile" />
      <InputField label="First Name" value="" onChangeText={()=>{}} />
      <InputField label="Last Name" value="" onChangeText={()=>{}} />
      <GlowButton label="Next" onPress={() => router.push('/(auth)/sign-up/step-3-role')} variant="primary" size="lg" />
    </ScreenContainer>
  );
}
