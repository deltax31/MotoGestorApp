import { useEffect, useState } from 'react';
import { useUser } from '@insforge/react';
import { insforge } from '../lib/insforge';
import { Motorcycle, Profile } from '../types';
import { getDocStatusBadge, formatKm, computeDocStatus } from '../lib/utils';
import { useRealtime } from '../hooks/useRealtime';
import { useToast } from '../context/ToastContext';
import { AppLayout } from '../components/AppLayout';
import { useNavigate } from 'react-router-dom';

const BRANDS = ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'AKT', 'Auteco', 'Royal Enfield', 'Hero', 'TVS', 'KTM', 'Otro'];

function MotoForm({ initial, onSave, onClose }: { initial?: Partial<Motorcycle>, onSave: (data: Partial<Motorcycle>) => Promise<void>, onClose: () => void }) {
    const [form, setForm] = useState({
        brand: initial?.brand || '', model: initial?.model || '', year: initial?.year || new Date().getFullYear(),
        plate: initial?.plate || '', color: initial?.color || '', engine_cc: initial?.engine_cc || '',
        current_km: initial?.current_km || 0, notes: initial?.notes || '',
        soat_expiry: initial?.soat_expiry || '', soat_policy_number: initial?.soat_policy_number || '',
        tecno_expiry: initial?.tecno_expiry || '', tecno_certificate: initial?.tecno_certificate || '',
    });
    const [saving, setSaving] = useState(false);

    const set = (k: string, v: string | number) => setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true);
        const payload: Partial<Motorcycle> = {
            ...form,
            year: Number(form.year), current_km: Number(form.current_km),
            engine_cc: form.engine_cc ? Number(form.engine_cc) : null,
            soat_status: computeDocStatus(form.soat_expiry || null),
            tecno_status: computeDocStatus(form.tecno_expiry || null),
            soat_expiry: form.soat_expiry || null,
            soat_policy_number: form.soat_policy_number || null,
            tecno_expiry: form.tecno_expiry || null,
            tecno_certificate: form.tecno_certificate || null,
            notes: form.notes || null,
        };
        await onSave(payload);
        setSaving(false);
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h2 className="modal-title">{initial?.id ? '✏️ Editar Moto' : '🏍️ Registrar Moto'}</h2>
                    <button className="btn btn-icon btn-ghost" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <div className="section-title">Datos del vehículo</div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Marca *</label>
                                <select className="select" value={form.brand} onChange={e => set('brand', e.target.value)} required>
                                    <option value="">Seleccionar...</option>
                                    {BRANDS.map(b => <option key={b}>{b}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Modelo *</label>
                                <input className="input" value={form.model} onChange={e => set('model', e.target.value)} required placeholder="ej. CB 125F" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Año *</label>
                                <input className="input" type="number" value={form.year} onChange={e => set('year', e.target.value)} required min="1990" max="2030" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Placa *</label>
                                <input className="input" value={form.plate} onChange={e => set('plate', e.target.value.toUpperCase())} required placeholder="ej. ABC123" maxLength={6} style={{ letterSpacing: '3px', fontWeight: 700 }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Color</label>
                                <input className="input" value={form.color} onChange={e => set('color', e.target.value)} placeholder="ej. Rojo" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Cilindraje (cc)</label>
                                <input className="input" type="number" value={form.engine_cc} onChange={e => set('engine_cc', e.target.value)} placeholder="ej. 125" />
                            </div>
                            <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                <label className="form-label">Kilometraje actual *</label>
                                <input className="input" type="number" value={form.current_km} onChange={e => set('current_km', e.target.value)} required min="0" />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <div className="section-title">SOAT</div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Fecha de vencimiento SOAT</label>
                                <input className="input" type="date" value={form.soat_expiry} onChange={e => set('soat_expiry', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">N° Póliza</label>
                                <input className="input" value={form.soat_policy_number} onChange={e => set('soat_policy_number', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <div className="section-title">Tecnomecánica</div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Fecha de vencimiento</label>
                                <input className="input" type="date" value={form.tecno_expiry} onChange={e => set('tecno_expiry', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">N° Certificado</label>
                                <input className="input" value={form.tecno_certificate} onChange={e => set('tecno_certificate', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label className="form-label">Notas adicionales</label>
                        <textarea className="textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Observaciones sobre la moto..." />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? <><div className="spinner" />&nbsp;Guardando...</> : '💾 Guardar moto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function Garage() {
    const { user } = useUser();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [motos, setMotos] = useState<Motorcycle[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Motorcycle | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchMotos = async () => {
        if (!user) return;
        const [{ data: m }, { data: p }] = await Promise.all([
            insforge.database.from('motorcycles').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
            insforge.database.from('profiles').select('*').eq('id', user.id).single(),
        ]);
        setMotos(m || []);
        setProfile(p || null);
        setLoading(false);
    };

    useRealtime({ motorcycle: fetchMotos }, user?.id);
    useEffect(() => { fetchMotos(); }, [user]);

    const maxMotos = profile?.plan === 'pro' ? 3 : 1;

    const handleSave = async (data: Partial<Motorcycle>) => {
        if (!user) return;
        if (editing) {
            const { error } = await insforge.database.from('motorcycles').update({ ...data, updated_at: new Date().toISOString() }).eq('id', editing.id).select();
            if (error) { addToast('error', 'Error al actualizar'); return; }
            addToast('success', 'Moto actualizada correctamente');
        } else {
            if (motos.length >= maxMotos) {
                addToast('error', `Tu plan ${profile?.plan} solo permite ${maxMotos} moto(s). ¡Actualiza a Pro!`);
                return;
            }
            const { error } = await insforge.database.from('motorcycles').insert([{ ...data, user_id: user.id }]).select();
            if (error) { addToast('error', 'Error al registrar la moto'); return; }
            addToast('success', 'Moto registrada exitosamente 🏍️');
        }
        setShowForm(false); setEditing(null);
    };

    const handleDelete = async (id: string) => {
        setDeleting(id);
        const { error } = await insforge.database.from('motorcycles').delete().eq('id', id);
        if (error) { addToast('error', 'Error al eliminar'); } else { addToast('success', 'Moto eliminada'); }
        setDeleting(null);
    };

    if (loading) return (
        <AppLayout><div className="loading-overlay"><div className="spinner spinner-accent" /><span>Cargando garaje...</span></div></AppLayout>
    );

    return (
        <AppLayout>
            <div className="animate-fadeIn">
                <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <h1 className="page-title">🏍️ Mi Garaje</h1>
                        <p className="page-subtitle">
                            {motos.length}/{maxMotos} motos · Plan {profile?.plan === 'pro' ? '⭐ Pro' : '🆓 Gratis'}
                        </p>
                    </div>
                    {motos.length < maxMotos && (
                        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ Nueva moto</button>
                    )}
                </div>

                {/* Plan warning */}
                {motos.length >= maxMotos && (
                    <div className="glass-accent glass" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>⭐</span>
                        <div style={{ flex: 1, fontSize: '14px' }}>
                            {profile?.plan === 'free'
                                ? 'Límite del Plan Gratis alcanzado (1 moto). Actualiza a Pro para registrar hasta 3 motos.'
                                : 'Límite del Plan Pro alcanzado (3 motos).'}
                        </div>
                        {profile?.plan === 'free' && (
                            <button className="btn btn-primary btn-sm" onClick={() => navigate('/profile')}>Actualizar a Pro</button>
                        )}
                    </div>
                )}

                {motos.length === 0 ? (
                    <div className="glass" style={{ padding: '0' }}>
                        <div className="empty-state">
                            <div className="empty-icon">🏍️</div>
                            <h2 className="empty-title">Tu garaje está vacío</h2>
                            <p className="empty-desc">Registra tu primera moto para empezar a gestionar documentos y mantenimientos.</p>
                            <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setShowForm(true)}>+ Registrar primera moto</button>
                        </div>
                    </div>
                ) : (
                    <div className="grid-2">
                        {motos.map(m => {
                            const soat = getDocStatusBadge(m.soat_status, m.soat_expiry);
                            const tecno = getDocStatusBadge(m.tecno_status, m.tecno_expiry);
                            return (
                                <div key={m.id} className="glass moto-card">
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '20px', marginBottom: '4px' }}>{m.brand} {m.model}</div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{m.year} · {m.color || '—'} · {m.engine_cc ? `${m.engine_cc}cc` : '—'}</div>
                                        </div>
                                        <span className="moto-plate">{m.plate}</span>
                                    </div>

                                    {/* km */}
                                    <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '20px' }}>🛣️</span>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '18px' }}>{formatKm(m.current_km)}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Kilometraje actual</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Doc badges */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600 }}>
                                                <span>🛡️</span> SOAT
                                                {m.soat_policy_number && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>· {m.soat_policy_number}</span>}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {m.soat_expiry && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.soat_expiry}</span>}
                                                <span className={`badge ${soat.cls}`}>{soat.label}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600 }}>
                                                <span>🔬</span> Tecnomecánica
                                                {m.tecno_certificate && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>· {m.tecno_certificate}</span>}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {m.tecno_expiry && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.tecno_expiry}</span>}
                                                <span className={`badge ${tecno.cls}`}>{tecno.label}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {m.notes && (
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '16px' }}>
                                            💬 {m.notes}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => navigate(`/garage/${m.id}`)}>📋 Ver detalle</button>
                                        <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => navigate(`/maintenance?moto=${m.id}`)}>🔧 Mantenimientos</button>
                                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(m); setShowForm(true); }}>✏️</button>
                                        <button className="btn btn-danger btn-sm" disabled={deleting === m.id} onClick={() => handleDelete(m.id)}>
                                            {deleting === m.id ? <div className="spinner" /> : '🗑️'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showForm && <MotoForm initial={editing || {}} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />}
        </AppLayout>
    );
}
