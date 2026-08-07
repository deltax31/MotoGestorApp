import { insforge } from './client';
import type { Vehiculo, NuevoVehiculoInput } from '@/types/vehiculo.types';
import { storageService } from './storage';

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

  async crear(input: NuevoVehiculoInput & { localImageUri?: string | null }): Promise<Vehiculo> {
    let imageUrl = input.image_url;
    
    if (input.localImageUri) {
      imageUrl = await storageService.subirImagenVehiculo(input.localImageUri, input.user_id, 'nuevo');
    } else if (!imageUrl) {
      try {
        const { data, error } = await insforge.functions.invoke('buscar-imagen-moto', {
          body: { marca: input.brand, modelo: input.model }
        });
        if (!error && data?.url) {
          imageUrl = data.url;
        }
      } catch (err) {
        console.error('Error invocando buscar-imagen-moto:', err);
      }
    }

    const payload = { ...input };
    delete (payload as any).localImageUri;
    if (imageUrl) {
      payload.image_url = imageUrl;
    }

    const { data, error } = await insforge.database
      .from('motorcycles')
      .insert([payload])
      .select()
      .single();

    if (error) throw new Error(`Error al crear vehículo: ${error.message}`);
    return data;
  },

  async actualizar(
    id: string, 
    input: Partial<NuevoVehiculoInput> & { localImageUri?: string | null, currentImageUrl?: string }
  ): Promise<Vehiculo> {
    let imageUrl = input.image_url;
    
    if (input.localImageUri) {
      const userId = input.user_id || 'unknown';
      imageUrl = await storageService.subirImagenVehiculo(input.localImageUri, userId, id);
      
      if (input.currentImageUrl) {
        await storageService.eliminarImagenVehiculo(input.currentImageUrl);
      }
    } else if (input.localImageUri === null) {
      if (input.currentImageUrl) {
        await storageService.eliminarImagenVehiculo(input.currentImageUrl);
      }
      
      try {
        if (input.brand && input.model) {
          const { data, error } = await insforge.functions.invoke('buscar-imagen-moto', {
            body: { marca: input.brand, modelo: input.model }
          });
          if (!error && data?.url) {
            imageUrl = data.url;
          }
        }
      } catch (err) {
        console.error('Error invocando buscar-imagen-moto:', err);
      }
    }

    const payload = { ...input };
    delete (payload as any).localImageUri;
    delete (payload as any).currentImageUrl;
    
    if (imageUrl !== undefined) {
      payload.image_url = imageUrl;
    }

    const { data, error } = await insforge.database
      .from('motorcycles')
      .update(payload)
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
