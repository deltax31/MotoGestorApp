import { useEffect, useState, useRef } from 'react';
import { useUser } from '@insforge/react';
import { Expense, Motorcycle, ExpenseCategory } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { useRealtime } from '../hooks/useRealtime';
import { useToast } from '../context/ToastContext';
import { AppLayout } from '../components/AppLayout';
import { expenseService } from '../services/expenseService';
import { motorcycleService } from '../services/motorcycleService';
import { aiService } from '../services/aiService';

const CATEGORIES: { key: ExpenseCategory; label: string; icon: string; color: string }[] = [
    { key: 'combustible', label: 'Combustible', icon: '⛽', color: '#f59e0b' },
    { key: 'mantenimiento', label: 'Mantenimiento', icon: '🔧', color: '#6366f1' },
    { key: 'seguro', label: 'Seguro', icon: '🛡️', color: '#10b981' },
    { key: 'repuestos', label: 'Repuestos', icon: '⚙️', color: '#3b82f6' },
    { key: 'multas', label: 'Multas/Comparendos', icon: '🚦', color: '#ef4444' },
    { key: 'otros', label: 'Otros', icon: '📦', color: '#8b5cf6' },
];

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return null;
    const size = 160; const r = 60; const cx = size / 2; const cy = size / 2;
    let currentAngle = -Math.PI / 2;
    const slices = data.filter(d => d.value > 0).map(d => {
        const angle = (d.value / total) * 2 * Math.PI;
        const x1 = cx + r * Math.cos(currentAngle);
        const y1 = cy + r * Math.sin(currentAngle);
        currentAngle += angle;
        const x2 = cx + r * Math.cos(currentAngle);
        const y2 = cy + r * Math.sin(currentAngle);
        const largeArc = angle > Math.PI ? 1 : 0;
        return { ...d, path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z` };
    });
    return (
        <div className="donut-wrapper">
            <svg width={size} height={size} style={{ flexShrink: 0 }}>
                {slices.map((s, i) => (
                    <path key={i} d={s.path} fill={s.color} opacity={0.85} stroke="var(--bg-card)" strokeWidth={2} />
                ))}
                <circle cx={cx} cy={cy} r={36} fill="var(--bg-card)" />
                <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize={11} fontWeight={700}>Total</text>
                <text x={cx} y={cy + 10} textAnchor="middle" fill="#94a3b8" fontSize={9}>{formatCurrency(total)}</text>
            </svg>
            <div className="donut-legend">
                {data.filter(d => d.value > 0).map(d => (
                    <div key={d.label} className="legend-item">
                        <div className="legend-dot" style={{ background: d.color }} />
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: 500 }}>{d.label}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatCurrency(d.value)} · {total > 0 ? Math.round((d.value / total) * 100) : 0}%</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ExpenseForm({ motos, initial, onSave, onClose }: { motos: Motorcycle[], initial?: Partial<Expense>, onSave: (d: Partial<Expense>) => Promise<void>, onClose: () => void }) {
    const [form, setForm] = useState({
        motorcycle_id: initial?.motorcycle_id || motos[0]?.id || '',
        category: initial?.category || 'combustible' as ExpenseCategory,
        amount: initial?.amount || '', date: initial?.date || new Date().toISOString().split('T')[0],
        description: initial?.description || '',
    });
    const [saving, setSaving] = useState(false);
    const [scanningInvoice, setScanningInvoice] = useState(false);
    const invoiceRef = useRef<HTMLInputElement>(null);
    const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true);
        await onSave({ ...form, amount: Number(form.amount) });
        setSaving(false);
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h2 className="modal-title">💰 {initial?.id ? 'Editar' : 'Registrar'} Gasto</h2>
                    <button className="btn btn-icon btn-ghost" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    {/* AI Invoice Scanner */}
                    <div style={{ marginBottom: '16px', padding: '14px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px dashed var(--border)' }}>
                        <input ref={invoiceRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setScanningInvoice(true);
                            try {
                                const reader = new FileReader();
                                const base64 = await new Promise<string>(res => { reader.onload = () => res(reader.result as string); reader.readAsDataURL(file); });
                                const parsed = await aiService.scanInvoice(base64);
                                if (parsed.category) set('category', parsed.category);
                                if (parsed.amount) set('amount', String(parsed.amount));
                                if (parsed.description) set('description', parsed.description);
                                if (parsed.date) set('date', parsed.date);
                            } catch { /* ignore scan errors */ }
                            setScanningInvoice(false);
                            if (invoiceRef.current) invoiceRef.current.value = '';
                        }} />
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => invoiceRef.current?.click()} disabled={scanningInvoice} style={{ width: '100%' }}>
                            {scanningInvoice ? <><div className="spinner" style={{ width: '14px', height: '14px' }} />&nbsp;Analizando factura con IA...</> : '📷 Escanear factura con IA'}
                        </button>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '6px' }}>Sube una foto del recibo y la IA llenará los campos automáticamente</div>
                    </div>

                    <div className="form-grid" style={{ marginBottom: '20px' }}>
                        <div className="form-group">
                            <label className="form-label">Moto *</label>
                            <select className="select" value={form.motorcycle_id} onChange={e => set('motorcycle_id', e.target.value)} required>
                                {motos.map(m => <option key={m.id} value={m.id}>{m.brand} {m.model} ({m.plate})</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Categoría</label>
                            <select className="select" value={form.category} onChange={e => set('category', e.target.value)}>
                                {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Monto (COP) *</label>
                            <input className="input" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} required min="0" step="100" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fecha *</label>
                            <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
                        </div>
                        <div className="form-group" style={{ gridColumn: '1/-1' }}>
                            <label className="form-label">Descripción</label>
                            <textarea className="textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Ej: Tanque lleno Terpel..." />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? <><div className="spinner" />&nbsp;Guardando...</> : '💾 Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function FinancesPage() {
    const { user } = useUser();
    const { addToast } = useToast();
    const [motos, setMotos] = useState<Motorcycle[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Expense | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [filterMoto, setFilterMoto] = useState('');

    const fetchData = async () => {
        if (!user) return;
        const [m, e] = await Promise.all([
            motorcycleService.getAll(user.id),
            expenseService.getAll(user.id),
        ]);
        setMotos(m);
        setExpenses(e);
        setLoading(false);
    };

    useRealtime({ expense: fetchData, motorcycle: fetchData }, user?.id);
    useEffect(() => { fetchData(); }, [user]);

    const handleSave = async (data: Partial<Expense>) => {
        if (!user) return;
        try {
            if (editing) {
                await expenseService.update(editing.id, data);
            } else {
                await expenseService.create(data, user.id);
            }
            addToast('success', editing ? 'Gasto actualizado' : 'Gasto registrado 💰');
            setShowForm(false); setEditing(null); fetchData();
        } catch {
            addToast('error', editing ? 'Error al actualizar' : 'Error al registrar');
        }
    };

    const handleDelete = async (id: string) => {
        setDeleting(id);
        try {
            await expenseService.delete(id);
            addToast('success', 'Gasto eliminado');
        } catch {
            addToast('error', 'Error');
        }
        setDeleting(null);
        fetchData();
    };

    const filtered = filterMoto ? expenses.filter(e => e.motorcycle_id === filterMoto) : expenses;
    const motoMap = Object.fromEntries(motos.map(m => [m.id, m]));
    const catMap = Object.fromEntries(CATEGORIES.map(c => [c.key, c]));
    const total = filtered.reduce((s, e) => s + Number(e.amount), 0);

    const chartData = CATEGORIES.map(c => ({
        label: c.label, color: c.color,
        value: filtered.filter(e => e.category === c.key).reduce((s, e) => s + Number(e.amount), 0),
    }));

    if (loading) return (
        <AppLayout><div className="loading-overlay"><div className="spinner spinner-accent" /><span>Cargando finanzas...</span></div></AppLayout>
    );

    if (motos.length === 0) return (
        <AppLayout>
            <div className="empty-state" style={{ marginTop: '60px' }}>
                <div className="empty-icon">💰</div>
                <h2 className="empty-title">Sin motos registradas</h2>
                <p className="empty-desc">Primero registra tu moto en el Garaje</p>
            </div>
        </AppLayout>
    );

    return (
        <AppLayout>
            <div className="animate-fadeIn">
                <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <h1 className="page-title">💰 Finanzas</h1>
                        <p className="page-subtitle">Total: {formatCurrency(total)} · {filtered.length} registros</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ Registrar gasto</button>
                </div>

                {/* Summary cards */}
                <div className="grid-4" style={{ marginBottom: '24px' }}>
                    {CATEGORIES.slice(0, 4).map(c => {
                        const catTotal = filtered.filter(e => e.category === c.key).reduce((s, e) => s + Number(e.amount), 0);
                        return (
                            <div key={c.key} className="glass stat-card">
                                <div className="stat-icon" style={{ background: `${c.color}20` }}>{c.icon}</div>
                                <div className="stat-value" style={{ fontSize: '20px', color: c.color }}>{formatCurrency(catTotal)}</div>
                                <div className="stat-label">{c.label}</div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid-2" style={{ marginBottom: '24px' }}>
                    {/* Chart */}
                    <div className="glass" style={{ padding: '24px' }}>
                        <div className="section-title">📊 Distribución de gastos</div>
                        {total === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px', fontSize: '14px' }}>Sin gastos registrados</div>
                        ) : <DonutChart data={chartData} />}
                    </div>

                    {/* Stats by moto */}
                    <div className="glass" style={{ padding: '24px' }}>
                        <div className="section-title">🏍️ Gastos por moto</div>
                        {motos.map(m => {
                            const mAmount = expenses.filter(e => e.motorcycle_id === m.id).reduce((s, e) => s + Number(e.amount), 0);
                            const pct = total > 0 ? (mAmount / total) * 100 : 0;
                            return (
                                <div key={m.id} style={{ marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
                                        <span style={{ fontWeight: 600 }}>{m.brand} {m.model} · <span style={{ letterSpacing: '1px' }}>{m.plate}</span></span>
                                        <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{formatCurrency(mAmount)}</span>
                                    </div>
                                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Filter */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
                    <select className="select" style={{ maxWidth: '280px' }} value={filterMoto} onChange={e => setFilterMoto(e.target.value)}>
                        <option value="">Todas las motos</option>
                        {motos.map(m => <option key={m.id} value={m.id}>{m.brand} {m.model} ({m.plate})</option>)}
                    </select>
                </div>

                {/* Table */}
                <div className="glass" style={{ padding: '0', overflow: 'hidden' }}>
                    {filtered.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">💸</div>
                            <div className="empty-title">Sin gastos registrados</div>
                            <div className="empty-desc">Registra tu primer gasto</div>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr><th>Moto</th><th>Categoría</th><th>Monto</th><th>Fecha</th><th>Descripción</th><th>Acciones</th></tr>
                                </thead>
                                <tbody>
                                    {filtered.map(e => {
                                        const cat = catMap[e.category];
                                        const moto = motoMap[e.motorcycle_id];
                                        const isAutoMaint = !!e.maintenance_id;
                                        return (
                                            <tr key={e.id}>
                                                <td style={{ fontWeight: 600 }}>{moto ? `${moto.brand} (${moto.plate})` : '—'}</td>
                                                <td>
                                                    <span className="badge" style={{ background: `${cat.color}20`, color: cat.color, border: `1px solid ${cat.color}40` }}>
                                                        {cat.icon} {cat.label}
                                                    </span>
                                                    {isAutoMaint && (
                                                        <span className="badge" style={{ marginLeft: '6px', background: 'var(--accent-alpha)', color: 'var(--accent)', border: '1px solid var(--accent)', fontSize: '11px' }}>
                                                            🔧 Auto
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ fontWeight: 700, color: 'var(--warning)' }}>{formatCurrency(Number(e.amount))}</td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{formatDate(e.date)}</td>
                                                <td style={{ color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.description || '—'}</td>
                                                <td>
                                                    {isAutoMaint ? (
                                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Desde mantenimiento</span>
                                                    ) : (
                                                        <div style={{ display: 'flex', gap: '6px' }}>
                                                            <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(e); setShowForm(true); }}>✏️</button>
                                                            <button className="btn btn-danger btn-sm" disabled={deleting === e.id} onClick={() => handleDelete(e.id)}>
                                                                {deleting === e.id ? <div className="spinner" style={{ width: '14px', height: '14px' }} /> : '🗑️'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            {showForm && <ExpenseForm motos={motos} initial={editing || {}} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />}
        </AppLayout>
    );
}
