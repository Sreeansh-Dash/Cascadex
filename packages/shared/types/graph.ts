/**
 * Shared Graph visualization types used across mobile app and API responses.
 */

export type NodeType = 'drug' | 'enzyme' | 'metabolite' | 'receptor';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  // Type-specific properties
  class?: string;       // drug
  family?: string;      // enzyme
  active?: boolean;     // metabolite
  effect?: string;      // receptor
  // Layout coordinates (computed server-side for performance)
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
  strength?: string;
}

export interface PatientGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
