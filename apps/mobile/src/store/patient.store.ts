import { create } from 'zustand';

interface PatientState {
  currentPatientId: string | null;
  setCurrentPatient: (id: string) => void;
}

export const usePatientStore = create<PatientState>((set) => ({
  currentPatientId: null,
  setCurrentPatient: (id) => set({ currentPatientId: id }),
}));
