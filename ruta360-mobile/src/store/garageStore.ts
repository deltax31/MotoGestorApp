import { create } from 'zustand';
import { insforge } from '@/services/insforge/client';

export interface Motorcycle {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color?: string;
  engine_cc?: number;
  current_km: number;
  image_url?: string;
  image_key?: string;
  soat_status: string;
  soat_expiry?: string;
  soat_policy_number?: string;
  tecno_status: string;
  tecno_expiry?: string;
  tecno_certificate?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface GarageState {
  motorcycles: Motorcycle[];
  isLoading: boolean;
  error: string | null;
  fetchMotorcycles: (userId: string) => Promise<void>;
  addMotorcycle: (motorcycle: Partial<Motorcycle>) => Promise<{ data: any; error: any }>;
  updateMotorcycle: (id: string, updates: Partial<Motorcycle>) => Promise<{ data: any; error: any }>;
  activeMotorcycleId: string | null;
  setActiveMotorcycle: (id: string) => void;
}

export const useGarageStore = create<GarageState>((set, get) => ({
  motorcycles: [],
  activeMotorcycleId: null,
  isLoading: false,
  error: null,
  
  setActiveMotorcycle: (id: string) => set({ activeMotorcycleId: id }),

  fetchMotorcycles: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await insforge.database
        .from('motorcycles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const motos = data || [];
      const currentActiveId = get().activeMotorcycleId;
      const isActiveStillValid = motos.some(m => m.id === currentActiveId);
      
      set({ 
        motorcycles: motos, 
        activeMotorcycleId: isActiveStillValid ? currentActiveId : (motos.length > 0 ? motos[0].id : null),
        isLoading: false 
      });
    } catch (err: any) {
      set({ error: err.message || 'Error al obtener las motos', isLoading: false });
    }
  },

  addMotorcycle: async (motorcycle) => {
    set({ isLoading: true });
    try {
      const { data, error } = await insforge.database
        .from('motorcycles')
        .insert([motorcycle])
        .select()
        .single();

      if (error) {
        set({ isLoading: false });
        return { data: null, error };
      }

      // Añadimos la moto al estado inmediatamente
      const currentMotos = get().motorcycles;
      set({ 
        motorcycles: [data, ...currentMotos], 
        activeMotorcycleId: get().activeMotorcycleId || data.id,
        isLoading: false 
      });
      
      return { data, error: null };
    } catch (err: any) {
      set({ isLoading: false });
      return { data: null, error: err };
    }
  },

  updateMotorcycle: async (id, updates) => {
    set({ isLoading: true });
    try {
      const { data, error } = await insforge.database
        .from('motorcycles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        set({ isLoading: false });
        return { data: null, error };
      }

      const currentMotos = get().motorcycles;
      const updatedMotos = currentMotos.map(m => m.id === id ? data : m);
      
      set({ 
        motorcycles: updatedMotos,
        isLoading: false 
      });
      
      return { data, error: null };
    } catch (err: any) {
      set({ isLoading: false });
      return { data: null, error: err };
    }
  },
}));
