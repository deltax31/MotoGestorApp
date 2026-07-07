export type EstadoDocumento = 'vigente' | 'proximo_vencer' | 'vencido' | 'unknown';

export interface Vehiculo {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color?: string;
  engine_cc?: number;
  current_km: number;
  image_url?: string;
  image_key?: string;
  soat_status: EstadoDocumento;
  soat_expiry?: string;
  soat_policy_number?: string;
  tecno_status: EstadoDocumento;
  tecno_expiry?: string;
  tecno_certificate?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface NuevoVehiculoInput {
  user_id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color?: string;
  engine_cc?: number;
  current_km: number;
  image_url?: string;
  soat_status?: EstadoDocumento;
  tecno_status?: EstadoDocumento;
}
