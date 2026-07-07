export type TipoMantenimiento = 'preventivo' | 'correctivo' | 'modificacion' | 'unknown';

export interface ServicioMantenimiento {
  id?: string;
  maintenance_id?: string;
  type: string;
  cost: number;
}

export interface Mantenimiento {
  id: string;
  motorcycle_id: string;
  user_id: string;
  type: TipoMantenimiento | string;
  date: string;
  km_at_service: number;
  next_km?: number;
  cost?: number;
  workshop?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  services?: ServicioMantenimiento[];
}

export interface NuevoMantenimientoInput {
  motorcycle_id: string;
  user_id: string;
  type: TipoMantenimiento | string;
  date: string;
  km_at_service: number;
  next_km?: number;
  cost?: number;
  workshop?: string;
  notes?: string;
}
