import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { GlowButton } from '@/components/ui/GlowButton';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function Step3Role() {
  return (
    <ScreenContainer padding>
      <SectionHeader title="Step 3: Role" />
      <GlowButton label="I am a Patient" onPress={() => router.replace('/(patient)/(tabs)')} variant="primary" size="lg" fullWidth />
      <View style={{height:16}}/>
      <GlowButton label="I am a Clinician" onPress={() => router.replace('/(clinician)/(tabs)')} variant="secondary" size="lg" fullWidth />
    </ScreenContainer>
  );
}
