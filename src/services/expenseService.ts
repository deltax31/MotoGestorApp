import { insforge } from '../lib/insforge';
import { Expense } from '../types';

export const expenseService = {
    async getAll(userId: string): Promise<Expense[]> {
        const { data } = await insforge.database
            .from('expenses')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });
        return data || [];
    },

    async getTotalAmount(userId: string): Promise<number> {
        const { data } = await insforge.database
            .from('expenses')
            .select('amount')
            .eq('user_id', userId);
        return (data || []).reduce((sum: number, e: { amount: number }) => sum + Number(e.amount), 0);
    },

    async create(data: Partial<Expense>, userId: string): Promise<Expense> {
        const { data: inserted, error } = await insforge.database
            .from('expenses')
            .insert([{ ...data, user_id: userId }])
            .select()
            .single();
        if (error || !inserted) throw new Error('Error al registrar gasto');
        return inserted;
    },

    async update(id: string, data: Partial<Expense>): Promise<void> {
        const { error } = await insforge.database
            .from('expenses')
            .update(data)
            .eq('id', id)
            .select();
        if (error) throw new Error('Error al actualizar gasto');
    },

    async delete(id: string): Promise<void> {
        const { error } = await insforge.database
            .from('expenses')
            .delete()
            .eq('id', id);
        if (error) throw new Error('Error al eliminar gasto');
    },

    async deleteByMaintenanceId(maintenanceId: string): Promise<void> {
        await insforge.database
            .from('expenses')
            .delete()
            .eq('maintenance_id', maintenanceId);
    },

    async getByMaintenanceId(maintenanceId: string): Promise<{ id: string } | null> {
        const { data } = await insforge.database
            .from('expenses')
            .select('id')
            .eq('maintenance_id', maintenanceId)
            .single();
        return data || null;
    },
};
