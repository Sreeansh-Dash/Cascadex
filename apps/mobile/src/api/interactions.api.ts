/**
 * Interaction API endpoints.
 * Maps to FastAPI /api/interactions/* router.
 */
import api from './client';

export interface InteractionChain {
  perpetrator: string;
  perpetrator_id: string;
  victim_drug: string;
  victim_id: string;
  via_enzyme: string;
  enzyme_family?: string;
  strengths: string[];
  interaction_type: string;
  consequence: string;
}

export interface ChainDetail {
  chain_id: string;
  perpetrator: any;
  victim: any;
  enzyme: any;
  metabolites: any[];
  receptors: any[];
  overall_severity: string;
}

export interface SimulationResult {
  patient_id: string;
  simulated_drug: string;
  new_interactions_count: number;
  interactions: InteractionChain[];
}

/** Get all interactions for a patient */
export const getInteractions = async (patientId: string): Promise<InteractionChain[]> => {
  const { data } = await api.get(`/interactions/${patientId}`);
  return data;
};

/** Get full chain detail (perpetrator_id:victim_id:enzyme_name) */
export const getChainDetail = async (chainId: string): Promise<ChainDetail> => {
  const { data } = await api.get(`/interactions/chain/${chainId}`);
  return data;
};

/** Simulate adding a drug to patient's regimen */
export const simulateAddDrug = async (
  patientId: string,
  drugId: string
): Promise<SimulationResult> => {
  const { data } = await api.get(`/interactions/${patientId}/simulate`, {
    params: { drug_id: drugId },
  });
  return data;
};
