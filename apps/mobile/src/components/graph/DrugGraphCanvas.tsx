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

export const DrugGraphCanvas: React.FC<DrugGraphCanvasProps> = ({ graphData }) => {
  const { theme } = useTheme();
  const { alerts } = usePatientStore();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Staggered node scale-in
    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Loop pulse for warning paths
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1200,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [graphData]);

  const { width: screenWidth } = Dimensions.get('window');
  const canvasWidth = screenWidth - 40;
  const canvasHeight = 320;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  // Extract nodes and edges
  const nodes = graphData.nodes || [];
  const edges = graphData.edges || [];

  // Compute Layout coordinates (Radial layout centered on Patient)
  const layoutNodes: Record<string, { node: GraphNode; x: number; y: number }> = {};

  // Find center node (PATIENT)
  const patientNode = nodes.find(n => n.id === 'PATIENT');
  if (patientNode) {
    layoutNodes['PATIENT'] = { node: patientNode, x: centerX, y: centerY };
  } else {
    // fallback center
    layoutNodes['PATIENT'] = { 
      node: { id: 'PATIENT', label: 'Patient', type: 'receptor' }, 
      x: centerX, 
      y: centerY 
    };
  }

  // Find drug nodes (inner circle)
  const drugNodes = nodes.filter(n => n.type === 'drug');
  const drugRadius = 75;
  drugNodes.forEach((node, index) => {
    const angle = (index * 2 * Math.PI) / (drugNodes.length || 1);
    layoutNodes[node.id] = {
      node,
      x: centerX + drugRadius * Math.cos(angle),
      y: centerY + drugRadius * Math.sin(angle)
    };
  });

  // Find target nodes: enzymes, metabolites, receptors (outer circle)
  const targetNodes = nodes.filter(n => n.type !== 'drug' && n.id !== 'PATIENT');
  const targetRadius = 130;
  targetNodes.forEach((node, index) => {
    // Arrange them outward in the sector of their connecting drug
    // Find the drug connecting to this target
    const connectingDrugEdge = edges.find(e => e.target === node.id || e.source === node.id);
    let baseAngle = (index * 2 * Math.PI) / (targetNodes.length || 1);

    if (connectingDrugEdge) {
      const drugId = connectingDrugEdge.source === node.id ? connectingDrugEdge.target : connectingDrugEdge.source;
      const drugCoord = layoutNodes[drugId];
      if (drugCoord) {
        // align angle with connecting drug but offset slightly
        const drugAngle = Math.atan2(drugCoord.y - centerY, drugCoord.x - centerX);
        baseAngle = drugAngle + ((index % 3) - 1) * 0.4;
      }
    }

    layoutNodes[node.id] = {
      node,
      x: centerX + targetRadius * Math.cos(baseAngle),
      y: centerY + targetRadius * Math.sin(baseAngle)
    };
  });

  // Helper to get color of node
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'drug': return theme.colors.nodeDrug || '#4A9EFF';
      case 'enzyme': return theme.colors.nodeEnzyme || '#A78BFA';
      case 'metabolite': return theme.colors.nodeMetabolite || '#34D399';
      case 'receptor': return theme.colors.nodeReceptor || '#F472B6';
      default: return theme.colors.accent || '#4A9EFF';
    }
  };

  // Check if an edge is part of a critical/moderate alert
  const getEdgeStyle = (edge: GraphEdge) => {
    const srcNode = layoutNodes[edge.source]?.node;
    const tgtNode = layoutNodes[edge.target]?.node;
    
    if (!srcNode || !tgtNode) return { stroke: theme.colors.bgBorder, width: 1, isAlert: false, severity: 'safe' };

    // Find if either node is involved in a critical/moderate interaction alert
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

    // Default connection styles
    if (edge.type === 'INHIBITS') {
      return { stroke: theme.colors.warnStrong || '#F59E0B', width: 1.5, isAlert: false, severity: 'safe' };
    } else if (edge.type === 'ACTIVATES') {
      return { stroke: theme.colors.safeStrong || '#00E5B4', width: 1.5, isAlert: false, severity: 'safe' };
    }
    
    return { stroke: theme.colors.textMuted || '#3D5470', width: 1, isAlert: false, severity: 'safe' };
  };

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
              <RadialGradient id="dangerGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor={theme.colors.dangerStrong} stopOpacity="0.3" />
                <Stop offset="100%" stopColor={theme.colors.dangerStrong} stopOpacity="0" />
              </RadialGradient>
            </Defs>

            {/* Glowing background circles for visual depth */}
            <Circle cx={centerX} cy={centerY} r={drugRadius} fill="none" stroke={theme.colors.bgBorder} strokeDasharray="3 6" strokeWidth={0.7} />
            <Circle cx={centerX} cy={centerY} r={targetRadius} fill="none" stroke={theme.colors.bgBorder} strokeDasharray="4 8" strokeWidth={0.5} />

            {/* Render Connecting Edges */}
            {edges.map((edge, idx) => {
              const src = layoutNodes[edge.source];
              const tgt = layoutNodes[edge.target];
              if (!src || !tgt) return null;

              const style = getEdgeStyle(edge);
              
              // Draw straight line for PATIENT connections, curved for metabolic pathways
              const isPatientConn = edge.source === 'PATIENT' || edge.target === 'PATIENT';
              let dPath = `M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`;
              
              if (!isPatientConn) {
                // Curved pathway: Bezier curve through control point bent towards center/away
                const midX = (src.x + tgt.x) / 2;
                const midY = (src.y + tgt.y) / 2;
                // Offset control point outwards slightly
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
                    {/* Animated Pulsing Glow behind warning edge */}
                    <AnimatedPath
                      d={dPath}
                      fill="none"
                      stroke={theme.colors.dangerStrong}
                      strokeWidth={6}
                      opacity={pulseAnim}
                    />
                    <Path
                      d={dPath}
                      fill="none"
                      stroke={style.stroke}
                      strokeWidth={style.width}
                      strokeDasharray="4 4"
                    />
                  </G>
                );
              }

              return (
                <Path
                  key={`edge-${idx}`}
                  d={dPath}
                  fill="none"
                  stroke={style.stroke}
                  strokeWidth={style.width}
                  opacity={isPatientConn ? 0.35 : 0.75}
                />
              );
            })}

            {/* Render Nodes */}
            {Object.keys(layoutNodes).map((id) => {
              const { node, x, y } = layoutNodes[id];
              const color = getNodeColor(node.type);
              const isSelected = selectedNode?.id === id;
              const isPatient = id === 'PATIENT';

              // Sizing
              const r = isPatient ? 18 : (node.type === 'drug' ? 12 : 9);

              return (
                <G key={`node-${id}`} x={x} y={y}>
                  {/* Outer selection ring or pulse glow */}
                  {isSelected && (
                    <Circle r={r + 6} fill="none" stroke={color} strokeWidth={1.5} opacity={0.6} />
                  )}

                  {/* Special glow for patient center or warning nodes */}
                  {isPatient && (
                    <Circle r={35} fill="url(#patientGlow)" pointerEvents="none" />
                  )}

                  {/* Intersecting Node Circle clickable */}
                  <Circle
                    r={r}
                    fill={isPatient ? theme.colors.bgElevated : color}
                    stroke={isPatient ? theme.colors.accent : theme.colors.bgPrimary}
                    strokeWidth={1.5}
                    onPress={() => setSelectedNode(isSelected ? null : node)}
                  />

                  {/* Text labels for drugs and patient */}
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

          {/* Simple Tooltip display inside graph */}
          {selectedNode && (
            <View style={[styles.tooltip, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.bgBorder }]}>
              <View style={styles.tooltipHeader}>
                <Text style={[styles.tooltipTitle, { color: theme.colors.textPrimary, fontFamily: theme.typography.heading }]}>
                  {selectedNode.label}
                </Text>
                <Text style={[styles.tooltipType, { color: getNodeColor(selectedNode.type), fontFamily: theme.typography.mono }]}>
                  {selectedNode.type.toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.tooltipText, { color: theme.colors.textSecondary, fontFamily: theme.typography.body }]}>
                {selectedNode.type === 'drug' 
                  ? `Class: ${selectedNode.drug_class || 'Medication'}` 
                  : selectedNode.type === 'enzyme' 
                    ? 'CYP450 drug metabolizing enzyme.' 
                    : selectedNode.type === 'metabolite' 
                      ? 'Metabolic product produced by drug conversion.'
                      : 'Biological target receptor site.'
                }
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
  container: {
    width: '100%',
    height: 320,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  tooltip: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tooltipTitle: {
    fontSize: 14,
  },
  tooltipType: {
    fontSize: 9,
    letterSpacing: 1,
  },
  tooltipText: {
    fontSize: 12,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    marginTop: 6,
  }
});
