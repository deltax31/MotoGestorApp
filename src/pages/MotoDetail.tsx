import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@insforge/react';
import { insforge } from '../lib/insforge';
import { Motorcycle, Manual } from '../types';
import { getDocStatusBadge, formatKm, computeDocStatus } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import { AppLayout } from '../components/AppLayout';
import { ManualUpload } from '../components/ManualUpload';

export function MotoDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useUser();
    const { addToast } = useToast();
    const [moto, setMoto] = useState<Motorcycle | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<Partial<Motorcycle>>({});
    const [saving, setSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [scanningDoc, setScanningDoc] = useState<'soat' | 'tecno' | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const docScanRef = useRef<'soat' | 'tecno'>('soat');
    const [manual, setManual] = useState<Manual | null>(null);

    useEffect(() => {
        if (!user || !id) return;
        const load = async () => {
            const { data } = await insforge.database.from('motorcycles').select('*').eq('id', id).eq('user_id', user.id).single();
            if (data) { setMoto(data); setForm(data); }
            else { addToast('error', 'Moto no encontrada'); navigate('/garage'); }
            // Fetch manual
            const { data: m } = await insforge.database.from('manuals').select('*').eq('motorcycle_id', id).eq('user_id', user.id).order('created_at', { ascending: false }).limit(1);
            if (m && m.length > 0) setManual(m[0]);
            setLoading(false);
        };
        load();
    }, [user, id]);

    const set = (k: string, v: string | number | null) => setForm(p => ({ ...p, [k]: v }));

    const handleSave = async () => {
        if (!moto) return;
        setSaving(true);
        const payload = {
            brand: form.brand, model: form.model, year: Number(form.year),
            plate: form.plate, color: form.color || null,
            engine_cc: form.engine_cc ? Number(form.engine_cc) : null,
            current_km: Number(form.current_km), notes: form.notes || null,
            soat_expiry: form.soat_expiry || null,
            soat_policy_number: form.soat_policy_number || null,
            soat_status: computeDocStatus(form.soat_expiry || null),
            tecno_expiry: form.tecno_expiry || null,
            tecno_certificate: form.tecno_certificate || null,
            tecno_status: computeDocStatus(form.tecno_expiry || null),
            updated_at: new Date().toISOString(),
        };
        const { error } = await insforge.database.from('motorcycles').update(payload).eq('id', moto.id).select();
        if (error) { addToast('error', 'Error al guardar'); }
        else {
            addToast('success', 'Moto actualizada ✓');
            setMoto({ ...moto, ...payload } as Motorcycle);
            setEditing(false);
        }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!moto) return;
        const { error } = await insforge.database.from('motorcycles').delete().eq('id', moto.id);
        if (error) addToast('error', 'Error al eliminar');
        else { addToast('success', 'Moto eliminada'); navigate('/garage'); }
    };

    const handleDocScan = (type: 'soat' | 'tecno') => {
        docScanRef.current = type;
        fileRef.current?.click();
    };

    const handleDocFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const type = docScanRef.current;
        setScanningDoc(type);
        try {
            const reader = new FileReader();
            const base64 = await new Promise<string>(res => {
                reader.onload = () => res(reader.result as string);
                reader.readAsDataURL(file);
            });
            const prompt = type === 'soat'
                ? 'Analiza esta imagen de un documento SOAT colombiano. Extrae ÚNICAMENTE la fecha de vencimiento en formato YYYY-MM-DD. Si encuentras un número de póliza, extráelo también. Responde SOLO en formato JSON: {"expiry": "YYYY-MM-DD", "policy": "número o null"}'
                : 'Analiza esta imagen de un certificado de Tecnomecánica colombiano. Extrae ÚNICAMENTE la fecha de vencimiento en formato YYYY-MM-DD. Si encuentras un número de certificado, extráelo también. Responde SOLO en formato JSON: {"expiry": "YYYY-MM-DD", "certificate": "número o null"}';

            const response = await insforge.ai.chat.completions.create({
                model: 'anthropic/claude-sonnet-4.5',
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { type: 'image_url', image_url: { url: base64 } }
                    ]
                }],
                maxTokens: 200,
            });

            const text = response.choices[0].message.content;
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (type === 'soat') {
                    if (parsed.expiry) set('soat_expiry', parsed.expiry);
                    if (parsed.policy) set('soat_policy_number', parsed.policy);
                    addToast('success', '🛡️ SOAT escaneado con IA');
                } else {
                    if (parsed.expiry) set('tecno_expiry', parsed.expiry);
                    if (parsed.certificate) set('tecno_certificate', parsed.certificate);
                    addToast('success', '🔬 Tecnomecánica escaneada con IA');
                }
            } else {
                addToast('error', 'No se pudo extraer la información del documento');
            }
        } catch {
            addToast('error', 'Error al escanear el documento');
        }
        setScanningDoc(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    const calculateDaysLeft = (expiry?: string | null) => {
        if (!expiry) return null;
        return Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000);
    };

    if (loading) return (
        <AppLayout><div className="loading-overlay"><div className="spinner spinner-accent" /><span>Cargando detalle...</span></div></AppLayout>
    );

    if (!moto) return null;

    const soat = getDocStatusBadge(moto.soat_status, moto.soat_expiry);
    const tecno = getDocStatusBadge(moto.tecno_status, moto.tecno_expiry);
    const soatDays = calculateDaysLeft(moto.soat_expiry);
    const tecnoDays = calculateDaysLeft(moto.tecno_expiry);

    return (
        <AppLayout>
            <div className="animate-fadeIn">
                {/* Hidden file input for doc scanning */}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleDocFileChange} />

                {/* Header */}
                <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/garage')} style={{ padding: '8px 12px' }}>← Volver</button>
                        <div>
                            <h1 className="page-title">{editing ? '✏️ Editando' : '🏍️'} {moto.brand} {moto.model}</h1>
                            <p className="page-subtitle">Placa: {moto.plate} · Año {moto.year}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {!editing ? (
                            <>
                                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>✏️ Editar</button>
                                <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteConfirm(true)}>🗑️ Eliminar</button>
                            </>
                        ) : (
                            <>
                                <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setForm(moto); }}>Cancelar</button>
                                <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                                    {saving ? <><div className="spinner" />&nbsp;Guardando...</> : '💾 Guardar'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid-2" style={{ marginTop: '12px' }}>
                    {/* Vehicle Info */}
                    <div className="glass" style={{ padding: '24px' }}>
                        <div className="section-title">🏍️ Datos del vehículo</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Marca</div>
                                {editing ? (
                                    <input className="input" value={form.brand || ''} onChange={e => set('brand', e.target.value)} />
                                ) : (
                                    <div style={{ fontWeight: 600 }}>{moto.brand}</div>
                                )}
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Modelo</div>
                                {editing ? (
                                    <input className="input" value={form.model || ''} onChange={e => set('model', e.target.value)} />
                                ) : (
                                    <div style={{ fontWeight: 600 }}>{moto.model}</div>
                                )}
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Año</div>
                                {editing ? (
                                    <input className="input" type="number" value={form.year || ''} onChange={e => set('year', e.target.value)} />
                                ) : (
                                    <div style={{ fontWeight: 600 }}>{moto.year}</div>
                                )}
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Placa</div>
                                {editing ? (
                                    <input className="input" value={form.plate || ''} onChange={e => set('plate', e.target.value.toUpperCase())} style={{ letterSpacing: '3px', fontWeight: 700 }} />
                                ) : (
                                    <div className="moto-plate">{moto.plate}</div>
                                )}
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Color</div>
                                {editing ? (
                                    <input className="input" value={form.color || ''} onChange={e => set('color', e.target.value)} />
                                ) : (
                                    <div style={{ fontWeight: 600 }}>{moto.color || '—'}</div>
                                )}
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Cilindraje</div>
                                {editing ? (
                                    <input className="input" type="number" value={form.engine_cc || ''} onChange={e => set('engine_cc', e.target.value)} />
                                ) : (
                                    <div style={{ fontWeight: 600 }}>{moto.engine_cc ? `${moto.engine_cc} cc` : '—'}</div>
                                )}
                            </div>
                            <div style={{ gridColumn: '1/-1' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Kilometraje</div>
                                {editing ? (
                                    <input className="input" type="number" value={form.current_km || 0} onChange={e => set('current_km', e.target.value)} />
                                ) : (
                                    <div style={{ fontWeight: 700, fontSize: '22px', color: 'var(--accent)' }}>{formatKm(moto.current_km)}</div>
                                )}
                            </div>
                        </div>
                        {(editing || moto.notes) && (
                            <div style={{ marginTop: '16px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Notas</div>
                                {editing ? (
                                    <textarea className="textarea" value={form.notes || ''} onChange={e => set('notes', e.target.value)} placeholder="Observaciones..." />
                                ) : (
                                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                        💬 {moto.notes}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Documents */}
                    <div className="glass" style={{ padding: '24px' }}>
                        <div className="section-title">📄 Documentos legales</div>

                        {/* SOAT */}
                        <div style={{
                            padding: '16px', borderRadius: '12px', marginBottom: '16px',
                            background: 'var(--bg-secondary)',
                            borderLeft: `4px solid ${soatDays !== null && soatDays < 0 ? 'var(--error)' : soatDays !== null && soatDays <= 30 ? 'var(--warning)' : 'var(--success)'}`,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '20px' }}>🛡️</span>
                                    <span style={{ fontWeight: 700, fontSize: '16px' }}>SOAT</span>
                                    <span className={`badge ${soat.cls}`}>{soat.label}</span>
                                </div>
                                {editing && (
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleDocScan('soat')} disabled={scanningDoc === 'soat'}
                                        style={{ fontSize: '12px' }}>
                                        {scanningDoc === 'soat' ? <><div className="spinner" style={{ width: '12px', height: '12px' }} />&nbsp;Escaneando...</> : '📷 Escanear con IA'}
                                    </button>
                                )}
                            </div>
                            {editing ? (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontSize: '12px' }}>Vencimiento</label>
                                        <input className="input" type="date" value={form.soat_expiry || ''} onChange={e => set('soat_expiry', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontSize: '12px' }}>N° Póliza</label>
                                        <input className="input" value={form.soat_policy_number || ''} onChange={e => set('soat_policy_number', e.target.value)} />
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
                                    <div>
                                        <span style={{ color: 'var(--text-muted)' }}>Vence: </span>
                                        <span style={{ fontWeight: 600 }}>{moto.soat_expiry || '—'}</span>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--text-muted)' }}>Póliza: </span>
                                        <span style={{ fontWeight: 600 }}>{moto.soat_policy_number || '—'}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tecnomecánica */}
                        <div style={{
                            padding: '16px', borderRadius: '12px',
                            background: 'var(--bg-secondary)',
                            borderLeft: `4px solid ${tecnoDays !== null && tecnoDays < 0 ? 'var(--error)' : tecnoDays !== null && tecnoDays <= 30 ? 'var(--warning)' : 'var(--success)'}`,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '20px' }}>🔬</span>
                                    <span style={{ fontWeight: 700, fontSize: '16px' }}>Tecnomecánica</span>
                                    <span className={`badge ${tecno.cls}`}>{tecno.label}</span>
                                </div>
                                {editing && (
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleDocScan('tecno')} disabled={scanningDoc === 'tecno'}
                                        style={{ fontSize: '12px' }}>
                                        {scanningDoc === 'tecno' ? <><div className="spinner" style={{ width: '12px', height: '12px' }} />&nbsp;Escaneando...</> : '📷 Escanear con IA'}
                                    </button>
                                )}
                            </div>
                            {editing ? (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontSize: '12px' }}>Vencimiento</label>
                                        <input className="input" type="date" value={form.tecno_expiry || ''} onChange={e => set('tecno_expiry', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontSize: '12px' }}>N° Certificado</label>
                                        <input className="input" value={form.tecno_certificate || ''} onChange={e => set('tecno_certificate', e.target.value)} />
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
                                    <div>
                                        <span style={{ color: 'var(--text-muted)' }}>Vence: </span>
                                        <span style={{ fontWeight: 600 }}>{moto.tecno_expiry || '—'}</span>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--text-muted)' }}>Certificado: </span>
                                        <span style={{ fontWeight: 600 }}>{moto.tecno_certificate || '—'}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Manual Upload */}
                <div className="glass" style={{ padding: '20px', marginTop: '20px' }}>
                    <ManualUpload motorcycleId={moto.id} existingManual={manual} onComplete={async () => {
                        const { data: m } = await insforge.database.from('manuals').select('*').eq('motorcycle_id', moto.id).eq('user_id', user!.id).order('created_at', { ascending: false }).limit(1);
                        if (m && m.length > 0) setManual(m[0]);
                    }} />
                </div>

                {/* Quick actions */}
                <div className="glass" style={{ padding: '20px', marginTop: '20px' }}>
                    <div className="section-title">⚡ Acciones rápidas</div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary" onClick={() => navigate(`/maintenance?moto=${moto.id}`)}>🔧 Ver mantenimientos</button>
                        <button className="btn btn-secondary" onClick={() => navigate(`/finances`)}>💰 Ver finanzas</button>
                        <button className="btn btn-secondary" onClick={() => navigate(`/ai`)}>🤖 Consultar IA</button>
                    </div>
                </div>

                {/* Delete confirmation modal */}
                {showDeleteConfirm && (
                    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowDeleteConfirm(false)}>
                        <div className="modal" style={{ maxWidth: '420px' }}>
                            <div className="modal-header">
                                <h2 className="modal-title">⚠️ Confirmar eliminación</h2>
                                <button className="btn btn-icon btn-ghost" onClick={() => setShowDeleteConfirm(false)}>✕</button>
                            </div>
                            <div style={{ padding: '20px' }}>
                                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                    ¿Estás seguro de eliminar <strong>{moto.brand} {moto.model}</strong> ({moto.plate})?
                                    Esta acción no se puede deshacer y se perderá toda la información asociada.
                                </p>
                                <div className="modal-footer">
                                    <button className="btn btn-ghost" onClick={() => setShowDeleteConfirm(false)}>Cancelar</button>
                                    <button className="btn btn-danger" onClick={handleDelete}>🗑️ Sí, eliminar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
