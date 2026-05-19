/**
 * Shared Interaction types used across mobile app and API responses.
 */

export type Severity = 'critical' | 'moderate' | 'minor';
export type Mechanism = 'INHIBITS' | 'INDUCES';
export type Strength = 'strong' | 'moderate' | 'weak';

export interface InteractionChain {
  chain_id: string;
  perpetrator: string;
  perpetrator_id: string;
  victim_drug: string;
  victim_id: string;
  via_enzyme: string;
  enzyme_family: string;
  interaction_type: Mechanism;
  strengths: Strength[];
  consequence: string;
  severity: Severity;
}

export interface InteractionAlert {
  chain_id: string;
  perpetrator: string;
  victim_drug: string;
  via_enzyme: string;
  severity: Severity;
  one_line_consequence: string;
}

export interface SimulationResult {
  new_drug: string;
  affected_drug: string;
  via_enzyme: string;
  mechanism: Mechanism;
  strength: Strength;
}
