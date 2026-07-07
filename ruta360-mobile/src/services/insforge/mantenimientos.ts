import { insforge } from './client';
import type { Mantenimiento, NuevoMantenimientoInput, ServicioMantenimiento } from '@/types/mantenimiento.types';

export const mantenimientosService = {
  async listarPorVehiculo(motorcycleId: string): Promise<Mantenimiento[]> {
    const { data, error } = await insforge.database
      .from('maintenance')
      .select('*, services:maintenance_services(*)')
      .eq('motorcycle_id', motorcycleId)
      .order('date', { ascending: false });

    if (error) throw new Error(`Error al listar mantenimientos: ${error.message}`);
    return data ?? [];
  },

  async crear(input: NuevoMantenimientoInput, servicios?: ServicioMantenimiento[]): Promise<Mantenimiento> {
    const { data: masterData, error: masterError } = await insforge.database
      .from('maintenance')
      .insert([{
        motorcycle_id: input.motorcycle_id,
        user_id: input.user_id,
        type: (servicios && servicios.length > 0) ? (servicios.length === 1 ? (servicios[0]?.type || 'Mantenimiento') : 'Servicio Múltiple') : 'Mantenimiento',
        date: input.date,
        km_at_service: input.km_at_service,
        next_km: input.next_km,
        cost: input.cost,
        workshop: input.workshop,
        notes: input.notes,
      }])
      .select()
      .single();

    if (masterError) throw new Error(`Error al crear mantenimiento: ${masterError.message}`);

    let detailsData = [];
    if (servicios && servicios.length > 0) {
      const servicesToInsert = servicios.map(s => ({
        maintenance_id: masterData.id,
        type: s.type,
        cost: s.cost
      }));
      
      const { data: insertedServices, error: detailsError } = await insforge.database
        .from('maintenance_services')
        .insert(servicesToInsert)
        .select();

      if (detailsError) throw new Error(`Error al crear detalles de mantenimiento: ${detailsError.message}`);
      detailsData = insertedServices || [];
    }

    return { ...masterData, services: detailsData };
  },

  async actualizar(id: string, input: Partial<NuevoMantenimientoInput>, servicios?: ServicioMantenimiento[]): Promise<Mantenimiento> {
    const { data: masterData, error: masterError } = await insforge.database
      .from('maintenance')
      .update({
        motorcycle_id: input.motorcycle_id,
        type: (servicios && servicios.length > 0) ? (servicios.length === 1 ? (servicios[0]?.type || 'Mantenimiento') : 'Servicio Múltiple') : 'Mantenimiento',
        date: input.date,
        km_at_service: input.km_at_service,
        next_km: input.next_km,
        cost: input.cost,
        workshop: input.workshop,
        notes: input.notes,
      })
      .eq('id', id)
      .select()
      .single();

    if (masterError) throw new Error(`Error al actualizar mantenimiento: ${masterError.message}`);

    const { error: delError } = await insforge.database
      .from('maintenance_services')
      .delete()
      .eq('maintenance_id', id);
      
    if (delError) throw new Error(`Error al eliminar servicios antiguos: ${delError.message}`);

    let detailsData = [];
    if (servicios && servicios.length > 0) {
      const servicesToInsert = servicios.map(s => ({
        maintenance_id: masterData.id,
        type: s.type,
        cost: s.cost
      }));
      
      const { data: insertedServices, error: insError } = await insforge.database
        .from('maintenance_services')
        .insert(servicesToInsert)
        .select();

      if (insError) throw new Error(`Error al insertar nuevos servicios: ${insError.message}`);
      detailsData = insertedServices || [];
    }

    return { ...masterData, services: detailsData };
  },

  async eliminar(id: string): Promise<void> {
    const { error } = await insforge.database
      .from('maintenance')
      .delete()
      .eq('id', id);
      
    if (error) throw new Error(`Error al eliminar mantenimiento: ${error.message}`);
  },
};
