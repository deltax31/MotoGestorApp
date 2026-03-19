import { insforge } from '../lib/insforge';
import { Profile } from '../types';

export const profileService = {
    async get(userId: string): Promise<Profile | null> {
        const { data } = await insforge.database
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        return data || null;
    },

    async update(userId: string, payload: { name?: string | null; phone?: string | null }): Promise<void> {
        const { error } = await insforge.database
            .from('profiles')
            .update({ ...payload, updated_at: new Date().toISOString() })
            .eq('id', userId);
        if (error) throw new Error('Error al guardar perfil');
    },

    async updatePlan(userId: string, plan: 'free' | 'pro'): Promise<void> {
        const { error } = await insforge.database
            .from('profiles')
            .update({ plan, updated_at: new Date().toISOString() })
            .eq('id', userId);
        if (error) throw new Error('Error al cambiar plan');
    },
};
