import { create } from 'zustand';

interface Interaction {
  id: string;
  severity: 'critical' | 'moderate' | 'safe';
  drugs: string[];
  description: string;
}

interface InteractionsState {
  activeInteractions: Interaction[];
  setInteractions: (interactions: Interaction[]) => void;
}

export const useInteractionsStore = create<InteractionsState>((set) => ({
  activeInteractions: [],
  setInteractions: (activeInteractions) => set({ activeInteractions }),
}));
