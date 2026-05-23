import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useTheme } from '@/theme/ThemeContext';

export default function PatientScan() {
  const { theme } = useTheme();

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={{ color: theme.colors.textPrimary, fontFamily: theme.typography.display }}>Scan Medication</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
