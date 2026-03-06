import { useEffect, useState } from 'react';
import { useUser } from '@insforge/react';
import { insforge } from '../lib/insforge';
import { Motorcycle, Maintenance } from '../types';
import { getDocStatusBadge, formatCurrency, formatKm } from '../lib/utils';
import { getManualInsights } from '../lib/rag';
import { useRealtime } from '../hooks/useRealtime';
import { AppLayout } from '../components/AppLayout';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
    const { user } = useUser();
    const navigate = useNavigate();
    const [motos, setMotos] = useState<Motorcycle[]>([]);
    const [maint, setMaint] = useState<Maintenance[]>([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState<Record<string, { alert: string; nextService: string; reference: string }>>({});
    const [loadingInsights, setLoadingInsights] = useState(false);

    const fetchData = async () => {
        if (!user) return;
        const [m, ma, ex] = await Promise.all([
            insforge.database.from('motorcycles').select('*').eq('user_id', user.id),
            insforge.database.from('maintenance').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(5),
            insforge.database.from('expenses').select('amount').eq('user_id', user.id),
        ]);
        setMotos(m.data || []);
        setMaint(ma.data || []);
        const total = (ex.data || []).reduce((s: number, e: { amount: number }) => s + Number(e.amount), 0);
        setTotalExpenses(total);
        setLoading(false);
    };

    useRealtime({ motorcycle: fetchData, maintenance: fetchData, expense: fetchData }, user?.id);
    useEffect(() => { fetchData(); }, [user]);

    // Fetch RAG insights for motos with manuals
    useEffect(() => {
        if (!user || motos.length === 0) return;
        const loadInsights = async () => {
            setLoadingInsights(true);
            const { data: manuals } = await insforge.database.from('manuals').select('motorcycle_id').eq('user_id', user.id);
            if (!manuals || manuals.length === 0) { setLoadingInsights(false); return; }
            const motoIds = new Set(manuals.map((m: { motorcycle_id: string }) => m.motorcycle_id));
            const results: Record<string, { alert: string; nextService: string; reference: string }> = {};
            for (const moto of motos.filter(m => motoIds.has(m.id))) {
                const insight = await getManualInsights(moto, user.id);
                if (insight) results[moto.id] = insight;
            }
            setInsights(results);
            setLoadingInsights(false);
        };
        loadInsights();
    }, [motos, user]);

    const expiredDocs = motos.filter(m =>
        m.soat_status === 'expired' || m.tecno_status === 'expired' ||
        m.soat_status === 'expiring_soon' || m.tecno_status === 'expiring_soon'
    );

    if (loading) return (
        <AppLayout>
            <div className="loading-overlay"><div className="spinner spinner-accent" /><span>Cargando dashboard...</span></div>
        </AppLayout>
    );

    return (
        <AppLayout>
            <div className="animate-fadeIn">
                <div className="page-header">
                    <h1 className="page-title">¡Hola, {user?.profile?.name?.split(' ')[0] || user?.email?.split('@')[0]}! 👋</h1>
                    <p className="page-subtitle">Aquí tienes el resumen de tu garaje</p>
                </div>

                {/* Stats */}
                <div className="grid-4" style={{ marginBottom: '28px' }}>
                    {[
                        { icon: '🏍️', value: motos.length, label: 'Motos registradas', color: 'var(--accent)' },
                        { icon: '❗', value: expiredDocs.length, label: 'Docs por atender', color: expiredDocs.length > 0 ? 'var(--error)' : 'var(--success)' },
                        { icon: '🔧', value: maint.length, label: 'Servicios recientes', color: 'var(--accent-2-light)' },
                        { icon: '💰', value: formatCurrency(totalExpenses), label: 'Gastos totales', color: 'var(--warning)' },
                    ].map(s => (
                        <div key={s.label} className="glass stat-card">
                            <div className="stat-icon" style={{ background: `${s.color}20` }}>{s.icon}</div>
                            <div className="stat-value" style={{ color: s.color, fontSize: typeof s.value === 'string' ? '20px' : '32px' }}>{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Alerts */}
                {expiredDocs.length > 0 && (
                    <div style={{
                        border: '1px solid rgba(239,68,68,0.3)', borderRadius: '14px',
                        background: 'rgba(239,68,68,0.07)', padding: '16px 20px',
                        marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px'
                    }}>
                        <span style={{ fontSize: '22px' }}>⚠️</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, marginBottom: '4px' }}>Documentos que requieren atención</div>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                {expiredDocs.map(m => m.plate).join(', ')} — revisa SOAT y/o Tecnomecánica
                            </div>
                        </div>
                        <button className="btn btn-danger btn-sm" onClick={() => navigate('/garage')}>Ver garaje</button>
                    </div>
                )}

                {/* Manual Insights — Premium */}
                {(loadingInsights || Object.keys(insights).length > 0) && (
                    <div style={{
                        marginBottom: '24px', borderRadius: '16px', overflow: 'hidden',
                        background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(59,130,246,0.06) 100%)',
                        border: '1px solid rgba(124,58,237,0.2)',
                    }}>
                        <div style={{
                            padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px',
                            background: 'linear-gradient(90deg, rgba(124,58,237,0.15) 0%, rgba(59,130,246,0.1) 100%)',
                            borderBottom: '1px solid rgba(124,58,237,0.12)',
                        }}>
                            <div style={{
                                width: '38px', height: '38px', borderRadius: '12px',
                                background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '18px', boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
                            }}>📖</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '15px' }}>Insights del Manual</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Recomendaciones basadas en IA y tu manual oficial</div>
                            </div>
                            {loadingInsights && (
                                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div className="spinner spinner-accent" style={{ width: '16px', height: '16px' }} />
                                    <span style={{ fontSize: '12px', color: 'var(--accent)' }}>Analizando...</span>
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '16px 20px' }}>
                            {loadingInsights ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[1, 2].map(i => (
                                        <div key={i} style={{ height: '80px', borderRadius: '12px', background: 'var(--bg-secondary)', animation: 'pulse 1.5s ease-in-out infinite', opacity: 0.5 }} />
                                    ))}
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {motos.filter(m => insights[m.id]).map(moto => {
                                        const ins = insights[moto.id];
                                        return (
                                            <div key={moto.id} style={{
                                                borderRadius: '14px', overflow: 'hidden',
                                                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                                transition: 'transform 0.2s, box-shadow 0.2s',
                                            }}
                                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                            >
                                                <div style={{
                                                    padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px',
                                                    background: 'linear-gradient(90deg, rgba(124,58,237,0.1), transparent)',
                                                    borderBottom: '1px solid var(--border)',
                                                }}>
                                                    <span style={{ fontSize: '18px' }}>🏍️</span>
                                                    <span style={{ fontWeight: 700, fontSize: '14px', flex: 1 }}>{moto.brand} {moto.model}</span>
                                                    <span className="moto-plate" style={{ fontSize: '11px' }}>{moto.plate}</span>
                                                </div>
                                                <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                    <div style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--error)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🚨 Alerta</div>
                                                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{ins.alert}</div>
                                                    </div>
                                                    <div style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                                                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--warning)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🔧 Próximo servicio</div>
                                                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{ins.nextService}</div>
                                                    </div>
                                                </div>
                                                <div style={{
                                                    padding: '10px 16px 14px', fontSize: '12px', color: 'var(--text-muted)',
                                                    background: 'rgba(59,130,246,0.04)', borderTop: '1px solid var(--border)',
                                                    display: 'flex', alignItems: 'flex-start', gap: '6px',
                                                }}>
                                                    <span style={{ color: 'var(--accent)', flexShrink: 0 }}>📄</span>
                                                    <span style={{ fontStyle: 'italic', lineHeight: '1.4' }}>{ins.reference}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="grid-2">
                    {/* Motos */}
                    <div className="glass" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div className="section-title" style={{ margin: 0, flex: 1 }}>🏍️ Mis Motos</div>
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/garage')}>Ver todo</button>
                        </div>
                        {motos.length === 0 ? (
                            <div className="empty-state" style={{ padding: '32px 16px' }}>
                                <div className="empty-icon">🏍️</div>
                                <div className="empty-title">Sin motos registradas</div>
                                <div className="empty-desc">Agrega tu primera moto en el garaje</div>
                                <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={() => navigate('/garage')}>+ Agregar moto</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {motos.map(m => {
                                    const soat = getDocStatusBadge(m.soat_status, m.soat_expiry);
                                    const tecno = getDocStatusBadge(m.tecno_status, m.tecno_expiry);
                                    return (
                                        <div key={m.id} onClick={() => navigate(`/garage/${m.id}`)}
                                            style={{ padding: '14px', borderRadius: '12px', background: 'var(--bg-secondary)', cursor: 'pointer', transition: 'all 0.15s' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontWeight: 700 }}>{m.brand} {m.model} {m.year}</span>
                                                <span className="moto-plate">{m.plate}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                <span className={`badge ${soat.cls}`}>SOAT {soat.label}</span>
                                                <span className={`badge ${tecno.cls}`}>Tecno {tecno.label}</span>
                                                <span className="badge badge-unknown">🛣️ {formatKm(m.current_km)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Recent maintenance */}
                    <div className="glass" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div className="section-title" style={{ margin: 0, flex: 1 }}>🔧 Últimos Servicios</div>
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/maintenance')}>Ver todo</button>
                        </div>
                        {maint.length === 0 ? (
                            <div className="empty-state" style={{ padding: '32px 16px' }}>
                                <div className="empty-icon">🔧</div>
                                <div className="empty-title">Sin mantenimientos</div>
                                <div className="empty-desc">Registra el último servicio de tu moto</div>
                                <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={() => navigate('/maintenance')}>+ Registrar</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {maint.map(m => (
                                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', background: 'var(--bg-secondary)' }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '10px',
                                            background: 'rgba(124,58,237,0.15)', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0
                                        }}>🔩</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{m.type}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.date} · {formatKm(m.km_at_service)}</div>
                                        </div>
                                        <div style={{ fontWeight: 600, color: 'var(--warning)', fontSize: '14px' }}>{formatCurrency(m.cost)}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
