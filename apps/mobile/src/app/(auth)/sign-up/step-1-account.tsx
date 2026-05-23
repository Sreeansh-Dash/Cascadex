import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { GlowButton } from '@/components/ui/GlowButton';
import { InputField } from '@/components/ui/InputField';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function Step1Account() {
  return (
    <ScreenContainer padding>
      <SectionHeader title="Step 1: Account Details" />
      <InputField label="Email" value="" onChangeText={()=>{}} />
      <InputField label="Password" value="" onChangeText={()=>{}} secureTextEntry />
      <GlowButton label="Next" onPress={() => router.push('/(auth)/sign-up/step-2-profile')} variant="primary" size="lg" />
    </ScreenContainer>
  );
}
