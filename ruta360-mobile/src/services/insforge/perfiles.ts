import { insforge } from './client';
import type { Perfil } from '@/types/usuario.types';

export const perfilesService = {
  async obtener(userId: string): Promise<Perfil> {
    const { data, error } = await insforge.database
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw new Error(`Error al obtener perfil: ${error.message}`);
    return data;
  },

  async actualizar(userId: string, input: Partial<Perfil>): Promise<Perfil> {
    const { data, error } = await insforge.database
      .from('profiles')
      .update(input)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar perfil: ${error.message}`);
    return data;
  }
};
