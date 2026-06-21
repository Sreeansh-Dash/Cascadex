import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { InputField } from '@/components/ui/InputField';
import { GlowButton } from '@/components/ui/GlowButton';
import { router } from 'expo-router';
import { usePatientStore } from '@/store/patient.store';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '@/store/auth.store';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function AddMedication() {
  const { theme } = useTheme();
  const { addPatientMedication } = usePatientStore();

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [selectedDrug, setSelectedDrug] = useState<any>(null);
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [indication, setIndication] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length > 2) {
      const fetchResults = async () => {
        setIsSearching(true);
        try {
          const res = await apiClient.get(`/drugs/search?q=${encodeURIComponent(debouncedQuery)}`);
          setSearchResults(res.data);
          setShowResults(true);
        } catch (error) {
          console.error("Failed to search drugs", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      };
      fetchResults();
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [debouncedQuery]);

  const handleSelectDrug = (drug: any) => {
    setSelectedDrug(drug);
    setSearchQuery(drug.name);
    setShowResults(false);
    setErrorMsg('');
  };

  const handleSave = () => {
    setErrorMsg('');
    if (!selectedDrug && !searchQuery) {
      setErrorMsg('Please search and select a drug');
      return;
    }

    const nameToSave = selectedDrug ? selectedDrug.name : searchQuery;
    
    addPatientMedication({
      name: nameToSave.trim(),
      dose: dosage.trim() || '500mg',
      frequency: frequency.trim() || 'Once daily',
      indication: indication.trim() || 'General health',
      // If we adapted the store to accept drugbank_id, we would pass it here:
      // drugbank_id: selectedDrug?.drugbank_id
    });

    Alert.alert(
      'Medication Added',
      `${nameToSave} has been added to your profile.`,
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

        <View style={styles.form}>
          <View style={{ zIndex: 10 }}>
            <InputField 
              label="Search Drug" 
              value={searchQuery} 
              onChangeText={(txt) => {
                setSearchQuery(txt);
                setSelectedDrug(null);
                if (txt.length <= 2) setShowResults(false);
              }} 
              placeholder="Start typing to search..."
            />
            {isSearching && (
              <ActivityIndicator style={styles.loader} color={theme.colors.accent} />
            )}
            
            {showResults && searchResults.length > 0 && (
              <View style={[styles.resultsContainer, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.bgBorder }]}>
                <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={{ maxHeight: 200 }}>
                  {searchResults.map((item, index) => (
                    <TouchableOpacity 
                      key={item.drugbank_id || index}
                      style={[styles.resultItem, { borderBottomColor: theme.colors.bgBorder }]}
                      onPress={() => handleSelectDrug(item)}
                    >
                      <Text style={[styles.resultName, { color: theme.colors.textPrimary, fontFamily: theme.typography.subhead }]}>{item.name}</Text>
                      {item.description && (
                        <Text style={[styles.resultDesc, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]} numberOfLines={1}>
                          {item.description}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            {showResults && searchResults.length === 0 && !isSearching && searchQuery.length > 2 && (
              <View style={[styles.resultsContainer, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.bgBorder, padding: 12 }]}>
                <Text style={{ color: theme.colors.textMuted, fontFamily: theme.typography.body }}>No drugs found.</Text>
              </View>
            )}
          </View>

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
  form: {
    gap: 16,
    paddingBottom: 40,
  },
  loader: {
    position: 'absolute',
    right: 16,
    top: 36,
  },
  resultsContainer: {
    position: 'absolute',
    top: 76,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    zIndex: 100,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  resultName: {
    fontSize: 16,
    marginBottom: 4,
  },
  resultDesc: {
    fontSize: 12,
  }
});
