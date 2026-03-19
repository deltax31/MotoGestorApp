import { useEffect, useState } from 'react';
import { useUser } from '@insforge/react';
import { Profile } from '../types';
import { useToast } from '../context/ToastContext';
import { AppLayout } from '../components/AppLayout';
import { profileService } from '../services/profileService';
import { motorcycleService } from '../services/motorcycleService';

export function ProfilePage() {
    const { user } = useUser();
    const { addToast } = useToast();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [motoCount, setMotoCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user) return;
        (async () => {
            const [p, motos] = await Promise.all([
                profileService.get(user.id),
                motorcycleService.getAll(user.id),
            ]);
            const prof = p || { id: user.id, name: user.email?.split('@')[0], phone: null, plan: 'free' as const, created_at: '', updated_at: '' };
            setProfile(prof);
            setForm({ name: prof.name || '', phone: prof.phone || '' });
            setMotoCount(motos.length);
            setLoading(false);
        })();
    }, [user]);

    const handleSaveProfile = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await profileService.update(user.id, { name: form.name, phone: form.phone });
            setProfile(p => p ? { ...p, ...form } : p);
            addToast('success', 'Perfil actualizado ✓');
            setEditing(false);
        } catch {
            addToast('error', 'Error al guardar');
        }
        setSaving(false);
    };

    const handleUpgradePlan = async (plan: 'free' | 'pro') => {
        if (!user) return;
        try {
            await profileService.updatePlan(user.id, plan);
            setProfile(p => p ? { ...p, plan } : p);
            addToast('success', plan === 'pro' ? '⭐ Plan Pro activado!' : '↩️ Cambiado a Plan Gratis');
        } catch {
            addToast('error', 'Error al cambiar plan');
        }
    };

    if (loading) return (
        <AppLayout><div className="loading-overlay"><div className="spinner spinner-accent" /><span>Cargando perfil...</span></div></AppLayout>
    );

    const plans = [
        { key: 'free', name: 'Plan Gratis', price: '$0', motos: 1, features: ['1 moto registrada', 'SOAT & Tecnomecánica', 'Mantenimientos', 'Asistente IA básico'] },
        { key: 'pro', name: 'Plan Pro', price: '$9.900/mes', motos: 3, features: ['Hasta 3 motos', 'Todo del plan Gratis', 'Análisis avanzado de gastos', 'Escaneo IA de imágenes', 'Recordatorios inteligentes'] },
    ];

    return (
        <AppLayout>
            <div className="animate-fadeIn">
                <div className="page-header">
                    <h1 className="page-title">👤 Mi Perfil</h1>
                    <p className="page-subtitle">Gestiona tu cuenta y suscripción</p>
                </div>

                <div className="grid-2" style={{ alignItems: 'start' }}>
                    {/* Profile card */}
                    <div className="glass" style={{ padding: '28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--accent-2), var(--accent-2-light))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '26px', fontWeight: 800, flexShrink: 0
                            }}>
                                {(profile?.name || user?.email)?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '20px' }}>{profile?.name || 'Usuario'}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{user?.email}</div>
                                <span className={`badge ${profile?.plan === 'pro' ? 'badge-active' : 'badge-unknown'}`} style={{ marginTop: '6px' }}>
                                    {profile?.plan === 'pro' ? '⭐ Plan Pro' : '🆓 Plan Gratis'}
                                </span>
                            </div>
                        </div>

                        {editing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Nombre completo</label>
                                    <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Teléfono</label>
                                    <input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+57 300 000 0000" />
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditing(false)}>Cancelar</button>
                                    <button className="btn btn-primary" style={{ flex: 1 }} disabled={saving} onClick={handleSaveProfile}>
                                        {saving ? <><div className="spinner" />&nbsp;Guardando...</> : '💾 Guardar'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                                    {[
                                        { label: 'Nombre', value: profile?.name || 'No configurado', icon: '👤' },
                                        { label: 'Email', value: user?.email || '—', icon: '📧' },
                                        { label: 'Teléfono', value: profile?.phone || 'No configurado', icon: '📱' },
                                        { label: 'Motos registradas', value: `${motoCount}/${profile?.plan === 'pro' ? 3 : 1}`, icon: '🏍️' },
                                    ].map(row => (
                                        <div key={row.label} style={{ display: 'flex', gap: '12px', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
                                            <span>{row.icon}</span>
                                            <div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>{row.label}</div>
                                                <div style={{ fontSize: '14px', fontWeight: 500 }}>{row.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setEditing(true)}>✏️ Editar perfil</button>
                            </>
                        )}
                    </div>

                    {/* Plans */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="section-title">💳 Planes de suscripción</div>
                        {plans.map(plan => {
                            const isCurrent = profile?.plan === plan.key;
                            return (
                                <div key={plan.key} className={`glass${isCurrent ? ' glass-accent' : ''}`} style={{ padding: '24px', position: 'relative' }}>
                                    {isCurrent && (
                                        <div style={{ position: 'absolute', top: '14px', right: '14px', background: 'var(--accent)', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px' }}>
                                            Plan actual
                                        </div>
                                    )}
                                    <div style={{ fontWeight: 800, fontSize: '18px', marginBottom: '4px' }}>{plan.name}</div>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: plan.key === 'pro' ? 'var(--accent)' : 'var(--text-primary)', marginBottom: '12px' }}>{plan.price}</div>
                                    <div style={{ marginBottom: '16px' }}>
                                        {plan.features.map(f => (
                                            <div key={f} style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span> {f}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        className={`btn ${isCurrent ? 'btn-ghost' : 'btn-primary'}`}
                                        style={{ width: '100%', justifyContent: 'center' }}
                                        disabled={isCurrent}
                                        onClick={() => handleUpgradePlan(plan.key as 'free' | 'pro')}
                                    >
                                        {isCurrent ? '✓ Plan actual' : plan.key === 'pro' ? '⭐ Actualizar a Pro' : '↩️ Cambiar a Gratis'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
