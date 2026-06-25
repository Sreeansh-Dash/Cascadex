import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { api as apiClient } from '@/api/client';

export default function ChainDetails() {
  const { theme } = useTheme();
  const { chainId } = useLocalSearchParams<{ chainId: string }>();
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!chainId) return;

    setIsLoading(true);
    setExplanation('');
    setError('');

    // React Native's fetch doesn't stream well. We use XMLHttpRequest to read SSE chunks.
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${apiClient.defaults.baseURL}/explain/chain/${encodeURIComponent(chainId)}/stream`);
    if (apiClient.defaults.headers.common['Authorization']) {
      xhr.setRequestHeader('Authorization', apiClient.defaults.headers.common['Authorization'] as string);
    }

    let seenBytes = 0;

    xhr.onprogress = () => {
      setIsLoading(false);
      const newData = xhr.responseText.substring(seenBytes);
      seenBytes = xhr.responseText.length;

      // Parse SSE lines
      const lines = newData.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.substring(6).trim();
          if (!dataStr) continue;
          try {
            const data = JSON.parse(dataStr);
            if (data.text) {
              setExplanation(prev => prev + data.text);
            }
          } catch (e) {
            // Ignore parse errors for incomplete chunks
          }
        }
      }
    };

    xhr.onerror = () => {
      setIsLoading(false);
      setError('Failed to connect to AI explanation service.');
    };

    xhr.onloadend = () => {
      setIsLoading(false);
    };

    xhr.send();

    return () => {
      xhr.abort();
    };
  }, [chainId]);

  return (
    <ScreenContainer padding scrollable>
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} onPress={() => router.back()} />
        <View style={styles.headerTitle}>
          <SectionHeader title="Interaction Details" />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.bgBorder }]}>
        <Text style={[styles.chainId, { color: theme.colors.accent, fontFamily: theme.typography.mono }]}>
          {chainId?.replace(/:/g, ' → ')}
        </Text>

        {isLoading && explanation === '' && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.accent} />
            <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Analyzing interaction...</Text>
          </View>
        )}

        {error ? (
          <Text style={[styles.error, { color: theme.colors.dangerStrong }]}>{error}</Text>
        ) : null}

        <ScrollView style={styles.textContainer} showsVerticalScrollIndicator={false}>
          <TypewriterText text={explanation} delay={15} />
        </ScrollView>
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
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 200,
  },
  chainId: {
    fontSize: 12,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textContainer: {
    flex: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
  },
  error: {
    marginTop: 10,
    fontSize: 14,
  }
});
