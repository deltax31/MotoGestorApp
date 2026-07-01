import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { insforge } from '../services/insforge/client';

interface AuthState {
  session: any | null;
  profile: any | null;
  isLoading: boolean;
  setSession: (session: any) => void;
  setProfile: (profile: any) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      profile: null,
      isLoading: true,
      setSession: (session) => set({ session }),
      setProfile: (profile) => set({ profile }),
      logout: async () => {
        await insforge.auth.signOut();
        set({ session: null, profile: null });
      },
      checkSession: async () => {
        set({ isLoading: true });
        const { data, error } = await insforge.auth.getCurrentUser();
        
        if (data && data.user) {
          // Fetch profile if user exists
          const { data: profile } = await insforge.auth.getProfile(data.user.id);
            
          set({ session: data.user, profile, isLoading: false });
        } else {
          set({ session: null, profile: null, isLoading: false });
        }
      },
    }),
    {
      name: 'ruta360-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
