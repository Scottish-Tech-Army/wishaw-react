import { create } from 'zustand';
import api from '../services/api';
import { setTokens, clearTokens, getAccessToken } from '../utils/token';
import type { User, Profile } from '../types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; displayName: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: Profile) => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    const token = getAccessToken();
    if (!token) { set({ isLoading: false, isAuthenticated: false }); return; }
    try {
      const data = await api.getMe();
      const d = data as { user: User; profile: Profile };
      set({ user: d.user, profile: d.profile, isAuthenticated: true, isLoading: false });
    } catch {
      clearTokens();
      set({ user: null, profile: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    const data = await api.login(email, password);
    setTokens(data.accessToken, data.refreshToken);
    set({ user: data.user, profile: data.profile, isAuthenticated: true });
  },

  register: async (formData) => {
    const data = await api.register(formData);
    setTokens(data.accessToken, data.refreshToken);
    set({ user: data.user, profile: data.profile, isAuthenticated: true });
  },

  logout: async () => {
    try { await api.logout(); } catch { /* ignore */ }
    clearTokens();
    set({ user: null, profile: null, isAuthenticated: false });
  },

  updateProfile: (profile) => set({ profile }),

  isAdmin: () => {
    const { user } = get();
    return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  },
}));
