export type CategoriaGasto = 'gasolina' | 'peajes' | 'mantenimiento' | 'accesorios' | 'seguros' | 'impuestos' | 'otros' | string;

export interface ItemGasto {
  id?: string;
  expense_id?: string;
  category: string;
  amount: number;
}

export interface Gasto {
  id: string;
  motorcycle_id: string;
  user_id: string;
  category: CategoriaGasto;
  amount: number;
  date: string;
  description?: string;
  maintenance_id?: string;
  created_at: string;
  items?: ItemGasto[];
}

export interface NuevoGastoInput {
  motorcycle_id: string;
  user_id: string;
  category: CategoriaGasto;
  amount: number;
  date: string;
  description?: string;
  maintenance_id?: string;
}
