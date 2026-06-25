import React from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useTheme } from '@/theme/ThemeContext';
import { GlowButton } from '@/components/ui/GlowButton';
import { useAppStore } from '@/store/app.store';
import { usePatientStore } from '@/store/patient.store';

export default function PatientProfile() {
  const { theme } = useTheme();
  const { patientId, displayName, appVersion, resetAppData } = useAppStore();
  const { clearPatientData } = usePatientStore();

  const handleResetData = () => {
    Alert.alert(
      'Reset App Data',
      'This will clear all your medications and history, and generate a new device ID. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            clearPatientData();
            resetAppData();
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer scrollable padding hasTabBar={true}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.typography.display }]}>Profile</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.bgBorder }]}>
        <View style={styles.viewDetails}>
          <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono }]}>Display Name</Text>
          <Text style={[styles.value, { color: theme.colors.textPrimary, fontFamily: theme.typography.heading }]}>
            {displayName || 'Anonymous User'}
          </Text>

          <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono, marginTop: 16 }]}>Device Patient ID</Text>
          <Text style={[styles.idValue, { color: theme.colors.textPrimary, fontFamily: theme.typography.mono }]} numberOfLines={1} ellipsizeMode="middle">
            {patientId}
          </Text>

          <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: theme.typography.mono, marginTop: 16 }]}>App Version</Text>
          <Text style={[styles.value, { color: theme.colors.textPrimary, fontFamily: theme.typography.body }]}>{appVersion}</Text>

          <View style={[styles.privacyNote, { backgroundColor: theme.colors.bgPrimary, borderColor: theme.colors.bgBorder }]}>
            <Text style={[styles.privacyText, { color: theme.colors.textSecondary, fontFamily: theme.typography.body }]}>
              🔒 Cascadex is fully local-first. No account, no email, no server login. Your data stays on your device.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.resetBtn}>
        <GlowButton
          label="Reset App Data"
          onPress={handleResetData}
          variant="destructive"
          size="md"
          fullWidth
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  title: {
    fontSize: 32,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  label: {
    fontSize: 10,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
  },
  idValue: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
  viewDetails: {
    gap: 2,
  },
  privacyNote: {
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  privacyText: {
    fontSize: 13,
    lineHeight: 20,
  },
  resetBtn: {
    marginBottom: 40,
  },
});
