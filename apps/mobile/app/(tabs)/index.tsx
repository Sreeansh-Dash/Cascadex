/**
 * Home Screen — Drug Metabolic Network Graph
 * Full-screen graph visualization with SVG rendering.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Line,
  Defs,
  RadialGradient,
  Stop,
  G,
  Text as SvgText,
} from 'react-native-svg';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/theme/colors';
import { TOKENS } from '../../src/theme/tokens';
import { TYPE_SCALE } from '../../src/theme/typography';
import { DangerBadge } from '../../src/components/ui/DangerBadge';
import { GlowButton } from '../../src/components/ui/GlowButton';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { BioLoader } from '../../src/components/ui/BioLoader';
import { usePatientStore } from '../../src/store/patient.store';
import type { GraphNode, GraphEdge } from '../../src/api/patient.api';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const GRAPH_H = SCREEN_H * 0.55;
const NODE_RADIUS: Record<string, number> = {
  drug: 28,
  enzyme: 22,
  metabolite: 18,
  receptor: 16,
};
const NODE_COLORS: Record<string, string> = {
  drug: COLORS.graph.drug,
  enzyme: COLORS.graph.enzyme,
  metabolite: COLORS.graph.metabolite,
  receptor: COLORS.graph.receptor,
};

// ---------------------------------------------------------------------------
// Demo graph data for offline / demo mode
// ---------------------------------------------------------------------------
const DEMO_GRAPH: { nodes: GraphNode[]; edges: GraphEdge[] } = {
  nodes: [
    { id: 'DB00472', label: 'Fluoxetine', type: 'drug', drug_class: 'SSRI' },
    { id: 'DB00318', label: 'Codeine', type: 'drug', drug_class: 'Opioid' },
    { id: 'DB01050', label: 'Ibuprofen', type: 'drug', drug_class: 'NSAID' },
    { id: 'DB00176', label: 'Fluvoxamine', type: 'drug', drug_class: 'SSRI' },
    { id: 'DB01174', label: 'Phenobarbital', type: 'drug', drug_class: 'Barbiturate' },
    { id: 'CYP2D6', label: 'CYP2D6', type: 'enzyme', family: 'CYP450' },
    { id: 'CYP3A4', label: 'CYP3A4', type: 'enzyme', family: 'CYP450' },
    { id: 'CYP1A2', label: 'CYP1A2', type: 'enzyme', family: 'CYP450' },
    { id: 'Morphine', label: 'Morphine', type: 'metabolite', active: true },
    { id: 'Norfluoxetine', label: 'Norfluoxetine', type: 'metabolite', active: true },
    { id: 'MU_Opioid', label: 'μ-Opioid', type: 'receptor', effect: 'Pain relief' },
    { id: '5HT2A', label: '5-HT2A', type: 'receptor', effect: 'Mood regulation' },
  ],
  edges: [
    { source: 'DB00472', target: 'CYP2D6', type: 'INHIBITS', strength: 'strong' },
    { source: 'DB00318', target: 'CYP2D6', type: 'SUBSTRATE_OF', strength: 'strong' },
    { source: 'DB00176', target: 'CYP1A2', type: 'INHIBITS', strength: 'strong' },
    { source: 'DB00176', target: 'CYP3A4', type: 'INHIBITS', strength: 'moderate' },
    { source: 'DB01174', target: 'CYP3A4', type: 'INDUCES', strength: 'strong' },
    { source: 'DB01050', target: 'CYP2D6', type: 'SUBSTRATE_OF', strength: 'weak' },
    { source: 'DB00318', target: 'Morphine', type: 'PRODUCES' },
    { source: 'DB00472', target: 'Norfluoxetine', type: 'PRODUCES' },
    { source: 'Morphine', target: 'MU_Opioid', type: 'ACTIVATES' },
    { source: 'Norfluoxetine', target: '5HT2A', type: 'ACTIVATES' },
  ],
};

// ---------------------------------------------------------------------------
// Simple force-directed layout positioning
// ---------------------------------------------------------------------------

/**
 * Computes a layered left-to-right layout grouped by node type:
 * drug → enzyme → metabolite → receptor.
 * A small random jitter is added for an organic, hand-drawn feel.
 */
function computeLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number,
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const padding = 60;

  // Group by type for layered layout
  const groups: Record<string, GraphNode[]> = {
    drug: [],
    enzyme: [],
    metabolite: [],
    receptor: [],
  };
  nodes.forEach((n) => {
    (groups[n.type] || groups.drug).push(n);
  });

  // Layer positions (left-to-right flow)
  const layers = ['drug', 'enzyme', 'metabolite', 'receptor'];
  const activeLayerCount = layers.filter((l) => groups[l].length > 0).length;
  let layerIndex = 0;

  layers.forEach((layer) => {
    const items = groups[layer];
    if (items.length === 0) return;

    const x =
      padding +
      ((width - 2 * padding) / (activeLayerCount - 1 || 1)) * layerIndex;
    items.forEach((node, i) => {
      const yStep = (height - 2 * padding) / (items.length + 1);
      const y = padding + yStep * (i + 1);
      // Add slight jitter for organic feel
      positions.set(node.id, {
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 15,
      });
    });
    layerIndex++;
  });

  return positions;
}

// ---------------------------------------------------------------------------
// Screen component
// ---------------------------------------------------------------------------

export default function HomeScreen() {
  const router = useRouter();
  const { graph, isLoadingGraph, fetchGraph, alerts, fetchAlerts } =
    usePatientStore();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const fadeAnims = useRef<Map<string, Animated.Value>>(new Map()).current;

  // Use demo data if no API data
  const graphData =
    graph && graph.nodes.length > 0 ? graph : DEMO_GRAPH;

  const positions = useMemo(
    () => computeLayout(graphData.nodes, graphData.edges, SCREEN_W, GRAPH_H),
    [graphData],
  );

  // Initialize fade animations
  useEffect(() => {
    graphData.nodes.forEach((node, _i) => {
      if (!fadeAnims.has(node.id)) {
        fadeAnims.set(node.id, new Animated.Value(0));
      }
    });

    // Staggered entrance
    const anims = graphData.nodes.map((node, i) =>
      Animated.timing(fadeAnims.get(node.id)!, {
        toValue: 1,
        duration: 400,
        delay: i * 80,
        useNativeDriver: true,
      }),
    );
    Animated.stagger(80, anims).start();
  }, [graphData]);

  useEffect(() => {
    fetchGraph();
    fetchAlerts();
  }, []);

  const criticalCount = alerts.filter(
    (a) => a.severity === 'critical' || a.severity === 'strong',
  ).length;
  const moderateCount = alerts.filter(
    (a) => a.severity === 'moderate',
  ).length;

  /** Edge stroke colour based on severity/interaction type */
  const getEdgeColor = (edge: GraphEdge): string => {
    if (edge.strength === 'strong') return COLORS.danger;
    if (edge.strength === 'moderate') return COLORS.warning;
    if (edge.type === 'INHIBITS') return COLORS.danger;
    if (edge.type === 'INDUCES') return COLORS.warning;
    return COLORS.glow.teal;
  };

  /** Edge opacity based on severity */
  const getEdgeOpacity = (edge: GraphEdge): number => {
    if (edge.strength === 'strong') return 0.8;
    if (edge.strength === 'moderate') return 0.5;
    return 0.3;
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoadingGraph && !graph) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <BioLoader size={100} />
          <Text style={styles.loaderText}>LOADING METABOLIC NETWORK</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>CASCADEX</Text>
        <Text style={styles.headerTitle}>Your Metabolic Network</Text>
        <Text style={styles.headerSub}>
          {graphData.nodes.filter((n) => n.type === 'drug').length} medications
          tracked
        </Text>
      </View>

      {/* Graph Canvas */}
      <View style={styles.graphContainer}>
        <Svg width={SCREEN_W} height={GRAPH_H}>
          <Defs>
            {graphData.nodes.map((node) => (
              <RadialGradient
                key={`grad-${node.id}`}
                id={`grad-${node.id}`}
                cx="50%"
                cy="50%"
                r="50%"
              >
                <Stop
                  offset="0%"
                  stopColor={NODE_COLORS[node.type]}
                  stopOpacity="0.9"
                />
                <Stop
                  offset="70%"
                  stopColor={NODE_COLORS[node.type]}
                  stopOpacity="0.4"
                />
                <Stop
                  offset="100%"
                  stopColor={NODE_COLORS[node.type]}
                  stopOpacity="0"
                />
              </RadialGradient>
            ))}
          </Defs>

          {/* Edges */}
          {graphData.edges.map((edge, i) => {
            const from = positions.get(edge.source);
            const to = positions.get(edge.target);
            if (!from || !to) return null;
            return (
              <Line
                key={`edge-${i}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={getEdgeColor(edge)}
                strokeWidth={edge.strength === 'strong' ? 2.5 : 1.5}
                strokeOpacity={getEdgeOpacity(edge)}
                strokeDasharray={
                  edge.type === 'SUBSTRATE_OF' ? '6,4' : undefined
                }
              />
            );
          })}

          {/* Node glow halos */}
          {graphData.nodes.map((node) => {
            const pos = positions.get(node.id);
            if (!pos) return null;
            const r = NODE_RADIUS[node.type] || 20;
            return (
              <Circle
                key={`glow-${node.id}`}
                cx={pos.x}
                cy={pos.y}
                r={r * 1.8}
                fill={`url(#grad-${node.id})`}
                opacity={selectedNode === node.id ? 0.7 : 0.25}
              />
            );
          })}

          {/* Node cores */}
          {graphData.nodes.map((node) => {
            const pos = positions.get(node.id);
            if (!pos) return null;
            const r = NODE_RADIUS[node.type] || 20;
            return (
              <G
                key={`node-${node.id}`}
                onPress={() => setSelectedNode(node.id)}
              >
                <Circle
                  cx={pos.x}
                  cy={pos.y}
                  r={r}
                  fill={NODE_COLORS[node.type]}
                  opacity={selectedNode === node.id ? 1 : 0.85}
                  stroke={
                    selectedNode === node.id ? '#FFF' : 'transparent'
                  }
                  strokeWidth={selectedNode === node.id ? 2 : 0}
                />
                <SvgText
                  x={pos.x}
                  y={pos.y + r + 14}
                  textAnchor="middle"
                  fill={COLORS.text.secondary}
                  fontSize={9}
                  fontFamily="SpaceMono_400Regular"
                >
                  {node.label.length > 10
                    ? node.label.slice(0, 9) + '…'
                    : node.label}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </View>

      {/* Selected Node Info */}
      {selectedNode &&
        (() => {
          const node = graphData.nodes.find((n) => n.id === selectedNode);
          if (!node) return null;
          return (
            <GlassCard
              variant="default"
              style={styles.nodeInfo}
              onPress={() => setSelectedNode(null)}
            >
              <View style={styles.nodeInfoHeader}>
                <View
                  style={[
                    styles.nodeInfoDot,
                    { backgroundColor: NODE_COLORS[node.type] },
                  ]}
                />
                <Text style={styles.nodeInfoType}>
                  {node.type.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.nodeInfoName}>{node.label}</Text>
              {node.drug_class && (
                <Text style={styles.nodeInfoDetail}>
                  Class: {node.drug_class}
                </Text>
              )}
              {node.family && (
                <Text style={styles.nodeInfoDetail}>
                  Family: {node.family}
                </Text>
              )}
            </GlassCard>
          );
        })()}

      {/* Alert Summary */}
      <View style={styles.alertSummary}>
        <GlassCard variant="default" style={styles.alertCard}>
          <Text style={styles.alertTitle}>Active Interactions</Text>
          <View style={styles.alertBadges}>
            {criticalCount > 0 && (
              <DangerBadge
                severity="critical"
                count={criticalCount}
                compact
              />
            )}
            {moderateCount > 0 && (
              <DangerBadge
                severity="moderate"
                count={moderateCount}
                compact
              />
            )}
            {criticalCount === 0 && moderateCount === 0 && (
              <DangerBadge severity="safe" compact />
            )}
          </View>
        </GlassCard>
      </View>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/scan')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.void,
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
  header: {
    paddingHorizontal: TOKENS.spacing.lg,
    paddingTop: TOKENS.spacing.md,
    paddingBottom: TOKENS.spacing.sm,
  },
  headerLabel: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 4,
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: 26,
    color: COLORS.text.primary,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  graphContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  nodeInfo: {
    position: 'absolute',
    bottom: 160,
    left: TOKENS.spacing.md,
    right: TOKENS.spacing.md,
    padding: TOKENS.spacing.md,
  },
  nodeInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  nodeInfoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  nodeInfoType: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 10,
    color: COLORS.text.secondary,
    letterSpacing: 2,
  },
  nodeInfoName: {
    fontFamily: 'Syne_700Bold',
    fontSize: 20,
    color: COLORS.text.primary,
  },
  nodeInfoDetail: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  alertSummary: {
    paddingHorizontal: TOKENS.spacing.md,
    paddingBottom: 90,
  },
  alertCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTitle: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 11,
    color: COLORS.text.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  alertBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...TOKENS.shadow.glowTeal,
  },
  fabIcon: {
    fontSize: 28,
    color: COLORS.text.inverse,
    fontWeight: '700',
    marginTop: -2,
  },
});
