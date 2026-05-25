import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role: 'patient' | 'clinician' | 'pharmacist' | 'admin';
  verificationStatus: 'verified' | 'pending' | 'unverified';
  age?: string;
  weight?: string;
  gender?: string;
  bloodType?: string;
  password?: string; // stored for local mock auth
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  registeredUsers: User[];
  isLoading: boolean;
  signIn: (email: string, password: string) => { success: boolean; error?: string };
  signUp: (userData: Omit<User, 'id' | 'verificationStatus'>) => void;
  updateUserProfile: (updates: Partial<Omit<User, 'id' | 'email' | 'role'>>) => void;
  signOut: () => void;
  setTokens: (access: string, refresh: string) => void;
}

// Initial demo user Ramesh
const DEMO_USER: User = {
  id: 'DEMO-PATIENT-001',
  email: 'demo@cascadex.com',
  password: 'password123',
  firstName: 'Ramesh',
  lastName: 'Sharma',
  role: 'patient',
  verificationStatus: 'verified',
  age: '45',
  weight: '70kg',
  gender: 'Male',
  bloodType: 'O+',
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  registeredUsers: [DEMO_USER],
  isLoading: false,

  signIn: (email, password) => {
    let result: { success: boolean; error?: string } = { success: false, error: 'Invalid email or password' };
    
    set((state) => {
      const foundUser = state.registeredUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (foundUser) {
        result = { success: true };
        return {
          accessToken: 'mock-token-' + foundUser.id,
          user: foundUser,
          isLoading: false
        };
      }
      return state;
    });

    return result;
  },

  signUp: (userData) => {
    const newId = 'USER-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newUser: User = {
      ...userData,
      id: newId,
      verificationStatus: 'verified',
    };

    set((state) => ({
      registeredUsers: [...state.registeredUsers, newUser],
      user: newUser,
      accessToken: 'mock-token-' + newId,
      isLoading: false,
    }));
  },

  updateUserProfile: (updates) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...updates };
      const updatedRegistered = state.registeredUsers.map((u) =>
        u.id === state.user?.id ? { ...u, ...updates } : u
      );
      return {
        user: updatedUser,
        registeredUsers: updatedRegistered,
      };
    });
  },

  signOut: () => set({ accessToken: null, refreshToken: null, user: null, isLoading: false }),
  setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
}));

