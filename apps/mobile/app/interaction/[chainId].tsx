/**
 * Chain Explainer Screen — Full Interaction Chain Deep-Dive
 * Shows: Drug A → Enzyme → Drug B → Metabolite → Receptor pathway
 * With Groq-powered plain-English explanation (typewriter effect)
 */
import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Circle, Line, Rect, Text as SvgText, G } from 'react-native-svg';
import { COLORS } from '../../src/theme/colors';
import { TOKENS } from '../../src/theme/tokens';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { GlowButton } from '../../src/components/ui/GlowButton';
import { DangerBadge } from '../../src/components/ui/DangerBadge';
import { TypewriterText } from '../../src/components/ui/TypewriterText';
import { BioLoader } from '../../src/components/ui/BioLoader';
import { useInteractionsStore } from '../../src/store/interactions.store';

const { width: SCREEN_W } = Dimensions.get('window');
const CHAIN_SVG_WIDTH = SCREEN_W - 32;
const CHAIN_SVG_HEIGHT = 140;

// Demo chain detail
const DEMO_CHAIN = {
  chain_id: 'DB00472:DB00318:CYP2D6',
  perpetrator: { drugbank_id: 'DB00472', name: 'Fluoxetine', class: 'SSRI' },
  victim: { drugbank_id: 'DB00318', name: 'Codeine', class: 'Opioid Analgesic' },
  enzyme: { name: 'CYP2D6', family: 'CYP450', function: 'Metabolizes ~25% of clinical drugs' },
  metabolites: [{ name: 'Morphine', active: true, toxicity_threshold: '120 ng/mL' }],
  receptors: [{ name: 'μ-Opioid', effect: 'Pain relief, respiratory depression', risk_category: 'HIGH' }],
  overall_severity: 'critical',
};

const DEMO_EXPLANATION = 
  "Fluoxetine (Prozac) blocks an enzyme in your liver called CYP2D6. "
  + "Your body needs this enzyme to convert Codeine into Morphine, which is what actually relieves pain. "
  + "With CYP2D6 blocked, Codeine can't work properly — you won't get pain relief, "
  + "and Codeine may build up to unsafe levels. Talk to your pharmacist about alternatives.";

interface ChainNode {
  label: string;
  type: 'drug' | 'enzyme' | 'metabolite' | 'receptor';
  role?: string;
}

export default function ChainExplainerScreen() {
  const { chainId } = useLocalSearchParams<{ chainId: string }>();
  const router = useRouter();
  const {
    selectedChain,
    explanation,
    isLoadingDetail,
    isLoadingExplanation,
    fetchChainDetail,
    fetchExplanation,
  } = useInteractionsStore();

  useEffect(() => {
    if (chainId) {
      fetchChainDetail(chainId);
      fetchExplanation(chainId);
    }
  }, [chainId]);

  const chain = selectedChain || DEMO_CHAIN;
  const explanationText = explanation || DEMO_EXPLANATION;

  // Build the chain pathway for SVG
  const chainNodes: ChainNode[] = useMemo(() => {
    const nodes: ChainNode[] = [
      { label: chain.perpetrator.name, type: 'drug', role: 'Perpetrator' },
      { label: chain.enzyme.name, type: 'enzyme', role: 'Enzyme' },
      { label: chain.victim.name, type: 'drug', role: 'Victim' },
    ];
    if (chain.metabolites?.[0]) {
      nodes.push({ label: chain.metabolites[0].name, type: 'metabolite', role: 'Metabolite' });
    }
    if (chain.receptors?.[0]) {
      nodes.push({ label: chain.receptors[0].name, type: 'receptor', role: 'Receptor' });
    }
    return nodes;
  }, [chain]);

  const nodeColors: Record<string, string> = {
    drug: COLORS.graph.drug,
    enzyme: COLORS.graph.enzyme,
    metabolite: COLORS.graph.metabolite,
    receptor: COLORS.graph.receptor,
  };

  const nodeSpacing = CHAIN_SVG_WIDTH / (chainNodes.length + 1);
  const nodeY = CHAIN_SVG_HEIGHT / 2;

  const severity = (chain.overall_severity as string) === 'critical' ? 'critical'
    : (chain.overall_severity as string) === 'moderate' ? 'moderate'
    : 'safe';

  return (
    <SafeAreaView style={styles.container}>
      {/* Close button */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.topBarLabel}>INTERACTION CHAIN</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoadingDetail && !selectedChain ? (
          <View style={styles.loaderContainer}>
            <BioLoader size={80} />
            <Text style={styles.loaderText}>TRACING BIOCHEMICAL PATHWAY</Text>
          </View>
        ) : (
          <>
            {/* Chain Diagram */}
            <GlassCard variant="default" style={styles.diagramCard}>
              <Text style={styles.diagramLabel}>PATHWAY</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Svg
                  width={Math.max(CHAIN_SVG_WIDTH, chainNodes.length * 120)}
                  height={CHAIN_SVG_HEIGHT}
                >
                  {/* Connection lines */}
                  {chainNodes.map((node, i) => {
                    if (i === chainNodes.length - 1) return null;
                    const x1 = nodeSpacing * (i + 1) + 30;
                    const x2 = nodeSpacing * (i + 2) - 30;
                    return (
                      <G key={`line-${i}`}>
                        <Line
                          x1={x1}
                          y1={nodeY}
                          x2={x2}
                          y2={nodeY}
                          stroke={i === 0 ? COLORS.danger : COLORS.glow.teal}
                          strokeWidth={2}
                          strokeDasharray={i === 0 ? undefined : '6,4'}
                        />
                        {/* Arrow head */}
                        <SvgText
                          x={(x1 + x2) / 2}
                          y={nodeY - 12}
                          textAnchor="middle"
                          fill={COLORS.text.muted}
                          fontSize={8}
                          fontFamily="SpaceMono_400Regular"
                        >
                          {i === 0 ? 'INHIBITS' : i === 1 ? 'BLOCKS' : i === 2 ? 'PRODUCES' : 'BINDS'}
                        </SvgText>
                      </G>
                    );
                  })}

                  {/* Nodes */}
                  {chainNodes.map((node, i) => {
                    const cx = nodeSpacing * (i + 1);
                    const color = nodeColors[node.type];
                    return (
                      <G key={`node-${i}`}>
                        {/* Pill shape for drugs, circle for others */}
                        <Rect
                          x={cx - 30}
                          y={nodeY - 18}
                          width={60}
                          height={36}
                          rx={18}
                          fill={color}
                          opacity={0.15}
                          stroke={color}
                          strokeWidth={1.5}
                          strokeOpacity={0.6}
                        />
                        <SvgText
                          x={cx}
                          y={nodeY + 4}
                          textAnchor="middle"
                          fill={color}
                          fontSize={10}
                          fontFamily="SpaceMono_400Regular"
                        >
                          {node.label.length > 8 ? node.label.slice(0, 7) + '…' : node.label}
                        </SvgText>
                        {/* Role label */}
                        <SvgText
                          x={cx}
                          y={nodeY + 35}
                          textAnchor="middle"
                          fill={COLORS.text.muted}
                          fontSize={8}
                          fontFamily="SpaceMono_400Regular"
                        >
                          {node.role?.toUpperCase()}
                        </SvgText>
                      </G>
                    );
                  })}
                </Svg>
              </ScrollView>
            </GlassCard>

            {/* Severity & Summary */}
            <GlassCard
              variant={severity === 'critical' ? 'danger' : severity === 'moderate' ? 'warning' : 'default'}
              glowIntensity="medium"
              style={styles.severityCard}
            >
              <View style={styles.severityHeader}>
                <DangerBadge severity={severity} />
                <Text style={styles.severityLabel}>SEVERITY ASSESSMENT</Text>
              </View>

              <View style={styles.meterContainer}>
                <View style={styles.meterTrack}>
                  <View
                    style={[
                      styles.meterFill,
                      {
                        width: severity === 'critical' ? '90%' : severity === 'moderate' ? '55%' : '20%',
                        backgroundColor: severity === 'critical' ? COLORS.danger
                          : severity === 'moderate' ? COLORS.warning
                          : COLORS.safe,
                      },
                    ]}
                  />
                </View>
                <View style={styles.meterLabels}>
                  <Text style={styles.meterLabel}>LOW</Text>
                  <Text style={styles.meterLabel}>HIGH</Text>
                </View>
              </View>

              {/* Drug pair info */}
              <View style={styles.drugPair}>
                <View style={styles.drugInfo}>
                  <Text style={styles.drugRole}>PERPETRATOR</Text>
                  <Text style={[styles.drugPairName, { color: COLORS.secondary }]}>
                    {chain.perpetrator.name}
                  </Text>
                  <Text style={styles.drugClass}>{chain.perpetrator.class}</Text>
                </View>
                <View style={styles.vsContainer}>
                  <Text style={styles.vsText}>⚡</Text>
                </View>
                <View style={styles.drugInfo}>
                  <Text style={styles.drugRole}>VICTIM</Text>
                  <Text style={[styles.drugPairName, { color: COLORS.danger }]}>
                    {chain.victim.name}
                  </Text>
                  <Text style={styles.drugClass}>{chain.victim.class}</Text>
                </View>
              </View>
            </GlassCard>

            {/* Enzyme Detail */}
            <GlassCard variant="default" style={styles.enzymeCard}>
              <Text style={styles.sectionLabel}>VIA ENZYME</Text>
              <Text style={styles.enzymeName}>{chain.enzyme.name}</Text>
              <Text style={styles.enzymeDetail}>Family: {chain.enzyme.family}</Text>
              {chain.enzyme.function && (
                <Text style={styles.enzymeDetail}>{chain.enzyme.function}</Text>
              )}
            </GlassCard>

            {/* AI Explanation */}
            <GlassCard variant="default" style={styles.explanationCard}>
              <View style={styles.explanationHeader}>
                <Text style={styles.sectionLabel}>WHAT THIS MEANS FOR YOU</Text>
                <Text style={styles.aiLabel}>AI · GROQ</Text>
              </View>
              {isLoadingExplanation && !explanation ? (
                <View style={styles.explanationLoading}>
                  <BioLoader size={40} />
                  <Text style={styles.explanationLoadingText}>Generating explanation...</Text>
                </View>
              ) : (
                <TypewriterText
                  text={explanationText}
                  speed={25}
                  style={styles.explanationText}
                />
              )}
            </GlassCard>

            {/* CTA */}
            <View style={styles.ctaContainer}>
              <GlowButton
                title="EXPORT TO PHARMACIST"
                onPress={() => {
                  // In production: generate PDF + share
                  router.back();
                }}
                variant="teal"
                size="lg"
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.void,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: TOKENS.spacing.md,
    paddingVertical: TOKENS.spacing.sm,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bg.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    color: COLORS.text.secondary,
  },
  topBarLabel: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 11,
    color: COLORS.text.muted,
    letterSpacing: 3,
  },
  scrollContent: {
    paddingHorizontal: TOKENS.spacing.md,
    paddingBottom: 40,
    gap: 16,
  },
  loaderContainer: {
    paddingTop: 100,
    alignItems: 'center',
    gap: 24,
  },
  loaderText: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 11,
    color: COLORS.text.muted,
    letterSpacing: 3,
  },
  diagramCard: {
    paddingVertical: TOKENS.spacing.md,
  },
  diagramLabel: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 10,
    color: COLORS.text.muted,
    letterSpacing: 3,
    marginBottom: 8,
    paddingLeft: TOKENS.spacing.sm,
  },
  severityCard: {
    gap: 16,
  },
  severityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  severityLabel: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 10,
    color: COLORS.text.muted,
    letterSpacing: 2,
  },
  meterContainer: {
    gap: 6,
  },
  meterTrack: {
    height: 8,
    backgroundColor: COLORS.bg.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 4,
  },
  meterLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meterLabel: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 8,
    color: COLORS.text.muted,
    letterSpacing: 2,
  },
  drugPair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  drugInfo: {
    flex: 1,
    alignItems: 'center',
  },
  drugRole: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 9,
    color: COLORS.text.muted,
    letterSpacing: 2,
    marginBottom: 4,
  },
  drugPairName: {
    fontFamily: 'Syne_700Bold',
    fontSize: 18,
  },
  drugClass: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  vsContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.glow.magenta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    fontSize: 16,
  },
  enzymeCard: {
    gap: 4,
  },
  sectionLabel: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 10,
    color: COLORS.text.muted,
    letterSpacing: 2,
    marginBottom: 4,
  },
  enzymeName: {
    fontFamily: 'Syne_700Bold',
    fontSize: 22,
    color: COLORS.enzyme,
  },
  enzymeDetail: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  explanationCard: {
    gap: 12,
  },
  explanationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiLabel: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 9,
    color: COLORS.primary,
    letterSpacing: 2,
  },
  explanationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  explanationLoadingText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  explanationText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 15,
    color: COLORS.text.primary,
    lineHeight: 24,
  },
  ctaContainer: {
    paddingTop: 8,
    alignItems: 'center',
  },
});
