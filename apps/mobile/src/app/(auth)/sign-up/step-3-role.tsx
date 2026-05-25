import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { GlowButton } from '@/components/ui/GlowButton';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useAuthStore } from '@/store/auth.store';
import { usePatientStore } from '@/store/patient.store';
import { useTheme } from '@/theme/ThemeContext';

export default function Step3Role() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const { signUp } = useAuthStore();
  const { setCurrentPatient } = usePatientStore();

  const handleSelectRole = (role: 'patient' | 'clinician') => {
    const email = (params.email as string) || '';
    const password = (params.password as string) || '';
    const firstName = (params.firstName as string) || '';
    const lastName = (params.lastName as string) || '';
    const age = (params.age as string) || '';
    const weight = (params.weight as string) || '';

    // Register user in store
    signUp({
      email,
      password,
      firstName,
      lastName,
      role,
      age,
      weight,
      gender: 'Not specified',
      bloodType: 'Not specified',
    });

    const user = useAuthStore.getState().user;
    if (user) {
      if (role === 'patient') {
        setCurrentPatient(user.id);
        router.replace('/(patient)/(tabs)');
      } else {
        router.replace('/(clinician)/(tabs)/dashboard');
      }
    }
  };

  return (
    <ScreenContainer padding scrollable>
      <SectionHeader title="Step 3: Select Role" />
      
      <View style={styles.content}>
        <Text style={[styles.description, { color: theme.colors.textSecondary, fontFamily: theme.typography.body }]}>
          Please select your role to customize your experience on Cascadex.
        </Text>
        
        <View style={{ height: 20 }} />

        <GlowButton 
          label="I am a Patient" 
          onPress={() => handleSelectRole('patient')} 
          variant="primary" 
          size="lg" 
          fullWidth 
        />
        
        <View style={{ height: 16 }} />
        
        <GlowButton 
          label="I am a Clinician" 
          onPress={() => handleSelectRole('clinician')} 
          variant="secondary" 
          size="lg" 
          fullWidth 
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: 20,
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  }
});

