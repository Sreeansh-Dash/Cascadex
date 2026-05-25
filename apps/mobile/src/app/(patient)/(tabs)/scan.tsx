import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Animated } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useTheme } from '@/theme/ThemeContext';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { usePatientStore } from '@/store/patient.store';
import { GlowButton } from '@/components/ui/GlowButton';
import { Ionicons } from '@expo/vector-icons';
import { findDrugInDb } from '@/services/mockData';

export default function PatientScan() {
  const { theme } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  
  // Manual Input State
  const [drugName, setDrugName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [indication, setIndication] = useState('');

  // Patient Store Action
  const { addPatientMedication } = usePatientStore();

  // Pulse animation for scan line
  const scanLineAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (mode === 'camera' && permission?.granted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 200,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          })
        ])
      ).start();
    }
  }, [mode, permission]);

  const handleBarcodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);

    // Simulate NDC Barcode matching
    // Map random barcodes to Aspirin or Paracetamol for the demo
    let foundDrugName = 'Aspirin';
    let foundDose = '100mg';
    
    if (data.endsWith('3') || data.includes('paracetamol') || data.includes('dolo')) {
      foundDrugName = 'Paracetamol';
      foundDose = '500mg';
    } else if (data.endsWith('5') || data.includes('penicillin')) {
      foundDrugName = 'Penicillin';
      foundDose = '250mg';
    } else if (data.includes('warfarin') || data.endsWith('2')) {
      foundDrugName = 'Warfarin';
      foundDose = '5mg';
    }

    Alert.alert(
      'Barcode Detected',
      `Identified medication: ${foundDrugName} ${foundDose}\nCode: ${data}`,
      [
        {
          text: 'Cancel',
          onPress: () => setScanned(false),
          style: 'cancel',
        },
        {
          text: 'Add to Graph',
          onPress: () => {
            addPatientMedication({
              name: foundDrugName,
              dose: foundDose,
              frequency: 'Once daily',
              indication: 'Scanned medication',
            });
            Alert.alert('Success', `${foundDrugName} added to your metabolic network.`);
            setScanned(false);
          },
        },
      ]
    );
  };

  const handleManualAdd = () => {
    if (!drugName) {
      Alert.alert('Error', 'Please enter a drug name.');
      return;
    }

    addPatientMedication({
      name: drugName.trim(),
      dose: dosage.trim() || '500mg',
      frequency: frequency.trim() || 'Once daily',
      indication: indication.trim() || 'General health',
    });

    Alert.alert('Success', `${drugName} added to your metabolic network.`);
    // Reset form
    setDrugName('');
    setDosage('');
    setIndication('');
  };

  const renderCamera = () => {
    if (!permission) {
      return (
        <View style={styles.center}>
          <Text style={{ color: theme.colors.textSecondary }}>Requesting camera permission...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.center}>
          <Ionicons name="camera-outline" size={64} color={theme.colors.textMuted} />
          <Text style={[styles.permissionText, { color: theme.colors.textPrimary, fontFamily: theme.typography.body }]}>
            Camera access is required to scan medication barcodes.
          </Text>
          <GlowButton label="Grant Permission" onPress={requestPermission} variant="primary" size="md" />
          <TouchableOpacity onPress={() => setMode('manual')} style={styles.switchModeLink}>
            <Text style={{ color: theme.colors.accent, fontFamily: theme.typography.subhead }}>
              Enter Drug Name Manually
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        >
          {/* Scanning Box Overlay */}
          <View style={styles.overlay}>
            <View style={[styles.scannerBox, { borderColor: theme.colors.accent }]}>
              {/* Corner Brackets */}
              <View style={[styles.corner, styles.topLeft, { borderColor: theme.colors.accent }]} />
              <View style={[styles.corner, styles.topRight, { borderColor: theme.colors.accent }]} />
              <View style={[styles.corner, styles.bottomLeft, { borderColor: theme.colors.accent }]} />
              <View style={[styles.corner, styles.bottomRight, { borderColor: theme.colors.accent }]} />
              
              {/* Pulsing Laser line */}
              <Animated.View 
                style={[
                  styles.scanLine, 
                  { 
                    backgroundColor: theme.colors.accent,
                    transform: [{ translateY: scanLineAnim }] 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.scanInstruction, { color: '#ffffff', fontFamily: theme.typography.mono }]}>
              Align barcode inside the frame
            </Text>
          </View>
        </CameraView>
      </View>
    );
  };

  const renderManual = () => {
    return (
      <View style={styles.manualContainer}>
        <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono }]}>
          Drug Name
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.inputBorder, color: theme.colors.textPrimary, fontFamily: theme.typography.body }]}
          value={drugName}
          onChangeText={setDrugName}
          placeholder="e.g. Paracetamol, Penicillin, Aspirin"
          placeholderTextColor={theme.colors.textMuted}
        />

        <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono, marginTop: 12 }]}>
          Dosage (e.g. 500mg, 5mg)
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.inputBorder, color: theme.colors.textPrimary, fontFamily: theme.typography.body }]}
          value={dosage}
          onChangeText={setDosage}
          placeholder="e.g. 500mg"
          placeholderTextColor={theme.colors.textMuted}
        />

        <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono, marginTop: 12 }]}>
          Frequency
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.inputBorder, color: theme.colors.textPrimary, fontFamily: theme.typography.body }]}
          value={frequency}
          onChangeText={setFrequency}
          placeholder="e.g. Once daily, Twice daily"
          placeholderTextColor={theme.colors.textMuted}
        />

        <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono, marginTop: 12 }]}>
          Indication / Reason (optional)
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.inputBorder, color: theme.colors.textPrimary, fontFamily: theme.typography.body }]}
          value={indication}
          onChangeText={setIndication}
          placeholder="e.g. Fever, Blood thinning"
          placeholderTextColor={theme.colors.textMuted}
        />

        <View style={{ height: 24 }} />

        <GlowButton
          label="Add Medication"
          onPress={handleManualAdd}
          variant="primary"
          size="lg"
          fullWidth
        />
      </View>
    );
  };

  return (
    <ScreenContainer hasTabBar={true}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.typography.display }]}>
          {mode === 'camera' ? 'Scan Medication' : 'Add Medication'}
        </Text>
        
        {/* Toggle Button */}
        <TouchableOpacity 
          style={[styles.toggleBtn, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.bgBorder }]}
          onPress={() => setMode(mode === 'camera' ? 'manual' : 'camera')}
        >
          <Ionicons 
            name={mode === 'camera' ? 'create-outline' : 'camera-outline'} 
            size={18} 
            color={theme.colors.accent} 
          />
          <Text style={[styles.toggleBtnText, { color: theme.colors.textPrimary, fontFamily: theme.typography.subhead }]}>
            {mode === 'camera' ? 'Type Manually' : 'Use Camera'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {mode === 'camera' ? renderCamera() : renderManual()}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  toggleBtnText: {
    fontSize: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  switchModeLink: {
    marginTop: 20,
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    height: 380,
    position: 'relative',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerBox: {
    width: 220,
    height: 220,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  scanLine: {
    width: '100%',
    height: 2,
    shadowColor: '#fff',
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderWidth: 3,
  },
  topLeft: {
    top: -1,
    left: -1,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: -1,
    right: -1,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: -1,
    left: -1,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: -1,
    right: -1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanInstruction: {
    marginTop: 20,
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    overflow: 'hidden',
  },
  manualContainer: {
    flex: 1,
    paddingTop: 10,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});
