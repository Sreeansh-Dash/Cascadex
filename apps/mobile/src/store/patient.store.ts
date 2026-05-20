/**
 * Patient Zustand Store
 * Manages patient profile, medications list, and loading states.
 */
import { create } from 'zustand';
import * as patientApi from '../api/patient.api';
import type { Medication, PatientGraph, PatientAlert } from '../api/patient.api';

interface PatientState {
  // Data
  patientId: string;
  medications: Medication[];
  graph: PatientGraph | null;
  alerts: PatientAlert[];

  // Loading states
  isLoadingMeds: boolean;
  isLoadingGraph: boolean;
  isLoadingAlerts: boolean;
  isAddingMed: boolean;

  // Errors
  error: string | null;

  // Actions
  setPatientId: (id: string) => void;
  fetchMedications: () => Promise<void>;
  fetchGraph: () => Promise<void>;
  fetchAlerts: () => Promise<void>;
  addMedication: (med: { drugbank_id: string; dose?: string; frequency?: string; indication?: string }) => Promise<void>;
  removeMedication: (drugId: string) => Promise<void>;
  refreshAll: () => Promise<void>;
  clearError: () => void;
}

// Default demo patient ID from Phase 2 seed data
const DEFAULT_PATIENT_ID = 'patient_demo_001';

export const usePatientStore = create<PatientState>((set, get) => ({
  patientId: DEFAULT_PATIENT_ID,
  medications: [],
  graph: null,
  alerts: [],
  isLoadingMeds: false,
  isLoadingGraph: false,
  isLoadingAlerts: false,
  isAddingMed: false,
  error: null,

  setPatientId: (id) => set({ patientId: id }),

  fetchMedications: async () => {
    const { patientId } = get();
    set({ isLoadingMeds: true, error: null });
    try {
      const medications = await patientApi.getPatientMedications(patientId);
      set({ medications, isLoadingMeds: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load medications', isLoadingMeds: false });
    }
  },

  fetchGraph: async () => {
    const { patientId } = get();
    set({ isLoadingGraph: true, error: null });
    try {
      const graph = await patientApi.getPatientGraph(patientId);
      set({ graph, isLoadingGraph: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load graph', isLoadingGraph: false });
    }
  },

  fetchAlerts: async () => {
    const { patientId } = get();
    set({ isLoadingAlerts: true, error: null });
    try {
      const alerts = await patientApi.getPatientAlerts(patientId);
      set({ alerts, isLoadingAlerts: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load alerts', isLoadingAlerts: false });
    }
  },

  addMedication: async (med) => {
    const { patientId, refreshAll } = get();
    set({ isAddingMed: true, error: null });
    try {
      await patientApi.addMedication(patientId, med);
      set({ isAddingMed: false });
      await refreshAll();
    } catch (err: any) {
      set({ error: err.message || 'Failed to add medication', isAddingMed: false });
    }
  },

  removeMedication: async (drugId) => {
    const { patientId, refreshAll } = get();
    set({ error: null });
    try {
      await patientApi.removeMedication(patientId, drugId);
      await refreshAll();
    } catch (err: any) {
      set({ error: err.message || 'Failed to remove medication' });
    }
  },

  refreshAll: async () => {
    const { fetchMedications, fetchGraph, fetchAlerts } = get();
    await Promise.all([fetchMedications(), fetchGraph(), fetchAlerts()]);
  },

  clearError: () => set({ error: null }),
}));
