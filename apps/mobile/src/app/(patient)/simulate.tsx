import React from 'react';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from 'react-native';

export default function SimulateInteraction() {
  return (
    <ScreenContainer padding>
      <SectionHeader title="Simulate Interaction" />
      <Text>Test new drugs against your current regimen safely.</Text>
    </ScreenContainer>
  );
}
