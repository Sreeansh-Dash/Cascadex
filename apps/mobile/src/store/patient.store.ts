import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { storage } from './storage';
import { Medication, PatientGraph, PatientAlert } from '@/api/patient.api';
import { generateGraphForMeds, generateAlertsForMeds, findDrugInDb } from '@/services/mockData';

const zustandStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => storage.getString(name) ?? null,
  removeItem: (name) => storage.remove(name),
};

export interface HistoryItem {
  id: string;
  title: string;
  action: 'added' | 'removed' | 'adjusted';
  date: string;
  time: string;
  drugName: string;
  dose: string;
}

interface PatientState {
  medications: Medication[];
  history: HistoryItem[];
  alerts: PatientAlert[];
  graph: PatientGraph;

  addPatientMedication: (med: { name: string; dose?: string; frequency?: string; indication?: string }) => void;
  removePatientMedication: (drugbankId: string) => void;
  clearPatientData: () => void;
}

// Default demo medications shown on fresh install
const DEMO_MEDICATIONS: Medication[] = [
  { drugbank_id: 'DB00945', name: 'Aspirin', dose: '100mg', frequency: 'Once daily', indication: 'Cardioprotection', start_date: 'May 1, 2026' },
  { drugbank_id: 'DB00682', name: 'Warfarin', dose: '5mg', frequency: 'Once daily', indication: 'Clot prevention', start_date: 'May 5, 2026' },
  { drugbank_id: 'DB00722', name: 'Lisinopril', dose: '10mg', frequency: 'Once daily', indication: 'Hypertension', start_date: 'April 15, 2026' },
  { drugbank_id: 'DB01050', name: 'Ibuprofen', dose: '400mg', frequency: 'As needed', indication: 'Pain relief', start_date: 'May 20, 2026' },
  { drugbank_id: 'DB00331', name: 'Metformin', dose: '500mg', frequency: 'Twice daily', indication: 'Type 2 Diabetes', start_date: 'May 12, 2026' },
];

const DEMO_HISTORY: HistoryItem[] = [
  {
    id: 'h1',
    title: 'Started Metformin',
    action: 'added',
    date: 'May 12, 2026',
    time: '10:30 AM',
    drugName: 'Metformin',
    dose: '500mg',
  },
  {
    id: 'h2',
    title: 'Dose Adjusted: Lisinopril',
    action: 'adjusted',
    date: 'April 28, 2026',
    time: '09:15 AM',
    drugName: 'Lisinopril',
    dose: '10mg',
  },
];

export const usePatientStore = create<PatientState>()(
  persist(
    (set) => ({
      medications: DEMO_MEDICATIONS,
      history: DEMO_HISTORY,
      alerts: generateAlertsForMeds(DEMO_MEDICATIONS),
      graph: generateGraphForMeds(DEMO_MEDICATIONS),

      addPatientMedication: (medInput) => {
        const dbInfo = findDrugInDb(medInput.name);
        const drugbank_id = dbInfo ? dbInfo.drugbank_id : `DRUG_${medInput.name.toUpperCase()}`;
        const cleanName = dbInfo ? dbInfo.name : medInput.name;

        const newMed: Medication = {
          drugbank_id,
          name: cleanName,
          dose: medInput.dose || '500mg',
          frequency: medInput.frequency || 'Once daily',
          indication: medInput.indication || 'General health',
          start_date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        };

        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const dateString = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const newHistory: HistoryItem = {
          id: `h_${Date.now()}`,
          title: `Added ${cleanName}`,
          action: 'added',
          date: dateString,
          time: timeString,
          drugName: cleanName,
          dose: medInput.dose || '500mg',
        };

        set((state) => {
          const exists = state.medications.some((m) => m.drugbank_id === drugbank_id);
          const updatedMeds = exists
            ? state.medications.map((m) => (m.drugbank_id === drugbank_id ? { ...m, ...newMed } : m))
            : [...state.medications, newMed];

          const updatedHistory = [newHistory, ...state.history];

          return {
            medications: updatedMeds,
            history: updatedHistory,
            graph: generateGraphForMeds(updatedMeds),
            alerts: generateAlertsForMeds(updatedMeds),
          };
        });
      },

      removePatientMedication: (drugbankId) => {
        set((state) => {
          const removedMed = state.medications.find((m) => m.drugbank_id === drugbankId);
          if (!removedMed) return state;

          const now = new Date();
          const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          const dateString = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

          const newHistory: HistoryItem = {
            id: `h_${Date.now()}`,
            title: `Removed ${removedMed.name}`,
            action: 'removed',
            date: dateString,
            time: timeString,
            drugName: removedMed.name,
            dose: removedMed.dose || '',
          };

          const updatedMeds = state.medications.filter((m) => m.drugbank_id !== drugbankId);
          const updatedHistory = [newHistory, ...state.history];

          return {
            medications: updatedMeds,
            history: updatedHistory,
            graph: generateGraphForMeds(updatedMeds),
            alerts: generateAlertsForMeds(updatedMeds),
          };
        });
      },

      clearPatientData: () =>
        set({
          medications: [],
          history: [],
          alerts: [],
          graph: { nodes: [], edges: [] },
        }),
    }),
    {
      name: 'patient-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
