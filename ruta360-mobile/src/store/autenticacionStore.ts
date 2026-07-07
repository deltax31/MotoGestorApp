import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { insforge } from '../services/insforge/client';
import { perfilesService } from '@/services/insforge/perfiles';
import type { Perfil } from '@/types/usuario.types';

interface AuthState {
  session: any | null;
  profile: Perfil | null;
  isLoading: boolean;
  setSession: (session: any) => void;
  setProfile: (profile: any) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAutenticacionStore = create<AuthState>()(
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
          try {
            // Fetch profile if user exists
            const profileData = await perfilesService.obtener(data.user.id);
            
            console.log('--- CHECK_SESSION PROFILE ---', JSON.stringify(profileData));
            set({ session: data.user, profile: profileData || null, isLoading: false });
          } catch (e) {
            console.error('Error fetching profile in checkSession', e);
            set({ session: data.user, isLoading: false }); // keep old profile if error
          }
        } else {
          set({ session: null, profile: null, isLoading: false });
        }
      },
      refreshProfile: async () => {
        try {
          const { data, error } = await insforge.auth.getCurrentUser();
          if (data && data.user) {
            const profileData = await perfilesService.obtener(data.user.id);
            
            console.log('--- REFRESH_PROFILE ---', JSON.stringify(profileData));
            if (profileData) {
              set({ session: data.user, profile: profileData });
            }
          }
        } catch (e) {
           console.error('Error in refreshProfile', e);
        }
      },
    }),
    {
      name: 'ruta360-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
