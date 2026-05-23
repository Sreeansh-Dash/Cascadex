import React from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function ChainDetails() {
  const { chainId } = useLocalSearchParams();
  return (
    <ScreenContainer padding>
      <SectionHeader title={`Interaction Chain: ${chainId}`} />
      <Text>Cascade effects visualization.</Text>
    </ScreenContainer>
  );
}
