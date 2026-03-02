import { useNavigate } from 'react-router-dom';
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@insforge/react';

export function Landing() {
    const navigate = useNavigate();

    return (
        <div className="landing-hero">
            <div className="hero-tag">🇨🇴 Diseñado para Colombia</div>
            <h1 className="hero-title">
                Gestiona tu moto<br />
                <span>sin complicaciones</span>
            </h1>
            <p className="hero-subtitle">
                Centraliza el SOAT, tecnomecánica, mantenimientos y gastos de tu moto en un solo lugar. Con IA y datos en tiempo real.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <SignedOut>
                    <SignUpButton>
                        <button className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
                            🚀 Empezar gratis
                        </button>
                    </SignUpButton>
                    <SignInButton>
                        <button className="btn btn-secondary" style={{ padding: '14px 32px', fontSize: '16px' }}>
                            Iniciar sesión
                        </button>
                    </SignInButton>
                </SignedOut>
                <SignedIn>
                    <button className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }} onClick={() => navigate('/dashboard')}>
                        🏠 Ir al dashboard
                    </button>
                </SignedIn>
            </div>

            {/* Plans */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '48px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {[
                    { name: 'Plan Gratuito', price: '$0', features: ['1 moto registrada', 'SOAT & Tecnomecánica', 'Mantenimientos básicos', 'Asistente IA'], highlight: false },
                    { name: 'Plan Pro', price: '$9.900/mes', features: ['Hasta 3 motos', 'Todo del plan gratis', 'Análisis de gastos avanzado', 'Escaneo de imágenes IA', 'Recordatorios inteligentes'], highlight: true },
                ].map(plan => (
                    <div key={plan.name} className={`feature-card glass${plan.highlight ? ' glass-accent' : ''}`}
                        style={{ width: '260px', position: 'relative', overflow: 'hidden' }}>
                        {plan.highlight && (
                            <div style={{
                                position: 'absolute', top: '12px', right: '12px',
                                background: 'var(--accent)', color: '#fff',
                                fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px'
                            }}>Recomendado</div>
                        )}
                        <div className="feature-title" style={{ fontSize: '18px', marginBottom: '4px' }}>{plan.name}</div>
                        <div style={{ fontSize: '26px', fontWeight: 800, color: plan.highlight ? 'var(--accent)' : 'var(--text-primary)', marginBottom: '16px' }}>{plan.price}</div>
                        {plan.features.map(f => (
                            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                <span style={{ color: 'var(--success)' }}>✓</span> {f}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Feature cards */}
            <div className="feature-grid">
                {[
                    { icon: '📄', title: 'Documentos al día', desc: 'Alertas de vencimiento de SOAT y tecnomecánica con semáforo visual.' },
                    { icon: '🔧', title: 'Control de mantenimientos', desc: 'Registra cada servicio y recibe recordatorios por kilómetros recorridos.' },
                    { icon: '💰', title: 'Finanzas de tu moto', desc: 'Analiza cuánto gastas en combustible, repuestos, SOAT y más.' },
                    { icon: '🤖', title: 'Asistente mecánico IA', desc: 'Consulta al experto IA y escanea tu moto con la cámara.' },
                ].map(f => (
                    <div key={f.icon} className="feature-card">
                        <div className="feature-icon">{f.icon}</div>
                        <div className="feature-title">{f.title}</div>
                        <div className="feature-desc">{f.desc}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
