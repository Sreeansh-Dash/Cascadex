import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { GlowButton } from '@/components/ui/GlowButton';
import { InputField } from '@/components/ui/InputField';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/store/auth.store';
import { usePatientStore } from '@/store/patient.store';

export default function Step2Profile() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const email = typeof params.email === 'string' ? params.email : '';
  const password = typeof params.password === 'string' ? params.password : '';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { signUp, isLoading } = useAuthStore();
  const { setCurrentPatient } = usePatientStore();

  const handleFinish = async () => {
    setErrorMsg('');
    if (!firstName) {
      setErrorMsg('First Name is required');
      return;
    }

    const userData = {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      age_range: age,
      weight_range: weight,
    };

    const res = await signUp(userData);
    if (res.success) {
      const user = useAuthStore.getState().user;
      if (user) {
        setCurrentPatient(user.id);
        router.replace('/(patient)/(tabs)');
      }
    } else {
      setErrorMsg(res.error || 'Failed to create account');
    }
  };

  return (
    <ScreenContainer padding scrollable>
      <SectionHeader title="Step 2: Profile" />
      <View style={styles.form}>
        {errorMsg ? (
          <Text style={[styles.errorText, { color: theme.colors.dangerStrong, fontFamily: theme.typography.subhead }]}>
            {errorMsg}
          </Text>
        ) : null}

        <InputField 
          label="First Name" 
          value={firstName} 
          onChangeText={(txt) => { setErrorMsg(''); setFirstName(txt); }} 
          placeholder="Enter first name"
        />

        <InputField 
          label="Last Name" 
          value={lastName} 
          onChangeText={setLastName} 
          placeholder="Enter last name"
        />

        <InputField 
          label="Age (optional)" 
          value={age} 
          onChangeText={setAge} 
          placeholder="Enter age (e.g. 45)"
          keyboardType="numeric"
        />

        <InputField 
          label="Weight (optional)" 
          value={weight} 
          onChangeText={setWeight} 
          placeholder="Enter weight (e.g. 70kg)"
        />

        <View style={{ height: 24 }} />

        <GlowButton 
          label="Create Account" 
          onPress={handleFinish} 
          variant="primary" 
          size="lg" 
          fullWidth
          loading={isLoading}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    marginTop: 20,
    gap: 16,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 8,
  }
});

