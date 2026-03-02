import { DocStatus } from '../types';

export function getDocStatusBadge(status: DocStatus, expiry?: string | null) {
    const daysLeft = expiry
        ? Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000)
        : null;

    if (status === 'active') {
        return { cls: 'badge-active', label: daysLeft !== null ? `Activo · ${daysLeft}d` : 'Activo', dot: '🟢' };
    } else if (status === 'expiring_soon') {
        return { cls: 'badge-expiring', label: daysLeft !== null ? `Vence en ${daysLeft}d` : 'Por vencer', dot: '🟡' };
    } else if (status === 'expired') {
        return { cls: 'badge-expired', label: 'Vencido', dot: '🔴' };
    }
    return { cls: 'badge-unknown', label: 'Sin info', dot: '⚪' };
}

export function computeDocStatus(expiry: string | null): DocStatus {
    if (!expiry) return 'unknown';
    const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000);
    if (days < 0) return 'expired';
    if (days <= 30) return 'expiring_soon';
    return 'active';
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatKm(km: number): string {
    return km.toLocaleString('es-CO') + ' km';
}
