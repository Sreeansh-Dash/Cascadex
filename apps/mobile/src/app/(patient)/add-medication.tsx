import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { InputField } from '@/components/ui/InputField';
import { GlowButton } from '@/components/ui/GlowButton';
import { router } from 'expo-router';
import { usePatientStore } from '@/store/patient.store';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const COMMON_DRUGS = [
  { name: 'Paracetamol', dose: '500mg', frequency: 'Every 6 hours', indication: 'Fever / Pain' },
  { name: 'Penicillin', dose: '250mg', frequency: 'Four times daily', indication: 'Infection' },
  { name: 'Aspirin', dose: '100mg', frequency: 'Once daily', indication: 'Cardioprotection' },
  { name: 'Warfarin', dose: '5mg', frequency: 'Once daily', indication: 'Blood thinner' },
  { name: 'Lisinopril', dose: '10mg', frequency: 'Once daily', indication: 'Hypertension' },
  { name: 'Ibuprofen', dose: '400mg', frequency: 'As needed', indication: 'Pain relief' },
  { name: 'Metformin', dose: '500mg', frequency: 'Twice daily', indication: 'Diabetes' },
  { name: 'Clopidogrel', dose: '75mg', frequency: 'Once daily', indication: 'Blood thinner' },
  { name: 'Omeprazole', dose: '20mg', frequency: 'Once daily', indication: 'Acid reflux' },
  { name: 'Simvastatin', dose: '20mg', frequency: 'Once daily', indication: 'Cholesterol' },
  { name: 'Amlodipine', dose: '5mg', frequency: 'Once daily', indication: 'Hypertension' },
  { name: 'Sildenafil', dose: '50mg', frequency: 'As needed', indication: 'Erectile dysfunction' },
  { name: 'Nitroglycerin', dose: '0.4mg', frequency: 'As needed', indication: 'Angina' }
];

export default function AddMedication() {
  const { theme } = useTheme();
  const { addPatientMedication } = usePatientStore();

  const [drugName, setDrugName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [indication, setIndication] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelectCommon = (item: typeof COMMON_DRUGS[0]) => {
    setDrugName(item.name);
    setDosage(item.dose);
    setFrequency(item.frequency);
    setIndication(item.indication);
    setErrorMsg('');
  };

  const handleSave = () => {
    setErrorMsg('');
    if (!drugName) {
      setErrorMsg('Drug Name is required');
      return;
    }

    addPatientMedication({
      name: drugName.trim(),
      dose: dosage.trim() || '500mg',
      frequency: frequency.trim() || 'Once daily',
      indication: indication.trim() || 'General health',
    });

    Alert.alert(
      'Medication Added',
      `${drugName} has been added and your metabolic network has been updated.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <ScreenContainer padding scrollable>
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} onPress={() => router.back()} />
        <View style={styles.headerTitle}>
          <SectionHeader title="Add Medication" />
        </View>
      </View>

      <View style={styles.content}>
        {errorMsg ? (
          <Text style={[styles.errorText, { color: theme.colors.dangerStrong, fontFamily: theme.typography.subhead }]}>
            {errorMsg}
          </Text>
        ) : null}

        {/* Common Drug Suggestions */}
        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono }]}>
          Common Quick-Add Drugs
        </Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.suggestionScroll}
          contentContainerStyle={styles.suggestionContainer}
        >
          {COMMON_DRUGS.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={[styles.chip, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.bgBorder }]}
              onPress={() => handleSelectCommon(item)}
            >
              <Text style={[styles.chipText, { color: theme.colors.accent, fontFamily: theme.typography.subhead }]}>
                {item.name}
              </Text>
              <Text style={[styles.chipDose, { color: theme.colors.textMuted, fontFamily: theme.typography.mono }]}>
                {item.dose}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.form}>
          <InputField 
            label="Drug Name" 
            value={drugName} 
            onChangeText={(txt) => { setErrorMsg(''); setDrugName(txt); }} 
            placeholder="Enter drug generic or brand name"
          />

          <InputField 
            label="Dosage" 
            value={dosage} 
            onChangeText={setDosage} 
            placeholder="e.g. 500mg, 5mg"
          />

          <InputField 
            label="Frequency" 
            value={frequency} 
            onChangeText={setFrequency} 
            placeholder="e.g. Once daily, Twice daily, As needed"
          />

          <InputField 
            label="Indication / Reason (optional)" 
            value={indication} 
            onChangeText={setIndication} 
            placeholder="e.g. Hypertension, Pain relief"
          />

          <View style={{ height: 20 }} />

          <GlowButton 
            label="Save Medication" 
            onPress={handleSave} 
            variant="primary" 
            size="lg" 
            fullWidth
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    marginLeft: 16,
    marginBottom: 0,
  },
  content: {
    flex: 1,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  suggestionScroll: {
    maxHeight: 56,
    marginBottom: 24,
  },
  suggestionContainer: {
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontSize: 13,
  },
  chipDose: {
    fontSize: 11,
  },
  form: {
    gap: 16,
    paddingBottom: 40,
  }
});

