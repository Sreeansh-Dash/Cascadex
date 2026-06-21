import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity, Animated } from 'react-native';
import Svg, { Path, Circle, G, Text as SvgText, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { PatientGraph, GraphNode, GraphEdge } from '@/api/patient.api';
import { usePatientStore } from '@/store/patient.store';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface DrugGraphCanvasProps {
  graphData: PatientGraph;
}

interface PhysicsNode {
  id: string;
  node: GraphNode;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const DrugGraphCanvas: React.FC<DrugGraphCanvasProps> = ({ graphData }) => {
  const { theme } = useTheme();
  const { alerts } = usePatientStore();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const { width: screenWidth } = Dimensions.get('window');
  const canvasWidth = screenWidth - 40;
  const canvasHeight = 320;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  // Render State
  const [layoutNodes, setLayoutNodes] = useState<Record<string, PhysicsNode>>({});

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1200, useNativeDriver: true })
      ])
    ).start();
  }, [graphData]);

  // Physics Engine
  useEffect(() => {
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
      setLayoutNodes({});
      return;
    }

    const nodes = graphData.nodes;
    const edges = graphData.edges || [];

    // Initialize physics nodes
    const physicsNodes: Record<string, PhysicsNode> = {};
    nodes.forEach((n) => {
      // Start randomly around center, but keep PATIENT exactly at center
      const isPatient = n.id === 'PATIENT';
      physicsNodes[n.id] = {
        id: n.id,
        node: n,
        x: isPatient ? centerX : centerX + (Math.random() - 0.5) * 100,
        y: isPatient ? centerY : centerY + (Math.random() - 0.5) * 100,
        vx: 0,
        vy: 0,
      };
    });

    const config = {
      repulsion: 1500, // Coulomb
      stiffness: 0.05, // Hooke
      damping: 0.85,
      idealLength: 80,
    };

    let isActive = true;

    const tick = () => {
      if (!isActive) return;

      const nodeIds = Object.keys(physicsNodes);
      let totalMovement = 0;

      // 1. Repulsion (Coulomb's Law)
      for (let i = 0; i < nodeIds.length; i++) {
        for (let j = i + 1; j < nodeIds.length; j++) {
          const n1 = physicsNodes[nodeIds[i]];
          const n2 = physicsNodes[nodeIds[j]];
          
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          let distSq = dx * dx + dy * dy;
          if (distSq === 0) distSq = 0.01;

          const force = config.repulsion / distSq;
          const fx = (dx / Math.sqrt(distSq)) * force;
          const fy = (dy / Math.sqrt(distSq)) * force;

          n1.vx += fx;
          n1.vy += fy;
          n2.vx -= fx;
          n2.vy -= fy;
        }
      }

      // 2. Attraction (Hooke's Law along edges)
      edges.forEach((edge) => {
        const n1 = physicsNodes[edge.source];
        const n2 = physicsNodes[edge.target];
        if (!n1 || !n2) return;

        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Edge specific ideal length
        let targetLength = config.idealLength;
        if (n1.id === 'PATIENT' || n2.id === 'PATIENT') targetLength = 60; // Drugs closer to patient
        if (n1.node.type !== 'drug' && n2.node.type !== 'drug') targetLength = 120; // Enzymes further apart

        const force = (dist - targetLength) * config.stiffness;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        n1.vx += fx;
        n1.vy += fy;
        n2.vx -= fx;
        n2.vy -= fy;
      });

      // 3. Central Gravity (pull everything gently to center to prevent drifting off canvas)
      nodeIds.forEach((id) => {
        const n = physicsNodes[id];
        if (id === 'PATIENT') return;
        const dx = centerX - n.x;
        const dy = centerY - n.y;
        n.vx += dx * 0.005;
        n.vy += dy * 0.005;
      });

      // 4. Update Positions
      nodeIds.forEach((id) => {
        const n = physicsNodes[id];
        if (id === 'PATIENT') {
          n.x = centerX;
          n.y = centerY;
          n.vx = 0;
          n.vy = 0;
          return;
        }

        n.vx *= config.damping;
        n.vy *= config.damping;
        
        n.x += n.vx;
        n.y += n.vy;

        totalMovement += Math.abs(n.vx) + Math.abs(n.vy);
      });

      // Update state for rendering
      setLayoutNodes({ ...physicsNodes });

      // Continue loop if not settled
      if (totalMovement > 0.5) {
        animationFrameId.current = requestAnimationFrame(tick);
      }
    };

    animationFrameId.current = requestAnimationFrame(tick);

    return () => {
      isActive = false;
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [graphData]);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'drug': return theme.colors.nodeDrug || '#4A9EFF';
      case 'enzyme': return theme.colors.nodeEnzyme || '#A78BFA';
      case 'metabolite': return theme.colors.nodeMetabolite || '#34D399';
      case 'receptor': return theme.colors.nodeReceptor || '#F472B6';
      default: return theme.colors.accent || '#4A9EFF';
    }
  };

  const getEdgeStyle = (edge: GraphEdge) => {
    const srcNode = layoutNodes[edge.source]?.node;
    const tgtNode = layoutNodes[edge.target]?.node;
    if (!srcNode || !tgtNode) return { stroke: theme.colors.bgBorder, width: 1, isAlert: false, severity: 'safe' };

    const associatedAlert = alerts.find(a => 
      (a.perpetrator.toLowerCase() === srcNode.label.toLowerCase() && a.victim.toLowerCase() === tgtNode.label.toLowerCase()) ||
      (a.perpetrator.toLowerCase() === tgtNode.label.toLowerCase() && a.victim.toLowerCase() === srcNode.label.toLowerCase()) ||
      (srcNode.type === 'enzyme' && a.via_enzyme === srcNode.label) ||
      (tgtNode.type === 'enzyme' && a.via_enzyme === tgtNode.label)
    );

    if (associatedAlert) {
      if (associatedAlert.severity === 'critical') {
        return { stroke: theme.colors.dangerStrong || '#FF4500', width: 2.5, isAlert: true, severity: 'critical' };
      } else if (associatedAlert.severity === 'moderate') {
        return { stroke: theme.colors.warnStrong || '#F59E0B', width: 2, isAlert: true, severity: 'moderate' };
      }
    }

    if (edge.type === 'INHIBITS') return { stroke: theme.colors.warnStrong || '#F59E0B', width: 1.5, isAlert: false, severity: 'safe' };
    if (edge.type === 'ACTIVATES') return { stroke: theme.colors.safeStrong || '#00E5B4', width: 1.5, isAlert: false, severity: 'safe' };
    
    return { stroke: theme.colors.textMuted || '#3D5470', width: 1, isAlert: false, severity: 'safe' };
  };

  const edges = graphData?.edges || [];
  const nodes = graphData?.nodes || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bgSurface, borderColor: theme.colors.bgBorder }]}>
      {nodes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.body }}>
            No medications loaded. Use + to add drugs.
          </Text>
        </View>
      ) : (
        <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%', height: '100%' }}>
          <Svg width={canvasWidth} height={canvasHeight}>
            <Defs>
              <RadialGradient id="patientGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor={theme.colors.accent} stopOpacity="0.4" />
                <Stop offset="100%" stopColor={theme.colors.accent} stopOpacity="0" />
              </RadialGradient>
            </Defs>

            {/* Render Edges */}
            {edges.map((edge, idx) => {
              const src = layoutNodes[edge.source];
              const tgt = layoutNodes[edge.target];
              if (!src || !tgt) return null;

              const style = getEdgeStyle(edge);
              const isPatientConn = edge.source === 'PATIENT' || edge.target === 'PATIENT';
              
              let dPath = `M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`;
              
              if (!isPatientConn) {
                const midX = (src.x + tgt.x) / 2;
                const midY = (src.y + tgt.y) / 2;
                const dx = tgt.x - src.x;
                const dy = tgt.y - src.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                const ox = -dy / len * 15;
                const oy = dx / len * 15;
                dPath = `M ${src.x} ${src.y} Q ${midX + ox} ${midY + oy} ${tgt.x} ${tgt.y}`;
              }

              if (style.isAlert && style.severity === 'critical') {
                return (
                  <G key={`edge-${idx}`}>
                    <AnimatedPath d={dPath} fill="none" stroke={theme.colors.dangerStrong} strokeWidth={6} opacity={pulseAnim} />
                    <Path d={dPath} fill="none" stroke={style.stroke} strokeWidth={style.width} strokeDasharray="4 4" />
                  </G>
                );
              }

              return <Path key={`edge-${idx}`} d={dPath} fill="none" stroke={style.stroke} strokeWidth={style.width} opacity={isPatientConn ? 0.35 : 0.75} />;
            })}

            {/* Render Nodes */}
            {Object.keys(layoutNodes).map((id) => {
              const { node, x, y } = layoutNodes[id];
              const color = getNodeColor(node.type);
              const isSelected = selectedNode?.id === id;
              const isPatient = id === 'PATIENT';
              const r = isPatient ? 18 : (node.type === 'drug' ? 12 : 9);

              return (
                <G key={`node-${id}`} x={x} y={y}>
                  {isSelected && <Circle r={r + 6} fill="none" stroke={color} strokeWidth={1.5} opacity={0.6} />}
                  {isPatient && <Circle r={35} fill="url(#patientGlow)" pointerEvents="none" />}
                  
                  <Circle
                    r={r}
                    fill={isPatient ? theme.colors.bgElevated : color}
                    stroke={isPatient ? theme.colors.accent : theme.colors.bgPrimary}
                    strokeWidth={1.5}
                    onPress={() => setSelectedNode(isSelected ? null : node)}
                  />
                  {(node.type === 'drug' || isPatient || isSelected) && (
                    <SvgText
                      y={r + 14}
                      fill={theme.colors.textPrimary}
                      fontSize={isPatient ? 11 : 9}
                      textAnchor="middle"
                      fontWeight={isPatient ? "bold" : "normal"}
                      fontFamily={theme.typography.mono}
                    >
                      {node.label}
                    </SvgText>
                  )}
                </G>
              );
            })}
          </Svg>

          {selectedNode && (
            <View style={[styles.tooltip, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.bgBorder }]}>
              <View style={styles.tooltipHeader}>
                <Text style={[styles.tooltipTitle, { color: theme.colors.textPrimary, fontFamily: theme.typography.heading }]}>{selectedNode.label}</Text>
                <Text style={[styles.tooltipType, { color: getNodeColor(selectedNode.type), fontFamily: theme.typography.mono }]}>{selectedNode.type.toUpperCase()}</Text>
              </View>
              <Text style={[styles.tooltipText, { color: theme.colors.textSecondary, fontFamily: theme.typography.body }]}>
                {selectedNode.type === 'drug' ? `Class: ${selectedNode.drug_class || 'Medication'}` : 'Biological target/enzyme.'}
              </Text>
              <TouchableOpacity onPress={() => setSelectedNode(null)} style={styles.closeBtn}>
                <Text style={{ color: theme.colors.textMuted, fontSize: 11 }}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', height: 320, borderWidth: 1, borderRadius: 16, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  emptyState: { padding: 20, alignItems: 'center' },
  tooltip: { position: 'absolute', bottom: 12, left: 12, right: 12, padding: 12, borderRadius: 10, borderWidth: 1 },
  tooltipHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  tooltipTitle: { fontSize: 14 },
  tooltipType: { fontSize: 9, letterSpacing: 1 },
  tooltipText: { fontSize: 12 },
  closeBtn: { alignSelf: 'flex-end', marginTop: 6 }
});
