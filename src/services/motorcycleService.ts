import { insforge } from '../lib/insforge';
import { Motorcycle, Profile } from '../types';
import { computeDocStatus } from '../lib/utils';

export const motorcycleService = {
    async getAll(userId: string): Promise<Motorcycle[]> {
        const { data } = await insforge.database
            .from('motorcycles')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        return data || [];
    },

    async getById(id: string, userId: string): Promise<Motorcycle | null> {
        const { data } = await insforge.database
            .from('motorcycles')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();
        return data || null;
    },

    async create(data: Partial<Motorcycle>, userId: string): Promise<Motorcycle> {
        const { data: inserted, error } = await insforge.database
            .from('motorcycles')
            .insert([{ ...data, user_id: userId }])
            .select()
            .single();
        if (error || !inserted) throw new Error('Error al registrar la moto');
        return inserted;
    },

    async update(id: string, data: Partial<Motorcycle>): Promise<void> {
        const { error } = await insforge.database
            .from('motorcycles')
            .update({ ...data, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();
        if (error) throw new Error('Error al actualizar moto');
    },

    async delete(id: string): Promise<void> {
        const { error } = await insforge.database
            .from('motorcycles')
            .delete()
            .eq('id', id);
        if (error) throw new Error('Error al eliminar moto');
    },

    async updateKm(id: string, km: number): Promise<void> {
        const { error } = await insforge.database
            .from('motorcycles')
            .update({ current_km: km, updated_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw new Error('Error al actualizar kilómetros');
    },

    async updateWithDocStatus(id: string, form: Record<string, any>): Promise<Motorcycle> {
        const payload = {
            brand: form.brand,
            model: form.model,
            year: Number(form.year),
            plate: form.plate,
            color: form.color || null,
            engine_cc: form.engine_cc ? Number(form.engine_cc) : null,
            current_km: Number(form.current_km),
            notes: form.notes || null,
            soat_expiry: form.soat_expiry || null,
            soat_policy_number: form.soat_policy_number || null,
            soat_status: computeDocStatus(form.soat_expiry || null),
            tecno_expiry: form.tecno_expiry || null,
            tecno_certificate: form.tecno_certificate || null,
            tecno_status: computeDocStatus(form.tecno_expiry || null),
            updated_at: new Date().toISOString(),
        };
        const { error } = await insforge.database
            .from('motorcycles')
            .update(payload)
            .eq('id', id)
            .select();
        if (error) throw new Error('Error al guardar');
        return { id, ...payload } as unknown as Motorcycle;
    },

    async getProfile(userId: string): Promise<Profile | null> {
        const { data } = await insforge.database
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        return data || null;
    },
};
