import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { GlowButton } from '@/components/ui/GlowButton';
import { InputField } from '@/components/ui/InputField';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useTheme } from '@/theme/ThemeContext';

export default function Step2Profile() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const { email, password } = params;

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [age, setAge] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');

  const handleNext = () => {
    setErrorMsg('');
    if (!firstName) {
      setErrorMsg('First Name is required');
      return;
    }

    router.push({
      pathname: '/(auth)/sign-up/step-3-role',
      params: {
        email,
        password,
        firstName,
        lastName,
        age,
        weight
      }
    });
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
          label="Next" 
          onPress={handleNext} 
          variant="primary" 
          size="lg" 
          fullWidth
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

