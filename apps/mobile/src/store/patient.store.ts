import { create } from 'zustand';
import { Medication, PatientGraph, PatientAlert } from '@/api/patient.api';
import { generateGraphForMeds, generateAlertsForMeds, findDrugInDb } from '@/services/mockData';

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
  currentPatientId: string | null;
  medications: Medication[];
  history: HistoryItem[];
  alerts: PatientAlert[];
  graph: PatientGraph;
  
  setCurrentPatient: (id: string | null) => void;
  addPatientMedication: (med: { name: string; dose?: string; frequency?: string; indication?: string }) => void;
  removePatientMedication: (drugbankId: string) => void;
  loadDemoPatientData: () => void;
  clearPatientData: () => void;
}

// Initial demo history items
const DEMO_HISTORY: HistoryItem[] = [
  {
    id: 'h1',
    title: 'Started Metformin',
    action: 'added',
    date: 'May 12, 2026',
    time: '10:30 AM',
    drugName: 'Metformin',
    dose: '500mg'
  },
  {
    id: 'h2',
    title: 'Dose Adjusted: Lisinopril',
    action: 'adjusted',
    date: 'April 28, 2026',
    time: '09:15 AM',
    drugName: 'Lisinopril',
    dose: '10mg'
  }
];

export const usePatientStore = create<PatientState>((set) => ({
  currentPatientId: null,
  medications: [],
  history: [],
  alerts: [],
  graph: { nodes: [], edges: [] },

  setCurrentPatient: (id) => {
    set({ currentPatientId: id });
    if (id === 'DEMO-PATIENT-001') {
      // Load demo data
      const demoMeds: Medication[] = [
        { drugbank_id: 'DB00945', name: 'Aspirin', dose: '100mg', frequency: 'Once daily', indication: 'Cardioprotection', start_date: 'May 1, 2026' },
        { drugbank_id: 'DB00682', name: 'Warfarin', dose: '5mg', frequency: 'Once daily', indication: 'Clot prevention', start_date: 'May 5, 2026' },
        { drugbank_id: 'DB00722', name: 'Lisinopril', dose: '10mg', frequency: 'Once daily', indication: 'Hypertension', start_date: 'April 15, 2026' },
        { drugbank_id: 'DB01050', name: 'Ibuprofen', dose: '400mg', frequency: 'As needed', indication: 'Pain relief', start_date: 'May 20, 2026' },
        { drugbank_id: 'DB00331', name: 'Metformin', dose: '500mg', frequency: 'Twice daily', indication: 'Type 2 Diabetes', start_date: 'May 12, 2026' }
      ];
      set({
        medications: demoMeds,
        history: DEMO_HISTORY,
        graph: generateGraphForMeds(demoMeds),
        alerts: generateAlertsForMeds(demoMeds)
      });
    } else {
      set({
        medications: [],
        history: [],
        alerts: [],
        graph: { nodes: [], edges: [] }
      });
    }
  },

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
      start_date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
      dose: medInput.dose || '500mg'
    };

    set((state) => {
      // Avoid duplicate medication
      const exists = state.medications.some(m => m.drugbank_id === drugbank_id);
      const updatedMeds = exists 
        ? state.medications.map(m => m.drugbank_id === drugbank_id ? { ...m, ...medInput } : m)
        : [...state.medications, newMed];

      const updatedHistory = [newHistory, ...state.history];
      
      return {
        medications: updatedMeds,
        history: updatedHistory,
        graph: generateGraphForMeds(updatedMeds),
        alerts: generateAlertsForMeds(updatedMeds)
      };
    });
  },

  removePatientMedication: (drugbankId) => {
    set((state) => {
      const removedMed = state.medications.find(m => m.drugbank_id === drugbankId);
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
        dose: removedMed.dose || ''
      };

      const updatedMeds = state.medications.filter(m => m.drugbank_id !== drugbankId);
      const updatedHistory = [newHistory, ...state.history];

      return {
        medications: updatedMeds,
        history: updatedHistory,
        graph: generateGraphForMeds(updatedMeds),
        alerts: generateAlertsForMeds(updatedMeds)
      };
    });
  },

  loadDemoPatientData: () => {
    // Already handled in setCurrentPatient, but provided for utility
    const demoMeds: Medication[] = [
      { drugbank_id: 'DB00945', name: 'Aspirin', dose: '100mg', frequency: 'Once daily', indication: 'Cardioprotection', start_date: 'May 1, 2026' },
      { drugbank_id: 'DB00682', name: 'Warfarin', dose: '5mg', frequency: 'Once daily', indication: 'Clot prevention', start_date: 'May 5, 2026' },
      { drugbank_id: 'DB00722', name: 'Lisinopril', dose: '10mg', frequency: 'Once daily', indication: 'Hypertension', start_date: 'April 15, 2026' },
      { drugbank_id: 'DB01050', name: 'Ibuprofen', dose: '400mg', frequency: 'As needed', indication: 'Pain relief', start_date: 'May 20, 2026' },
      { drugbank_id: 'DB00331', name: 'Metformin', dose: '500mg', frequency: 'Twice daily', indication: 'Type 2 Diabetes', start_date: 'May 12, 2026' }
    ];
    set({
      medications: demoMeds,
      history: DEMO_HISTORY,
      graph: generateGraphForMeds(demoMeds),
      alerts: generateAlertsForMeds(demoMeds)
    });
  },

  clearPatientData: () => set({
    medications: [],
    history: [],
    alerts: [],
    graph: { nodes: [], edges: [] }
  })
}));

