/**
 * Explain API endpoints.
 * Maps to FastAPI /api/explain/* router for Groq-powered explanations.
 */
import api from './client';

export interface ChainExplanation {
  chain_id: string;
  explanation: string;
  chain_data: any;
}

export interface DrugExplanation {
  drugbank_id: string;
  explanation: string;
}

/** Get plain-English explanation of an interaction chain */
export const explainChain = async (chainId: string): Promise<ChainExplanation> => {
  const { data } = await api.get(`/explain/chain/${chainId}`);
  return data;
};

/** Get plain-English drug summary */
export const explainDrug = async (drugbankId: string): Promise<DrugExplanation> => {
  const { data } = await api.get(`/explain/drug/${drugbankId}`);
  return data;
};
