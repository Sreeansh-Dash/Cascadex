/**
 * Patient API endpoints.
 * Maps to FastAPI /api/patient/* router.
 */
import api from './client';

export interface Medication {
  drugbank_id: string;
  name: string;
  dose?: string;
  frequency?: string;
  indication?: string;
  start_date?: string;
}

export interface PatientAlert {
  chain_id: string;
  perpetrator: string;
  victim: string;
  via_enzyme: string;
  severity: string;
  consequence: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'drug' | 'enzyme' | 'metabolite' | 'receptor';
  drug_class?: string;
  family?: string;
  active?: boolean;
  effect?: string;
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

/** Get patient's medication list */
export const getPatientMedications = async (patientId: string): Promise<Medication[]> => {
  const { data } = await api.get(`/patient/${patientId}/medications`);
  return data;
};

/** Add a medication to patient's regimen */
export const addMedication = async (
  patientId: string,
  medication: { drugbank_id: string; dose?: string; frequency?: string; indication?: string }
): Promise<any> => {
  const { data } = await api.post(`/patient/${patientId}/medications`, medication);
  return data;
};

/** Remove a medication */
export const removeMedication = async (
  patientId: string,
  drugId: string
): Promise<any> => {
  const { data } = await api.delete(`/patient/${patientId}/medications/${drugId}`);
  return data;
};

/** Get full graph data for visualization */
export const getPatientGraph = async (patientId: string): Promise<PatientGraph> => {
  const { data } = await api.get(`/patient/${patientId}/graph`);
  return data;
};

/** Get patient's interaction alerts */
export const getPatientAlerts = async (patientId: string): Promise<PatientAlert[]> => {
  const { data } = await api.get(`/patient/${patientId}/alerts`);
  return data;
};
