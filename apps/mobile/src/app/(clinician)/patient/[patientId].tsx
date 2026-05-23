import React from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function ClinicianPatientDetails() {
  const { patientId } = useLocalSearchParams();
  return (
    <ScreenContainer padding>
      <SectionHeader title={`Patient: ${patientId}`} />
      <Text>Patient profile and current medications.</Text>
    </ScreenContainer>
  );
}
