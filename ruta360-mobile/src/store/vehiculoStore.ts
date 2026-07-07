import { create } from 'zustand';
import { vehiculosService } from '@/services/insforge/vehiculos';
import type { Vehiculo } from '@/types/vehiculo.types';

export type Motorcycle = Vehiculo;

interface GarageState {
  motorcycles: Vehiculo[];
  isLoading: boolean;
  error: string | null;
  fetchMotorcycles: (userId: string) => Promise<void>;
  addMotorcycle: (motorcycle: any) => Promise<{ data: any; error: any }>;
  updateMotorcycle: (id: string, updates: any) => Promise<{ data: any; error: any }>;
  activeMotorcycleId: string | null;
  setActiveMotorcycle: (id: string) => void;
}

export const useVehiculoStore = create<GarageState>((set, get) => ({
  motorcycles: [],
  activeMotorcycleId: null,
  isLoading: false,
  error: null,
  
  setActiveMotorcycle: (id: string) => set({ activeMotorcycleId: id }),

  fetchMotorcycles: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await vehiculosService.listar(userId);
      
      const motos = data || [];
      const currentActiveId = get().activeMotorcycleId;
      const isActiveStillValid = motos.some(m => m.id === currentActiveId);
      
      set({ 
        motorcycles: motos, 
        activeMotorcycleId: isActiveStillValid ? currentActiveId : (motos.length > 0 ? motos[0]?.id : null),
        isLoading: false 
      });
    } catch (err: any) {
      set({ error: err.message || 'Error al obtener las motos', isLoading: false });
    }
  },

  addMotorcycle: async (motorcycle) => {
    set({ isLoading: true });
    try {
      const data = await vehiculosService.crear(motorcycle);

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
      const data = await vehiculosService.actualizar(id, updates);

      const currentMotos = get().motorcycles || [];
      const updatedMotos = currentMotos.map((m: Vehiculo) => m.id === id ? (data as Vehiculo) : m);
      
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
