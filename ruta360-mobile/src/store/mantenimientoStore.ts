import { create } from 'zustand';
import { mantenimientosService } from '@/services/insforge/mantenimientos';
import type { Mantenimiento, ServicioMantenimiento } from '@/types/mantenimiento.types';

export type MaintenanceRecord = Mantenimiento;
export type MaintenanceService = ServicioMantenimiento;

interface MaintenanceState {
  records: Mantenimiento[];
  isLoading: boolean;
  error: string | null;
  fetchMaintenanceRecords: (motorcycleId: string) => Promise<void>;
  addMaintenanceRecord: (record: any, services: ServicioMantenimiento[]) => Promise<{ data: any; error: any }>;
  updateMaintenanceRecord: (id: string, record: any, services: ServicioMantenimiento[]) => Promise<{ data: any; error: any }>;
  deleteMaintenanceRecord: (id: string) => Promise<{ error: any }>;
}

export const useMantenimientoStore = create<MaintenanceState>((set, get) => ({
  records: [],
  isLoading: false,
  error: null,
  
  fetchMaintenanceRecords: async (motorcycleId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await mantenimientosService.listarPorVehiculo(motorcycleId);

      set({ 
        records: data || [], 
        isLoading: false 
      });
    } catch (err: any) {
      set({ error: err.message || 'Error al obtener los mantenimientos', isLoading: false });
    }
  },

  addMaintenanceRecord: async (record, services) => {
    set({ isLoading: true });
    try {
      const newRecord = await mantenimientosService.crear(record, services);

      const currentRecords = get().records;
      set({ 
        records: [newRecord, ...currentRecords], 
        isLoading: false 
      });
      
      return { data: newRecord, error: null };
    } catch (err: any) {
      set({ isLoading: false });
      return { data: null, error: err };
    }
  },

  updateMaintenanceRecord: async (id, record, services) => {
    set({ isLoading: true });
    try {
      const updatedRecord = await mantenimientosService.actualizar(id, record, services);

      const currentRecords = get().records;
      set({ 
        records: currentRecords.map(r => r.id === id ? updatedRecord : r), 
        isLoading: false 
      });
      
      return { data: updatedRecord, error: null };
    } catch (err: any) {
      set({ isLoading: false });
      return { data: null, error: err };
    }
  },

  deleteMaintenanceRecord: async (id) => {
    set({ isLoading: true });
    try {
      await mantenimientosService.eliminar(id);

      const currentRecords = get().records;
      set({ 
        records: currentRecords.filter(r => r.id !== id), 
        isLoading: false 
      });
      
      return { error: null };
    } catch (err: any) {
      set({ isLoading: false });
      return { error: err };
    }
  }
}));
