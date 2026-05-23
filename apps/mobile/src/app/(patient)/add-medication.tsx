import React from 'react';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { InputField } from '@/components/ui/InputField';
import { GlowButton } from '@/components/ui/GlowButton';
import { router } from 'expo-router';

export default function AddMedication() {
  return (
    <ScreenContainer padding>
      <SectionHeader title="Add Medication" />
      <InputField label="Drug Name" value="" onChangeText={()=>{}} />
      <GlowButton label="Save" onPress={() => router.back()} variant="primary" size="lg" />
    </ScreenContainer>
  );
}
