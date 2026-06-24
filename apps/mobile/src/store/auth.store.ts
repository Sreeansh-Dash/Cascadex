import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { storage } from './storage';
import { api as apiClient } from '../api/client';

const zustandStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => storage.getString(name) ?? null,
  removeItem: (name) => storage.remove(name),
};

const getErrorMessage = (error: any, defaultMsg: string) => {
  if (error.code === 'ECONNABORTED' || !error.response) {
    return 'The server is waking up or unreachable. Please check your connection and try again in 30 seconds.';
  }
  const status = error.response?.status;
  if (status === 401) return 'Invalid email or password.';
  if (status === 400 || status === 409) return error.response?.data?.detail || 'Invalid request.';
  if (status >= 500) return 'Server error. Please try again.';
  return error.response?.data?.detail || defaultMsg;
};

export { apiClient };

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name?: string;
  age_range?: string;
  weight_range?: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; isTimeout?: boolean }>;
  signUp: (userData: { email: string; password: string; first_name: string; last_name?: string }) => Promise<{ success: boolean; error?: string; isTimeout?: boolean }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; resetToken?: string; error?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  setToken: (access: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isLoading: false,

      signIn: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await apiClient.post('/auth/login', { email, password });
          const { access_token, user } = res.data;
          
          // Apply token to future requests
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

          set({ accessToken: access_token, user, isLoading: false });
          return { success: true };
        } catch (error: any) {
          set({ isLoading: false });
          const msg = getErrorMessage(error, 'Failed to sign in. Please try again.');
          return { success: false, error: msg, isTimeout: !error.response };
        }
      },

      signUp: async (userData) => {
        set({ isLoading: true });
        try {
          const res = await apiClient.post('/auth/register', userData);
          const { access_token, user } = res.data;
          
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

          set({ accessToken: access_token, user, isLoading: false });
          return { success: true };
        } catch (error: any) {
          set({ isLoading: false });
          const msg = getErrorMessage(error, 'Registration failed.');
          return { success: false, error: msg, isTimeout: !error.response };
        }
      },

      forgotPassword: async (email) => {
        set({ isLoading: true });
        try {
          const res = await apiClient.post('/auth/forgot-password', { email });
          set({ isLoading: false });
          // In a real app we wouldn't return the token here, but we do for simulation purposes
          return { success: true, resetToken: res.data.reset_token };
        } catch (error: any) {
          set({ isLoading: false });
          const msg = error.response?.data?.detail || 'Failed to send reset link.';
          return { success: false, error: msg };
        }
      },

      resetPassword: async (token, newPassword) => {
        set({ isLoading: true });
        try {
          await apiClient.post('/auth/reset-password', { token, new_password: newPassword });
          set({ isLoading: false });
          return { success: true };
        } catch (error: any) {
          set({ isLoading: false });
          const msg = error.response?.data?.detail || 'Invalid or expired token.';
          return { success: false, error: msg };
        }
      },

      signOut: () => {
        delete apiClient.defaults.headers.common['Authorization'];
        set({ accessToken: null, user: null, isLoading: false });
      },

      setToken: (access) => set({ accessToken: access }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${state.accessToken}`;
        }
      },
    }
  )
);
