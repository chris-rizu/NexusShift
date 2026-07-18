import { create } from 'zustand';

interface AuthState {
  session: unknown | null;
  user: unknown | null;
  setSession: (session: unknown | null) => void;
  setUser: (user: unknown | null) => void;
  checkSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,

  setSession: (session) => set({ session }),

  setUser: (user) => set({ user }),

  checkSession: async () => {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        const session = await window.electronAPI.authGetSession();
        if (session) {
          set({ session, user: (session as any).user });
        } else {
          set({ session: null, user: null });
        }
      } else {
        console.log('electronAPI not available, skipping auth check');
        set({ session: null, user: null });
      }
    } catch (error) {
      console.error('Failed to check session:', error);
      set({ session: null, user: null });
    }
  },

  signIn: async (email, password) => {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        const response = await window.electronAPI.authSignIn(email, password);
        set({ session: (response as any).session, user: (response as any).user });
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        await window.electronAPI.authSignOut();
        set({ session: null, user: null });
      } else {
        set({ session: null, user: null });
      }
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  },
}));
