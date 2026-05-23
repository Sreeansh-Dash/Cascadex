import React from 'react';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from 'react-native';

export default function PrescribeCheck() {
  return (
    <ScreenContainer padding>
      <SectionHeader title="Prescribe & Check" />
      <Text>Validate new prescriptions against patient's current interactions.</Text>
    </ScreenContainer>
  );
}
