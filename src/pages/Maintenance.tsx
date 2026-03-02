import { useEffect, useState, useRef } from 'react';
import { useUser } from '@insforge/react';
import { useSearchParams } from 'react-router-dom';
import { insforge } from '../lib/insforge';
import { Maintenance, Motorcycle } from '../types';
import { formatCurrency, formatKm, formatDate } from '../lib/utils';
import { useRealtime } from '../hooks/useRealtime';
import { useToast } from '../context/ToastContext';
import { AppLayout } from '../components/AppLayout';

const MAINT_TYPES = [
    'Cambio de aceite', 'Filtro de aire', 'Filtro de aceite', 'Bujías',
    'Frenos delanteros', 'Frenos traseros', 'Cadena y piñones', 'Llantas',
    'Batería', 'Suspensión', 'Revisión general', 'Carburador/inyectores', 'Otro'
];

const KM_INTERVALS: Record<string, number> = {
    'Cambio de aceite': 3000, 'Filtro de aire': 6000, 'Filtro de aceite': 3000,
    'Bujías': 6000, 'Frenos delanteros': 10000, 'Frenos traseros': 10000,
    'Cadena y piñones': 8000, 'Llantas': 20000, 'Batería': 15000,
};

function MaintForm({ motos, initial, onSave, onClose }: { motos: Motorcycle[], initial?: Partial<Maintenance>, onSave: (d: Partial<Maintenance>) => Promise<void>, onClose: () => void }) {
    const [form, setForm] = useState({
        motorcycle_id: initial?.motorcycle_id || motos[0]?.id || '',
        type: initial?.type || '', date: initial?.date || new Date().toISOString().split('T')[0],
        km_at_service: initial?.km_at_service || '', cost: initial?.cost || '',
        workshop: initial?.workshop || '', notes: initial?.notes || '', next_km: initial?.next_km || '',
    });
    const [saving, setSaving] = useState(false);
    const [scanningInvoice, setScanningInvoice] = useState(false);
    const invoiceRef = useRef<HTMLInputElement>(null);
    const set = (k: string, v: string | number) => setForm(p => ({ ...p, [k]: v }));

    const handleTypeChange = (type: string) => {
        set('type', type);
        const moto = motos.find(m => m.id === form.motorcycle_id);
        if (moto && KM_INTERVALS[type]) {
            const km = Number(form.km_at_service) || moto.current_km;
            set('next_km', String(km + KM_INTERVALS[type]));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true);
        await onSave({
            ...form,
            km_at_service: Number(form.km_at_service),
            cost: Number(form.cost),
            next_km: form.next_km ? Number(form.next_km) : null,
        });
        setSaving(false);
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h2 className="modal-title">🔧 {initial?.id ? 'Editar' : 'Registrar'} Servicio</h2>
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
                                const response = await insforge.ai.chat.completions.create({
                                    model: 'anthropic/claude-sonnet-4.5',
                                    messages: [{
                                        role: 'user',
                                        content: [
                                            { type: 'text', text: 'Analiza esta imagen de una factura/recibo de taller de motos en Colombia. Extrae la información y responde SOLO en JSON: {"workshop": "nombre del taller", "cost": número, "type": "tipo de servicio (ej: Cambio de aceite, Frenos, Revisión general)", "notes": "descripción breve", "km": número o null}' },
                                            { type: 'image_url', image_url: { url: base64 } }
                                        ]
                                    }],
                                    maxTokens: 300,
                                });
                                const text = response.choices[0].message.content;
                                const jsonMatch = text.match(/\{[\s\S]*\}/);
                                if (jsonMatch) {
                                    const parsed = JSON.parse(jsonMatch[0]);
                                    if (parsed.workshop) set('workshop', parsed.workshop);
                                    if (parsed.cost) set('cost', String(parsed.cost));
                                    if (parsed.type) set('type', parsed.type);
                                    if (parsed.notes) set('notes', parsed.notes);
                                    if (parsed.km) set('km_at_service', String(parsed.km));
                                }
                            } catch { /* ignore scan errors */ }
                            setScanningInvoice(false);
                            if (invoiceRef.current) invoiceRef.current.value = '';
                        }} />
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => invoiceRef.current?.click()} disabled={scanningInvoice} style={{ width: '100%' }}>
                            {scanningInvoice ? <><div className="spinner" style={{ width: '14px', height: '14px' }} />&nbsp;Analizando factura con IA...</> : '📷 Escanear factura con IA'}
                        </button>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '6px' }}>Sube una foto de la factura y la IA llenará los campos automáticamente</div>
                    </div>

                    <div className="form-grid" style={{ marginBottom: '20px' }}>
                        <div className="form-group">
                            <label className="form-label">Moto *</label>
                            <select className="select" value={form.motorcycle_id} onChange={e => set('motorcycle_id', e.target.value)} required>
                                {motos.map(m => <option key={m.id} value={m.id}>{m.brand} {m.model} ({m.plate})</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Tipo de servicio *</label>
                            <select className="select" value={form.type} onChange={e => handleTypeChange(e.target.value)} required>
                                <option value="">Seleccionar...</option>
                                {MAINT_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fecha *</label>
                            <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Km al servicio *</label>
                            <input className="input" type="number" value={form.km_at_service} onChange={e => set('km_at_service', e.target.value)} required min="0" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Próximo servicio (km)</label>
                            <input className="input" type="number" value={form.next_km} onChange={e => set('next_km', e.target.value)} placeholder="Auto-calculado" min="0" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Costo (COP)</label>
                            <input className="input" type="number" value={form.cost} onChange={e => set('cost', e.target.value)} min="0" step="100" />
                        </div>
                        <div className="form-group" style={{ gridColumn: '1/-1' }}>
                            <label className="form-label">Taller / Mecánico</label>
                            <input className="input" value={form.workshop} onChange={e => set('workshop', e.target.value)} placeholder="Nombre del taller" />
                        </div>
                        <div className="form-group" style={{ gridColumn: '1/-1' }}>
                            <label className="form-label">Notas</label>
                            <textarea className="textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Observaciones..." />
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

export function MaintenancePage() {
    const { user } = useUser();
    const [searchParams] = useSearchParams();
    const { addToast } = useToast();
    const [motos, setMotos] = useState<Motorcycle[]>([]);
    const [records, setRecords] = useState<Maintenance[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Maintenance | null>(null);
    const [filterMoto, setFilterMoto] = useState(searchParams.get('moto') || '');
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchData = async () => {
        if (!user) return;
        const [{ data: m }, { data: r }] = await Promise.all([
            insforge.database.from('motorcycles').select('*').eq('user_id', user.id),
            insforge.database.from('maintenance').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        ]);
        setMotos(m || []);
        setRecords(r || []);
        setLoading(false);
    };

    useRealtime({ maintenance: fetchData, motorcycle: fetchData }, user?.id);
    useEffect(() => { fetchData(); }, [user]);

    const handleSave = async (data: Partial<Maintenance>) => {
        if (!user) return;
        const moto = motos.find(m => m.id === data.motorcycle_id);
        const cost = Number(data.cost) || 0;
        const expenseDesc = `🔧 ${data.type || 'Mantenimiento'}${data.workshop ? ` — ${data.workshop}` : ''}`;

        if (editing) {
            const { error } = await insforge.database.from('maintenance').update({ ...data, updated_at: new Date().toISOString() }).eq('id', editing.id).select();
            if (error) { addToast('error', 'Error al actualizar'); return; }

            // Sync expense: update or create
            if (cost > 0) {
                const { data: existingExp } = await insforge.database.from('expenses').select('id').eq('maintenance_id', editing.id).single();
                if (existingExp) {
                    await insforge.database.from('expenses').update({
                        motorcycle_id: data.motorcycle_id, amount: cost, date: data.date,
                        description: expenseDesc,
                    }).eq('id', existingExp.id);
                } else {
                    await insforge.database.from('expenses').insert([{
                        user_id: user.id, motorcycle_id: data.motorcycle_id, category: 'mantenimiento',
                        amount: cost, date: data.date, description: expenseDesc, maintenance_id: editing.id,
                    }]);
                }
            } else {
                // Cost is 0 → remove linked expense if it exists
                await insforge.database.from('expenses').delete().eq('maintenance_id', editing.id);
            }
        } else {
            const { data: inserted, error } = await insforge.database.from('maintenance').insert([{ ...data, user_id: user.id }]).select().single();
            if (error || !inserted) { addToast('error', 'Error al registrar'); return; }
            // Update moto km
            if (moto && Number(data.km_at_service) > moto.current_km) {
                await insforge.database.from('motorcycles').update({ current_km: data.km_at_service, updated_at: new Date().toISOString() }).eq('id', moto.id);
            }
            // Auto-create expense if cost > 0
            if (cost > 0) {
                await insforge.database.from('expenses').insert([{
                    user_id: user.id, motorcycle_id: data.motorcycle_id, category: 'mantenimiento',
                    amount: cost, date: data.date, description: expenseDesc, maintenance_id: inserted.id,
                }]);
            }
        }
        addToast('success', editing ? 'Servicio actualizado' : 'Servicio registrado 🔧');
        setShowForm(false); setEditing(null); fetchData();
    };

    const handleDelete = async (id: string) => {
        setDeleting(id);
        const { error } = await insforge.database.from('maintenance').delete().eq('id', id);
        if (error) addToast('error', 'Error al eliminar'); else addToast('success', 'Registro eliminado');
        setDeleting(null);
        fetchData();
    };

    const filtered = filterMoto ? records.filter(r => r.motorcycle_id === filterMoto) : records;
    const motoMap = Object.fromEntries(motos.map(m => [m.id, m]));

    const getReminderCards = () => {
        if (motos.length === 0) return [];
        return motos.flatMap(moto => {
            const motoRecords = records.filter(r => r.motorcycle_id === moto.id);
            return Object.entries(KM_INTERVALS).map(([type, interval]) => {
                const last = motoRecords.find(r => r.type === type);
                const nextKm = last?.next_km || (last ? last.km_at_service + interval : null);
                const kmLeft = nextKm ? nextKm - moto.current_km : null;
                if (kmLeft === null || kmLeft > 1000) return null;
                return { moto, type, kmLeft, nextKm };
            }).filter(Boolean);
        });
    };

    const reminders = getReminderCards();

    if (loading) return (
        <AppLayout><div className="loading-overlay"><div className="spinner spinner-accent" /><span>Cargando mantenimientos...</span></div></AppLayout>
    );

    if (motos.length === 0) return (
        <AppLayout>
            <div className="empty-state" style={{ marginTop: '60px' }}>
                <div className="empty-icon">🔧</div>
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
                        <h1 className="page-title">🔧 Mantenimientos</h1>
                        <p className="page-subtitle">{records.length} servicios registrados</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ Registrar servicio</button>
                    <button className="btn btn-ghost" onClick={() => {
                        if (filtered.length === 0) return;
                        const headers = 'Moto,Servicio,Fecha,Km al servicio,Próximo km,Costo,Taller,Notas';
                        const rows = filtered.map(r => {
                            const m = motoMap[r.motorcycle_id];
                            return [
                                m ? `${m.brand} ${m.model} (${m.plate})` : '',
                                r.type, r.date, r.km_at_service, r.next_km || '', r.cost, r.workshop || '', (r.notes || '').replace(/,/g, ';'),
                            ].join(',');
                        });
                        const csv = [headers, ...rows].join('\n');
                        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(blob);
                        a.download = `mantenimientos_${new Date().toISOString().split('T')[0]}.csv`;
                        a.click();
                    }} disabled={filtered.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>📥 Exportar CSV</button>
                </div>

                {/* Smart Reminders */}
                {reminders.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                        <div className="section-title">⚠️ Recordatorios inteligentes</div>
                        <div className="grid-3">
                            {reminders.slice(0, 3).map((r, i) => r && (
                                <div key={i} className="glass glass-accent" style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>{r.type}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>{r.moto.brand} {r.moto.model} · {r.moto.plate}</div>
                                    <div className="progress-bar" style={{ marginBottom: '8px' }}>
                                        <div className="progress-fill" style={{ width: `${Math.max(5, 100 - ((r.kmLeft || 0) / 500) * 100)}%`, background: (r.kmLeft || 0) < 0 ? 'var(--error)' : 'var(--warning)' }} />
                                    </div>
                                    <div style={{ fontSize: '13px', color: (r.kmLeft || 0) < 0 ? 'var(--error)' : 'var(--warning)', fontWeight: 600 }}>
                                        {(r.kmLeft || 0) < 0 ? `Atrasado ${Math.abs(r.kmLeft || 0)} km` : `Faltan ${r.kmLeft} km`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filter */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
                    <select className="select" style={{ maxWidth: '280px' }} value={filterMoto} onChange={e => setFilterMoto(e.target.value)}>
                        <option value="">Todas las motos</option>
                        {motos.map(m => <option key={m.id} value={m.id}>{m.brand} {m.model} ({m.plate})</option>)}
                    </select>
                    <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{filtered.length} registros</span>
                </div>

                {/* Update Km */}
                <div className="glass" style={{ padding: '20px', marginBottom: '24px' }}>
                    <div className="section-title">🛣️ Actualizar kilometraje</div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {motos.map(moto => (
                            <KmUpdater key={moto.id} moto={moto} onUpdate={fetchData} />
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="glass" style={{ padding: '0', overflow: 'hidden' }}>
                    {filtered.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🔧</div>
                            <div className="empty-title">Sin servicios registrados</div>
                            <div className="empty-desc">Registra el primer mantenimiento de tu moto</div>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Moto</th><th>Servicio</th><th>Fecha</th><th>Km</th><th>Siguiente</th><th>Costo</th><th>Taller</th><th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(r => {
                                        const moto = motoMap[r.motorcycle_id];
                                        const kmLeft = r.next_km ? r.next_km - (moto?.current_km || 0) : null;
                                        return (
                                            <tr key={r.id}>
                                                <td style={{ fontWeight: 600 }}>{moto ? `${moto.brand} ${moto.model}` : '—'}</td>
                                                <td>{r.type}</td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{formatDate(r.date)}</td>
                                                <td>{formatKm(r.km_at_service)}</td>
                                                <td>
                                                    {r.next_km ? (
                                                        <span style={{ color: kmLeft !== null && kmLeft < 500 ? 'var(--warning)' : 'var(--text-secondary)', fontSize: '13px' }}>
                                                            {formatKm(r.next_km)}{kmLeft !== null && <> · <span style={{ color: kmLeft < 0 ? 'var(--error)' : 'var(--text-muted)' }}>{kmLeft < 0 ? `−${Math.abs(kmLeft)}km` : `+${kmLeft}km`}</span></>}
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                                <td style={{ color: 'var(--warning)', fontWeight: 600 }}>{r.cost > 0 ? formatCurrency(r.cost) : '—'}</td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{r.workshop || '—'}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(r); setShowForm(true); }}>✏️</button>
                                                        <button className="btn btn-danger btn-sm" disabled={deleting === r.id} onClick={() => handleDelete(r.id)}>
                                                            {deleting === r.id ? <div className="spinner" style={{ width: '14px', height: '14px' }} /> : '🗑️'}
                                                        </button>
                                                    </div>
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
            {showForm && <MaintForm motos={motos} initial={editing || {}} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />}
        </AppLayout>
    );
}

function KmUpdater({ moto, onUpdate }: { moto: Motorcycle, onUpdate: () => void }) {
    const { addToast } = useToast();
    const [km, setKm] = useState(String(moto.current_km));
    const [saving, setSaving] = useState(false);
    const has = Number(km) !== moto.current_km;

    const save = async () => {
        if (!has) return;
        setSaving(true);
        const { error } = await insforge.database.from('motorcycles').update({ current_km: Number(km), updated_at: new Date().toISOString() }).eq('id', moto.id);
        if (error) addToast('error', 'Error'); else { addToast('success', `Km actualizado: ${formatKm(Number(km))}`); onUpdate(); }
        setSaving(false);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>{moto.plate}</span>
            <input className="input" type="number" value={km} onChange={e => setKm(e.target.value)} style={{ width: '120px', padding: '6px 10px', fontSize: '13px' }} min="0" />
            <button className="btn btn-primary btn-sm" disabled={!has || saving} onClick={save}>
                {saving ? <div className="spinner" style={{ width: '14px', height: '14px' }} /> : '✓'}
            </button>
        </div>
    );
}
