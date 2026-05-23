import React from 'react';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from 'react-native';

export default function Notifications() {
  return (
    <ScreenContainer padding>
      <SectionHeader title="Notifications" />
      <Text>No new alerts.</Text>
    </ScreenContainer>
  );
}
