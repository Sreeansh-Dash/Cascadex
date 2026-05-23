import React from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function DrugDetails() {
  const { drugId } = useLocalSearchParams();
  return (
    <ScreenContainer padding>
      <SectionHeader title={`Drug Details: ${drugId}`} />
      <Text>Drug information goes here.</Text>
    </ScreenContainer>
  );
}
