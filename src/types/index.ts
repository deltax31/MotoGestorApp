export type Plan = 'free' | 'pro';
export type DocStatus = 'active' | 'expired' | 'expiring_soon' | 'unknown';
export type ExpenseCategory = 'combustible' | 'mantenimiento' | 'seguro' | 'repuestos' | 'multas' | 'otros';

export interface Profile {
    id: string;
    name: string | null;
    phone: string | null;
    plan: Plan;
    created_at: string;
    updated_at: string;
}

export interface Motorcycle {
    id: string;
    user_id: string;
    brand: string;
    model: string;
    year: number;
    plate: string;
    color: string | null;
    engine_cc: number | null;
    current_km: number;
    image_url: string | null;
    image_key: string | null;
    soat_status: DocStatus;
    soat_expiry: string | null;
    soat_policy_number: string | null;
    tecno_status: DocStatus;
    tecno_expiry: string | null;
    tecno_certificate: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface Maintenance {
    id: string;
    motorcycle_id: string;
    user_id: string;
    type: string;
    date: string;
    km_at_service: number;
    next_km: number | null;
    cost: number;
    workshop: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface Expense {
    id: string;
    motorcycle_id: string;
    user_id: string;
    category: ExpenseCategory;
    amount: number;
    date: string;
    description: string | null;
    maintenance_id: string | null;
    created_at: string;
}

export interface ChatMessage {
    id: string;
    user_id: string;
    role: 'user' | 'assistant';
    content: string;
    motorcycle_id: string | null;
    created_at: string;
}

export interface Manual {
    id: string;
    motorcycle_id: string;
    user_id: string;
    filename: string;
    storage_key: string | null;
    total_chunks: number;
    created_at: string;
}

export interface ManualChunk {
    id: string;
    content_chunk: string;
    category: string;
    km_threshold: number | null;
    similarity: number;
}
