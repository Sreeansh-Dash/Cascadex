import { create } from 'zustand';

interface User {
  id: string;
  firstName: string;
  role: 'patient' | 'pharmacist' | 'admin';
  verificationStatus: 'verified' | 'pending' | 'unverified';
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
  setTokens: (access: string, refresh: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isLoading: true,
  signIn: (token, user) => set({ accessToken: token, user, isLoading: false }),
  signOut: () => set({ accessToken: null, refreshToken: null, user: null, isLoading: false }),
  setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
}));
