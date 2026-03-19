import { insforge } from '../lib/insforge';
import { Maintenance, Motorcycle } from '../types';
import { expenseService } from './expenseService';
import { motorcycleService } from './motorcycleService';

export const maintenanceService = {
    async getAll(userId: string): Promise<Maintenance[]> {
        const { data } = await insforge.database
            .from('maintenance')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });
        return data || [];
    },

    async getRecent(userId: string, limit = 5): Promise<Maintenance[]> {
        const { data } = await insforge.database
            .from('maintenance')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(limit);
        return data || [];
    },

    async create(
        data: Partial<Maintenance>,
        userId: string,
        motos: Motorcycle[],
    ): Promise<void> {
        const moto = motos.find(m => m.id === data.motorcycle_id);
        const cost = Number(data.cost) || 0;
        const expenseDesc = `🔧 ${data.type || 'Mantenimiento'}${data.workshop ? ` — ${data.workshop}` : ''}`;

        const { data: inserted, error } = await insforge.database
            .from('maintenance')
            .insert([{ ...data, user_id: userId }])
            .select()
            .single();
        if (error || !inserted) throw new Error('Error al registrar');

        // Update moto km if higher
        if (moto && Number(data.km_at_service) > moto.current_km) {
            await motorcycleService.updateKm(moto.id, Number(data.km_at_service));
        }

        // Auto-create expense if cost > 0
        if (cost > 0) {
            await insforge.database.from('expenses').insert([{
                user_id: userId,
                motorcycle_id: data.motorcycle_id,
                category: 'mantenimiento',
                amount: cost,
                date: data.date,
                description: expenseDesc,
                maintenance_id: inserted.id,
            }]);
        }
    },

    async update(
        id: string,
        data: Partial<Maintenance>,
        userId: string,
    ): Promise<void> {
        const cost = Number(data.cost) || 0;
        const expenseDesc = `🔧 ${data.type || 'Mantenimiento'}${data.workshop ? ` — ${data.workshop}` : ''}`;

        const { error } = await insforge.database
            .from('maintenance')
            .update({ ...data, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();
        if (error) throw new Error('Error al actualizar');

        // Sync expense: update or create
        if (cost > 0) {
            const existingExp = await expenseService.getByMaintenanceId(id);
            if (existingExp) {
                await insforge.database.from('expenses').update({
                    motorcycle_id: data.motorcycle_id,
                    amount: cost,
                    date: data.date,
                    description: expenseDesc,
                }).eq('id', existingExp.id);
            } else {
                await insforge.database.from('expenses').insert([{
                    user_id: userId,
                    motorcycle_id: data.motorcycle_id,
                    category: 'mantenimiento',
                    amount: cost,
                    date: data.date,
                    description: expenseDesc,
                    maintenance_id: id,
                }]);
            }
        } else {
            // Cost is 0 → remove linked expense if it exists
            await expenseService.deleteByMaintenanceId(id);
        }
    },

    async delete(id: string): Promise<void> {
        const { error } = await insforge.database
            .from('maintenance')
            .delete()
            .eq('id', id);
        if (error) throw new Error('Error al eliminar');
    },
};
