import { insforge } from './client';
import type { Gasto, NuevoGastoInput, ItemGasto } from '@/types/finanzas.types';

export const finanzasService = {
  async listarPorVehiculo(motorcycleId: string): Promise<Gasto[]> {
    const { data, error } = await insforge.database
      .from('expenses')
      .select('*, items:expense_items(*)')
      .eq('motorcycle_id', motorcycleId)
      .order('date', { ascending: false });

    if (error) throw new Error(`Error al listar gastos: ${error.message}`);
    return data ?? [];
  },

  async crear(input: NuevoGastoInput, items?: ItemGasto[]): Promise<Gasto> {
    const { data: masterData, error: masterError } = await insforge.database
      .from('expenses')
      .insert([input])
      .select()
      .single();

    if (masterError) throw new Error(`Error al crear gasto: ${masterError.message}`);

    let itemsData = [];
    if (items && items.length > 0) {
      const itemsToInsert = items.map(i => ({
        expense_id: masterData.id,
        category: i.category,
        amount: i.amount
      }));
      
      const { data: insertedItems, error: itemsError } = await insforge.database
        .from('expense_items')
        .insert(itemsToInsert)
        .select();

      if (itemsError) throw new Error(`Error al crear items de gasto: ${itemsError.message}`);
      itemsData = insertedItems || [];
    }

    return { ...masterData, items: itemsData };
  },

  async actualizar(id: string, input: Partial<NuevoGastoInput>, items?: ItemGasto[]): Promise<Gasto> {
    const { data: masterData, error: masterError } = await insforge.database
      .from('expenses')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (masterError) throw new Error(`Error al actualizar gasto: ${masterError.message}`);

    const { error: delError } = await insforge.database
      .from('expense_items')
      .delete()
      .eq('expense_id', id);
      
    if (delError) throw new Error(`Error al eliminar items antiguos: ${delError.message}`);

    let itemsData = [];
    if (items && items.length > 0) {
      const itemsToInsert = items.map(i => ({
        expense_id: masterData.id,
        category: i.category,
        amount: i.amount
      }));
      
      const { data: insertedItems, error: insError } = await insforge.database
        .from('expense_items')
        .insert(itemsToInsert)
        .select();

      if (insError) throw new Error(`Error al insertar nuevos items: ${insError.message}`);
      itemsData = insertedItems || [];
    }

    return { ...masterData, items: itemsData };
  },

  async eliminar(id: string): Promise<void> {
    const { error } = await insforge.database
      .from('expenses')
      .delete()
      .eq('id', id);
      
    if (error) throw new Error(`Error al eliminar gasto: ${error.message}`);
  },
};
