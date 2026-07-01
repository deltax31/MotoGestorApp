import { create } from 'zustand';
import { insforge } from '@/services/insforge/client';

export interface MaintenanceService {
  id?: string;
  maintenance_id?: string;
  type: string;
  cost: number;
}

export interface MaintenanceRecord {
  id: string;
  motorcycle_id: string;
  user_id: string;
  date: string;
  km_at_service: number;
  next_km?: number | null;
  cost?: number | null; // Total cost
  workshop?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  services?: MaintenanceService[];
}

interface MaintenanceState {
  records: MaintenanceRecord[];
  isLoading: boolean;
  error: string | null;
  fetchMaintenanceRecords: (motorcycleId: string) => Promise<void>;
  addMaintenanceRecord: (record: Partial<MaintenanceRecord>, services: MaintenanceService[]) => Promise<{ data: any; error: any }>;
  updateMaintenanceRecord: (id: string, record: Partial<MaintenanceRecord>, services: MaintenanceService[]) => Promise<{ data: any; error: any }>;
  deleteMaintenanceRecord: (id: string) => Promise<{ error: any }>;
}

export const useMaintenanceStore = create<MaintenanceState>((set, get) => ({
  records: [],
  isLoading: false,
  error: null,
  
  fetchMaintenanceRecords: async (motorcycleId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await insforge.database
        .from('maintenance')
        .select('*, services:maintenance_services(*)')
        .eq('motorcycle_id', motorcycleId)
        .order('date', { ascending: false });

      if (error) throw error;
      
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
      // 1. Insert Master Record
      const { data: masterData, error: masterError } = await insforge.database
        .from('maintenance')
        .insert([{
          motorcycle_id: record.motorcycle_id,
          user_id: record.user_id,
          type: services && services.length > 0 ? (services.length === 1 ? services[0].type : 'Servicio Múltiple') : 'Mantenimiento',
          date: record.date,
          km_at_service: record.km_at_service,
          next_km: record.next_km,
          cost: record.cost,
          workshop: record.workshop,
          notes: record.notes,
        }])
        .select()
        .single();

      if (masterError) throw masterError;

      // 2. Insert Detail Records
      let detailsData = [];
      if (services && services.length > 0) {
        const servicesToInsert = services.map(s => ({
          maintenance_id: masterData.id,
          type: s.type,
          cost: s.cost
        }));
        
        const { data: insertedServices, error: detailsError } = await insforge.database
          .from('maintenance_services')
          .insert(servicesToInsert)
          .select();

        if (detailsError) throw detailsError;
        detailsData = insertedServices || [];
      }

      const newRecord = { ...masterData, services: detailsData };

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
      // 1. Update Master
      const { data: masterData, error: masterError } = await insforge.database
        .from('maintenance')
        .update({
          motorcycle_id: record.motorcycle_id, // allow changing moto
          type: services && services.length > 0 ? (services.length === 1 ? services[0].type : 'Servicio Múltiple') : 'Mantenimiento',
          date: record.date,
          km_at_service: record.km_at_service,
          next_km: record.next_km,
          cost: record.cost,
          workshop: record.workshop,
          notes: record.notes,
        })
        .eq('id', id)
        .select()
        .single();

      if (masterError) throw masterError;

      // 2. Delete existing services and insert new ones (simplest approach for updates without tracking individual IDs)
      const { error: delError } = await insforge.database
        .from('maintenance_services')
        .delete()
        .eq('maintenance_id', id);
        
      if (delError) throw delError;

      let detailsData = [];
      if (services && services.length > 0) {
        const servicesToInsert = services.map(s => ({
          maintenance_id: masterData.id,
          type: s.type,
          cost: s.cost
        }));
        
        const { data: insertedServices, error: insError } = await insforge.database
          .from('maintenance_services')
          .insert(servicesToInsert)
          .select();

        if (insError) throw insError;
        detailsData = insertedServices || [];
      }

      const updatedRecord = { ...masterData, services: detailsData };

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
      // Because of ON DELETE CASCADE, deleting master will delete details
      const { error } = await insforge.database
        .from('maintenance')
        .delete()
        .eq('id', id);

      if (error) {
        set({ isLoading: false });
        return { error };
      }

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
