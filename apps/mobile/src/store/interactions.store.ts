/**
 * Interactions Zustand Store
 * Manages live interaction alerts, chain details, and severity counts.
 */
import { create } from 'zustand';
import * as interactionsApi from '../api/interactions.api';
import * as explainApi from '../api/explain.api';
import type { InteractionChain, ChainDetail, SimulationResult } from '../api/interactions.api';

interface InteractionsState {
  // Data
  chains: InteractionChain[];
  selectedChain: ChainDetail | null;
  explanation: string | null;
  simulation: SimulationResult | null;

  // Counts
  criticalCount: number;
  moderateCount: number;
  safeCount: number;

  // Loading
  isLoadingChains: boolean;
  isLoadingDetail: boolean;
  isLoadingExplanation: boolean;
  isSimulating: boolean;

  // Dismissed (snoozed for 24h)
  dismissedChainIds: string[];

  // Actions
  fetchChains: (patientId: string) => Promise<void>;
  fetchChainDetail: (chainId: string) => Promise<void>;
  fetchExplanation: (chainId: string) => Promise<void>;
  simulateAdd: (patientId: string, drugId: string) => Promise<void>;
  dismissChain: (chainId: string) => void;
  clearSimulation: () => void;
}

const getSeverity = (strengths: string[]): 'critical' | 'moderate' | 'safe' => {
  if (strengths.some((s) => s === 'strong')) return 'critical';
  if (strengths.some((s) => s === 'moderate')) return 'moderate';
  return 'safe';
};

export const useInteractionsStore = create<InteractionsState>((set, get) => ({
  chains: [],
  selectedChain: null,
  explanation: null,
  simulation: null,
  criticalCount: 0,
  moderateCount: 0,
  safeCount: 0,
  isLoadingChains: false,
  isLoadingDetail: false,
  isLoadingExplanation: false,
  isSimulating: false,
  dismissedChainIds: [],

  fetchChains: async (patientId) => {
    set({ isLoadingChains: true });
    try {
      const chains = await interactionsApi.getInteractions(patientId);
      const criticalCount = chains.filter((c) => getSeverity(c.strengths) === 'critical').length;
      const moderateCount = chains.filter((c) => getSeverity(c.strengths) === 'moderate').length;
      const safeCount = chains.filter((c) => getSeverity(c.strengths) === 'safe').length;
      set({ chains, criticalCount, moderateCount, safeCount, isLoadingChains: false });
    } catch (err) {
      set({ isLoadingChains: false });
    }
  },

  fetchChainDetail: async (chainId) => {
    set({ isLoadingDetail: true, selectedChain: null });
    try {
      const detail = await interactionsApi.getChainDetail(chainId);
      set({ selectedChain: detail, isLoadingDetail: false });
    } catch (err) {
      set({ isLoadingDetail: false });
    }
  },

  fetchExplanation: async (chainId) => {
    set({ isLoadingExplanation: true, explanation: null });
    try {
      const result = await explainApi.explainChain(chainId);
      set({ explanation: result.explanation, isLoadingExplanation: false });
    } catch (err) {
      set({ isLoadingExplanation: false });
    }
  },

  simulateAdd: async (patientId, drugId) => {
    set({ isSimulating: true, simulation: null });
    try {
      const result = await interactionsApi.simulateAddDrug(patientId, drugId);
      set({ simulation: result, isSimulating: false });
    } catch (err) {
      set({ isSimulating: false });
    }
  },

  dismissChain: (chainId) => {
    set((state) => ({
      dismissedChainIds: [...state.dismissedChainIds, chainId],
    }));
  },

  clearSimulation: () => set({ simulation: null }),
}));
