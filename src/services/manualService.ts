import { insforge } from '../lib/insforge';
import { Manual } from '../types';

export const manualService = {
    async getForMotorcycle(motorcycleId: string, userId: string): Promise<Manual | null> {
        const { data } = await insforge.database
            .from('manuals')
            .select('*')
            .eq('motorcycle_id', motorcycleId)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1);
        return (data && data.length > 0) ? data[0] : null;
    },

    async getUserManualMotorcycleIds(userId: string): Promise<string[]> {
        const { data } = await insforge.database
            .from('manuals')
            .select('motorcycle_id')
            .eq('user_id', userId);
        if (!data || data.length === 0) return [];
        return data.map((m: { motorcycle_id: string }) => m.motorcycle_id);
    },

    async create(motorcycleId: string, userId: string, filename: string): Promise<Manual> {
        const { data, error } = await insforge.database
            .from('manuals')
            .insert([{
                motorcycle_id: motorcycleId,
                user_id: userId,
                filename,
                total_chunks: 0,
            }])
            .select()
            .single();
        if (error || !data) throw new Error('Error al registrar el manual');
        return data;
    },
};
