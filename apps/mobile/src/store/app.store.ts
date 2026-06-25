/**
 * Cascadex App Store — Local-First Identity
 *
 * No auth. No server accounts. A UUID patient ID is generated once
 * on first launch and persisted to MMKV device storage forever.
 * This is the anonymous, per-device identity used for all API calls.
 * Note: crypto.randomUUID() is natively supported by Hermes (Expo SDK 49+).
 */
import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { storage } from './storage';

const zustandStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => storage.getString(name) ?? null,
  removeItem: (name) => storage.remove(name),
};

export interface AppState {
  /** Persistent anonymous device identity — UUID generated on first launch */
  patientId: string;
  /** Optional display name set by the user (shown in greeting) */
  displayName: string;
  /** App version string for display */
  appVersion: string;

  setDisplayName: (name: string) => void;
  /** Wipes all local data and regenerates a fresh patientId */
  resetAppData: () => void;
}

function generatePatientId(): string {
  // crypto.randomUUID() is polyfilled by react-native-get-random-values
  return crypto.randomUUID();
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      patientId: generatePatientId(),
      displayName: '',
      appVersion: '1.0.0',

      setDisplayName: (name) => set({ displayName: name }),

      resetAppData: () =>
        set({
          patientId: generatePatientId(),
          displayName: '',
        }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
