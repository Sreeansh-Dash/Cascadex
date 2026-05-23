import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useTheme } from '@/theme/ThemeContext';
import { InputField } from '@/components/ui/InputField';
import { Ionicons } from '@expo/vector-icons';

export default function ClinicianSearch() {
  const { theme } = useTheme();
  const [query, setQuery] = React.useState('');

  return (
    <ScreenContainer scrollable padding>
      <Text style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.typography.display }]}>Patient Search</Text>
      
      <InputField
        label="Lookup Patient"
        value={query}
        onChangeText={setQuery}
        placeholder="Enter Patient ID, Name, or Phone"
        leftIcon={<Ionicons name="search" size={20} color={theme.colors.textMuted} />}
      />

      <View style={styles.emptyState}>
        <Ionicons name="people-outline" size={64} color={theme.colors.bgBorder} />
        <Text style={[styles.emptyText, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>
          Search for a patient to view their metabolic graph and interaction history.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    marginBottom: 24,
  },
  emptyState: {
    flex: 1,
    marginTop: 64,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    lineHeight: 24,
  },
});
