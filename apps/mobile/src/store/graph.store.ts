/**
 * Graph Zustand Store
 * Manages graph visualization state: nodes, edges, selected node, layout.
 */
import { create } from 'zustand';
import type { GraphNode, GraphEdge } from '../api/patient.api';

interface NodePosition {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
}

interface GraphState {
  // Data
  nodes: GraphNode[];
  edges: GraphEdge[];
  positions: Map<string, NodePosition>;

  // Selection
  selectedNodeId: string | null;
  highlightedPath: string[];

  // Viewport
  scale: number;
  translateX: number;
  translateY: number;

  // Animation
  isAnimating: boolean;
  nodesVisible: number;

  // Actions
  setGraphData: (nodes: GraphNode[], edges: GraphEdge[]) => void;
  setPositions: (positions: Map<string, NodePosition>) => void;
  selectNode: (nodeId: string | null) => void;
  highlightPath: (nodeIds: string[]) => void;
  clearHighlight: () => void;
  setViewport: (scale: number, tx: number, ty: number) => void;
  setAnimating: (isAnimating: boolean) => void;
  setNodesVisible: (count: number) => void;
  resetView: () => void;
}

export const useGraphStore = create<GraphState>((set) => ({
  nodes: [],
  edges: [],
  positions: new Map(),
  selectedNodeId: null,
  highlightedPath: [],
  scale: 1,
  translateX: 0,
  translateY: 0,
  isAnimating: false,
  nodesVisible: 0,

  setGraphData: (nodes, edges) => set({ nodes, edges }),
  setPositions: (positions) => set({ positions }),
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  highlightPath: (nodeIds) => set({ highlightedPath: nodeIds }),
  clearHighlight: () => set({ highlightedPath: [] }),
  setViewport: (scale, translateX, translateY) =>
    set({ scale, translateX, translateY }),
  setAnimating: (isAnimating) => set({ isAnimating }),
  setNodesVisible: (count) => set({ nodesVisible: count }),
  resetView: () =>
    set({ scale: 1, translateX: 0, translateY: 0, selectedNodeId: null, highlightedPath: [] }),
}));
