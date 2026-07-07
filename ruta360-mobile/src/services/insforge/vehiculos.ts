import { insforge } from './client';
import type { Vehiculo, NuevoVehiculoInput } from '@/types/vehiculo.types';

export const vehiculosService = {
  async listar(userId: string): Promise<Vehiculo[]> {
    const { data, error } = await insforge.database
      .from('motorcycles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error al listar vehículos: ${error.message}`);
    return data ?? [];
  },

  async crear(input: NuevoVehiculoInput): Promise<Vehiculo> {
    const { data, error } = await insforge.database
      .from('motorcycles')
      .insert([input])
      .select()
      .single();

    if (error) throw new Error(`Error al crear vehículo: ${error.message}`);
    return data;
  },

  async actualizar(id: string, input: Partial<NuevoVehiculoInput>): Promise<Vehiculo> {
    const { data, error } = await insforge.database
      .from('motorcycles')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar vehículo: ${error.message}`);
    return data;
  },

  async eliminar(id: string): Promise<void> {
    const { error } = await insforge.database
      .from('motorcycles')
      .delete()
      .eq('id', id);
      
    if (error) throw new Error(`Error al eliminar vehículo: ${error.message}`);
  },
};
