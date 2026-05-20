/**
 * Alerts Screen — Active Drug Interactions
 * Sorted list of dangerous interactions in patient's current medication set.
 */
import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/theme/colors';
import { TOKENS } from '../../src/theme/tokens';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { DangerBadge } from '../../src/components/ui/DangerBadge';
import { BioLoader } from '../../src/components/ui/BioLoader';
import { useInteractionsStore } from '../../src/store/interactions.store';
import { usePatientStore } from '../../src/store/patient.store';
import type { InteractionChain } from '../../src/api/interactions.api';

// Demo interactions for offline mode
const DEMO_INTERACTIONS: InteractionChain[] = [
  {
    perpetrator: 'Fluoxetine',
    perpetrator_id: 'DB00472',
    victim_drug: 'Codeine',
    victim_id: 'DB00318',
    via_enzyme: 'CYP2D6',
    enzyme_family: 'CYP450',
    strengths: ['strong'],
    interaction_type: 'INHIBITS',
    consequence: 'Codeine metabolism blocked — reduced pain relief, potential toxicity',
  },
  {
    perpetrator: 'Fluvoxamine',
    perpetrator_id: 'DB00176',
    victim_drug: 'Theophylline',
    victim_id: 'DB00277',
    via_enzyme: 'CYP1A2',
    enzyme_family: 'CYP450',
    strengths: ['strong'],
    interaction_type: 'INHIBITS',
    consequence: 'Theophylline accumulation — risk of seizures and cardiac arrhythmia',
  },
  {
    perpetrator: 'Phenobarbital',
    perpetrator_id: 'DB01174',
    victim_drug: 'Warfarin',
    victim_id: 'DB00682',
    via_enzyme: 'CYP3A4',
    enzyme_family: 'CYP450',
    strengths: ['moderate'],
    interaction_type: 'INDUCES',
    consequence: 'Warfarin metabolized faster — reduced anticoagulant effect',
  },
  {
    perpetrator: 'Cimetidine',
    perpetrator_id: 'DB00501',
    victim_drug: 'Metoprolol',
    victim_id: 'DB00264',
    via_enzyme: 'CYP2D6',
    enzyme_family: 'CYP450',
    strengths: ['weak'],
    interaction_type: 'INHIBITS',
    consequence: 'Minor increase in Metoprolol levels — monitor blood pressure',
  },
];

const getSeverity = (strengths: string[]): 'critical' | 'moderate' | 'safe' => {
  if (strengths.some((s) => s === 'strong')) return 'critical';
  if (strengths.some((s) => s === 'moderate')) return 'moderate';
  return 'safe';
};

const getChainId = (chain: InteractionChain) =>
  `${chain.perpetrator_id}:${chain.victim_id}:${chain.via_enzyme}`;

export default function AlertsScreen() {
  const router = useRouter();
  const { patientId } = usePatientStore();
  const {
    chains,
    isLoadingChains,
    fetchChains,
    criticalCount,
    moderateCount,
    dismissedChainIds,
  } = useInteractionsStore();

  useEffect(() => {
    fetchChains(patientId);
  }, [patientId]);

  const displayChains = chains.length > 0 ? chains : DEMO_INTERACTIONS;
  const activeChains = displayChains.filter(
    (c) => !dismissedChainIds.includes(getChainId(c))
  );

  // Sort: critical first, then moderate, then safe
  const sortedChains = [...activeChains].sort((a, b) => {
    const order = { critical: 0, moderate: 1, safe: 2 };
    return order[getSeverity(a.strengths)] - order[getSeverity(b.strengths)];
  });

  const handleRefresh = useCallback(() => {
    fetchChains(patientId);
  }, [patientId]);

  const renderItem = ({ item, index }: { item: InteractionChain; index: number }) => {
    const severity = getSeverity(item.strengths);
    const chainId = getChainId(item);
    const borderColor = severity === 'critical' ? COLORS.danger
      : severity === 'moderate' ? COLORS.warning
      : COLORS.safe;

    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          { opacity: 1 }, // Could add stagger animation
        ]}
      >
        <GlassCard
          variant={severity === 'critical' ? 'danger' : severity === 'moderate' ? 'warning' : 'default'}
          glowIntensity={severity === 'critical' ? 'medium' : 'low'}
          onPress={() => router.push(`/interaction/${chainId}`)}
          style={styles.interactionCard}
        >
          {/* Left severity bar */}
          <View style={[styles.severityBar, { backgroundColor: borderColor }]} />

          <View style={styles.cardContent}>
            {/* Chain summary */}
            <View style={styles.chainRow}>
              <Text style={[styles.drugName, { color: COLORS.secondary }]}>
                {item.perpetrator}
              </Text>
              <Text style={styles.arrow}>→</Text>
              <Text style={[styles.enzymeName, { color: COLORS.enzyme }]}>
                {item.via_enzyme}
              </Text>
              <Text style={styles.arrow}>→</Text>
              <Text style={[styles.drugName, { color: borderColor }]}>
                {item.victim_drug}
              </Text>
            </View>

            {/* Consequence */}
            <Text style={styles.consequence} numberOfLines={2}>
              {item.consequence}
            </Text>

            {/* Footer */}
            <View style={styles.cardFooter}>
              <DangerBadge severity={severity} compact />
              <Text style={styles.mechanism}>
                {item.interaction_type === 'INHIBITS' ? 'INHIBITS' : 'INDUCES'}
              </Text>
            </View>
          </View>
        </GlassCard>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Active Interactions</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{sortedChains.length}</Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          {(criticalCount > 0 || chains.length === 0) && (
            <DangerBadge severity="critical" count={chains.length > 0 ? criticalCount : 2} compact />
          )}
          {(moderateCount > 0 || chains.length === 0) && (
            <DangerBadge severity="moderate" count={chains.length > 0 ? moderateCount : 1} compact />
          )}
        </View>
      </View>

      {/* List */}
      {isLoadingChains && chains.length === 0 ? (
        <View style={styles.loaderContainer}>
          <BioLoader size={80} />
          <Text style={styles.loaderText}>SCANNING INTERACTION CHAINS</Text>
        </View>
      ) : (
        <FlatList
          data={sortedChains}
          keyExtractor={(item) => getChainId(item)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingChains}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>⬡</Text>
              <Text style={styles.emptyTitle}>No Interactions</Text>
              <Text style={styles.emptyText}>
                Your current medications have no detected interactions.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.void,
  },
  header: {
    paddingHorizontal: TOKENS.spacing.lg,
    paddingTop: TOKENS.spacing.md,
    paddingBottom: TOKENS.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  headerTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: 26,
    color: COLORS.text.primary,
  },
  countBadge: {
    backgroundColor: COLORS.glow.magenta,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: TOKENS.radius.pill,
  },
  countText: {
    fontFamily: 'SpaceMono_700Bold',
    fontSize: 14,
    color: COLORS.danger,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  list: {
    paddingHorizontal: TOKENS.spacing.md,
    paddingBottom: 100,
    gap: 12,
  },
  cardWrapper: {
    marginBottom: 0,
  },
  interactionCard: {
    flexDirection: 'row',
    padding: 0,
    overflow: 'hidden',
  },
  severityBar: {
    width: 4,
    borderTopLeftRadius: TOKENS.radius.lg,
    borderBottomLeftRadius: TOKENS.radius.lg,
  },
  cardContent: {
    flex: 1,
    padding: TOKENS.spacing.md,
  },
  chainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  drugName: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 15,
  },
  enzymeName: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  arrow: {
    fontFamily: 'IBMPlexSans_300Light',
    fontSize: 14,
    color: COLORS.text.muted,
  },
  consequence: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mechanism: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 9,
    color: COLORS.text.muted,
    letterSpacing: 2,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  loaderText: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 11,
    color: COLORS.text.muted,
    letterSpacing: 3,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 48,
    color: COLORS.primary,
    opacity: 0.3,
  },
  emptyTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: 20,
    color: COLORS.text.primary,
  },
  emptyText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
