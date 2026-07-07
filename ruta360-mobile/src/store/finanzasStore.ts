import { create } from 'zustand';
import { finanzasService } from '@/services/insforge/finanzas';
import { mantenimientosService } from '@/services/insforge/mantenimientos';
import type { Gasto, ItemGasto } from '@/types/finanzas.types';
import { insforge } from '@/services/insforge/client';
import { useAutenticacionStore } from './autenticacionStore';

export type { ItemGasto };
export type ExpenseRecord = Gasto;

export interface UnifiedTransaction {
  id: string;
  type: 'EXPENSE' | 'MAINTENANCE';
  motorcycle_id: string;
  date: string;
  totalAmount: number;
  title: string;
  description: string;
  items: { category: string; amount: number }[];
  originalRecord: any;
}

interface FinanceState {
  transactions: UnifiedTransaction[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: (motorcycleId?: string | null) => Promise<void>;
  addExpense: (expense: Omit<ExpenseRecord, 'id' | 'created_at'>, items: ItemGasto[]) => Promise<{ error: any }>;
  updateExpense: (id: string, expense: Partial<ExpenseRecord>, items: ItemGasto[]) => Promise<{ error: any }>;
  deleteExpense: (id: string) => Promise<{ error: any }>;
}

export const useFinanzasStore = create<FinanceState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async (motorcycleId?: string | null) => {
    set({ isLoading: true, error: null });
    try {
      const user = useAutenticacionStore.getState().session;
      if (!user) throw new Error('No user found');

      // 1. Fetch Expenses
      // We keep the original queries for the unified view since they depend on user_id directly
      // and conditionally on motorcycleId.
      let expensesQuery = insforge.database
        .from('expenses')
        .select(`*, items:expense_items(*)`)
        .eq('user_id', user.id);
      
      if (motorcycleId) {
        expensesQuery = expensesQuery.eq('motorcycle_id', motorcycleId);
      }
      
      const { data: expensesDataOriginal, error: expError } = await expensesQuery;
      if (expError) throw expError;

      // 2. Fetch Maintenance
      let maintQuery = insforge.database
        .from('maintenance')
        .select(`*, services:maintenance_services(*)`)
        .eq('user_id', user.id);
        
      if (motorcycleId) {
        maintQuery = maintQuery.eq('motorcycle_id', motorcycleId);
      }
      
      const { data: maintDataOriginal, error: maintError } = await maintQuery;
      if (maintError) throw maintError;

      // 3. Unify and map
      const unified: UnifiedTransaction[] = [];

      (expensesDataOriginal || []).forEach((exp: any) => {
        let title = exp.category;
        const items = exp.items || [];
        
        if (items.length > 1) {
          title = `${items[0].category} + Otros`;
        } else if (items.length === 1) {
          title = items[0].category;
        }

        unified.push({
          id: exp.id,
          type: 'EXPENSE',
          motorcycle_id: exp.motorcycle_id,
          date: exp.date,
          totalAmount: exp.amount,
          title: title,
          description: exp.description || '',
          items: items.map((i: any) => ({ category: i.category, amount: i.amount })),
          originalRecord: exp
        });
      });

      (maintDataOriginal || []).forEach((maint: any) => {
        let title = maint.type;
        const services = maint.services || [];
        
        if (services.length > 1) {
          title = `${services[0].type} y ${services.length - 1} más`;
        } else if (services.length === 1) {
          title = services[0].type;
        } else {
          title = maint.type || 'Mantenimiento';
        }

        unified.push({
          id: maint.id,
          type: 'MAINTENANCE',
          motorcycle_id: maint.motorcycle_id,
          date: maint.date,
          totalAmount: maint.cost || 0,
          title: 'Mantenimiento',
          description: maint.workshop ? `Taller: ${maint.workshop}` : (maint.notes || 'Mantenimiento preventivo/correctivo'),
          items: services.map((s: any) => ({ category: s.type, amount: s.cost })),
          originalRecord: maint
        });
      });

      // Sort by date DESC
      unified.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      set({ transactions: unified, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Error al obtener transacciones', isLoading: false });
    }
  },

  addExpense: async (expense, items) => {
    set({ isLoading: true, error: null });
    try {
      await finanzasService.crear(expense, items);
      set({ isLoading: false });
      return { error: null };
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return { error: err.message };
    }
  },

  updateExpense: async (id, expense, items) => {
    set({ isLoading: true, error: null });
    try {
      await finanzasService.actualizar(id, expense, items);
      set({ isLoading: false });
      return { error: null };
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return { error: err.message };
    }
  },

  deleteExpense: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await finanzasService.eliminar(id);
      set({ isLoading: false });
      return { error: null };
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return { error: err.message };
    }
  }
}));
