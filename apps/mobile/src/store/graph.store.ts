import { create } from 'zustand';

interface GraphState {
  nodes: any[];
  edges: any[];
  setGraphData: (nodes: any[], edges: any[]) => void;
}

export const useGraphStore = create<GraphState>((set) => ({
  nodes: [],
  edges: [],
  setGraphData: (nodes, edges) => set({ nodes, edges }),
}));
