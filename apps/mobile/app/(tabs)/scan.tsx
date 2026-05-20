/**
 * Scan Screen — Medication Barcode Scanner
 * Full-screen camera with animated targeting overlay.
 * Falls back to manual drug name entry.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/theme/colors';
import { TOKENS } from '../../src/theme/tokens';
import { ScanOverlay } from '../../src/components/ui/ScanOverlay';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { GlowButton } from '../../src/components/ui/GlowButton';
import { DangerBadge } from '../../src/components/ui/DangerBadge';
import { BioLoader } from '../../src/components/ui/BioLoader';
import { usePatientStore } from '../../src/store/patient.store';
import { useInteractionsStore } from '../../src/store/interactions.store';
import * as drugsApi from '../../src/api/drugs.api';

interface ScannedDrug {
  drugbank_id: string;
  name: string;
  class?: string;
  description?: string;
}

export default function ScanScreen() {
  const router = useRouter();
  const { addMedication, isAddingMed, patientId } = usePatientStore();
  const { simulateAdd, simulation, isSimulating, clearSimulation } = useInteractionsStore();

  const [mode, setMode] = useState<'scan' | 'manual'>('scan');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [scannedDrug, setScannedDrug] = useState<ScannedDrug | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const slideAnim = useState(new Animated.Value(300))[0];

  const handleDrugFound = useCallback(async (drug: ScannedDrug) => {
    setScannedDrug(drug);
    setIsLocked(true);

    // Simulate interactions
    await simulateAdd(patientId, drug.drugbank_id);

    // Slide up the result card
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [patientId]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await drugsApi.lookupDrug(searchQuery.trim());
      if (results && results.length > 0) {
        const drug = results[0];
        handleDrugFound({
          drugbank_id: drug.drugbank_id,
          name: drug.name,
          class: drug.class,
          description: drug.description,
        });
      } else {
        Alert.alert('Not Found', `No drug found matching "${searchQuery}"`);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to search. Check your connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToNetwork = async () => {
    if (!scannedDrug) return;
    await addMedication({ drugbank_id: scannedDrug.drugbank_id });
    clearSimulation();
    setScannedDrug(null);
    setIsLocked(false);
    slideAnim.setValue(300);
    router.back();
  };

  const resetScan = () => {
    setScannedDrug(null);
    setIsLocked(false);
    clearSimulation();
    slideAnim.setValue(300);
    setSearchQuery('');
  };

  return (
    <SafeAreaView style={styles.container}>
      {mode === 'scan' ? (
        <View style={styles.scanArea}>
          {/* Simulated camera background */}
          <View style={styles.cameraPlaceholder}>
            <View style={styles.gridOverlay}>
              {Array.from({ length: 20 }).map((_, i) => (
                <View
                  key={`h-${i}`}
                  style={[
                    styles.gridLine,
                    { top: `${(i + 1) * 5}%`, left: 0, right: 0, height: 1 },
                  ]}
                />
              ))}
              {Array.from({ length: 12 }).map((_, i) => (
                <View
                  key={`v-${i}`}
                  style={[
                    styles.gridLine,
                    { left: `${(i + 1) * 8.3}%`, top: 0, bottom: 0, width: 1 },
                  ]}
                />
              ))}
            </View>
            <ScanOverlay isLocked={isLocked} drugName={scannedDrug?.name} />
          </View>

          {/* Switch to manual */}
          <TouchableOpacity
            style={styles.manualLink}
            onPress={() => setMode('manual')}
          >
            <Text style={styles.manualLinkText}>TYPE DRUG NAME INSTEAD</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.manualArea}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Text style={styles.manualTitle}>Search Medication</Text>
          <Text style={styles.manualSub}>Enter the drug name to look it up</Text>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="e.g. Fluoxetine, Codeine..."
              placeholderTextColor={COLORS.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <GlowButton
              title={isSearching ? '...' : 'SEARCH'}
              onPress={handleSearch}
              variant="teal"
              size="sm"
              loading={isSearching}
            />
          </View>

          <TouchableOpacity
            style={styles.manualLink}
            onPress={() => { setMode('scan'); resetScan(); }}
          >
            <Text style={styles.manualLinkText}>BACK TO SCANNER</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      )}

      {/* Result Card */}
      {scannedDrug && (
        <Animated.View
          style={[
            styles.resultCard,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <GlassCard variant="default" glowIntensity="medium">
            <View style={styles.resultHeader}>
              <View>
                <Text style={styles.resultName}>{scannedDrug.name}</Text>
                {scannedDrug.class && (
                  <Text style={styles.resultClass}>{scannedDrug.class}</Text>
                )}
              </View>
              <TouchableOpacity onPress={resetScan}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Simulation Results */}
            {isSimulating ? (
              <View style={styles.simLoading}>
                <BioLoader size={40} />
                <Text style={styles.simLoadingText}>Analyzing interactions...</Text>
              </View>
            ) : simulation ? (
              <View style={styles.simResults}>
                {simulation.new_interactions_count > 0 ? (
                  <>
                    <DangerBadge
                      severity="critical"
                      count={simulation.new_interactions_count}
                    />
                    <Text style={styles.simWarning}>
                      {simulation.new_interactions_count} potential interaction{simulation.new_interactions_count > 1 ? 's' : ''} detected
                    </Text>
                  </>
                ) : (
                  <>
                    <DangerBadge severity="safe" />
                    <Text style={styles.simSafe}>No interactions detected</Text>
                  </>
                )}
              </View>
            ) : null}

            <GlowButton
              title="ADD TO NETWORK"
              onPress={handleAddToNetwork}
              variant={simulation && simulation.new_interactions_count > 0 ? 'magenta' : 'teal'}
              loading={isAddingMed}
              style={styles.addButton}
            />
          </GlassCard>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.void,
  },
  scanArea: {
    flex: 1,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#050810',
    position: 'relative',
    overflow: 'hidden',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 229, 255, 0.04)',
  },
  manualLink: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  manualLinkText: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 11,
    color: COLORS.secondary,
    letterSpacing: 2,
  },
  manualArea: {
    flex: 1,
    paddingHorizontal: TOKENS.spacing.lg,
    paddingTop: TOKENS.spacing.xl,
  },
  manualTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: 26,
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  manualSub: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.bg.surface,
    borderWidth: 1,
    borderColor: COLORS.bg.border,
    borderRadius: TOKENS.radius.md,
    paddingHorizontal: 16,
    color: COLORS.text.primary,
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 15,
  },
  resultCard: {
    position: 'absolute',
    bottom: 100,
    left: TOKENS.spacing.md,
    right: TOKENS.spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  resultName: {
    fontFamily: 'Syne_700Bold',
    fontSize: 22,
    color: COLORS.text.primary,
  },
  resultClass: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 11,
    color: COLORS.text.secondary,
    letterSpacing: 1,
    marginTop: 4,
  },
  closeBtn: {
    fontSize: 20,
    color: COLORS.text.muted,
    padding: 4,
  },
  simLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  simLoadingText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  simResults: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  simWarning: {
    fontFamily: 'IBMPlexSans_500Medium',
    fontSize: 13,
    color: COLORS.danger,
    flex: 1,
  },
  simSafe: {
    fontFamily: 'IBMPlexSans_500Medium',
    fontSize: 13,
    color: COLORS.safe,
  },
  addButton: {
    marginTop: 12,
    alignSelf: 'stretch',
  },
});
