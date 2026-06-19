import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SignIn, SignUp, SignedIn, SignedOut } from '@insforge/react';
import { insforge } from '../lib/insforge';

type AuthMode = 'none' | 'signin' | 'signup' | 'forgotpassword';

function CustomForgotPassword({ onBack }: { onBack: () => void }) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [devLink, setDevLink] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');
        setStatus('idle');

        try {
            // Llama a la Edge Function
            const { data, error } = await insforge.functions.invoke('send-recovery-email', {
                body: { email }
            });

            if (error) throw error;
            
            // LOG PARA DESARROLLO: Si la función devuelve el link, lo imprimimos
            if (data && data.dev_recovery_link) {
                console.log("DEV_LINK_TO_CLICK:", data.dev_recovery_link);
                setDevLink(data.dev_recovery_link);
            }

            setStatus('success');
        } catch (err: unknown) {
            console.error('Error in recovery request:', err);
            // Mensaje genérico para no filtrar si el email existe
            setErrorMsg('Si el correo está registrado, recibirás un enlace de recuperación pronto.');
            setStatus('error'); // Mostramos error pero con mensaje genérico por seguridad
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'success') {
        return (
            <div style={{ 
                background: 'var(--bg-card)',
                padding: '32px',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                textAlign: 'center' 
            }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Revisa tu correo</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px' }}>
                    Si tu correo electrónico coincide con una cuenta existente, recibirás un enlace de restablecimiento en breve.
                </p>
                {devLink && (
                    <div style={{ padding: '16px', background: 'rgba(0, 212, 170, 0.1)', borderRadius: '8px', marginBottom: '24px' }}>
                        <p style={{ fontSize: '12px', color: 'var(--accent)', marginBottom: '8px', fontWeight: 600 }}>[MODO DEV] Enlace de recuperación:</p>
                        <a href={devLink} style={{ color: 'var(--accent)', fontSize: '13px', wordBreak: 'break-all' }}>Haz clic aquí para restablecer</a>
                    </div>
                )}
                <button 
                    onClick={onBack}
                    style={{
                        background: 'none', border: 'none', color: 'var(--text-muted)',
                        fontSize: '14px', cursor: 'pointer', textDecoration: 'underline'
                    }}
                >
                    Volver a iniciar sesión
                </button>
            </div>
        );
    }

    return (
        <div style={{
            background: 'var(--bg-card)',
            padding: '32px',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Recupera tu contraseña</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecerla.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        Correo electrónico
                    </label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@correo.com"
                        className="input"
                        disabled={isLoading}
                        style={{
                            width: '100%', padding: '10px 12px', borderRadius: '8px',
                            border: '1px solid var(--border)', background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)', fontSize: '14px'
                        }}
                    />
                </div>

                {status === 'error' && (
                    <div style={{ 
                        padding: '10px 12px', background: 'rgba(239,68,68,0.1)', 
                        border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px',
                        color: '#fca5a5', fontSize: '13px', marginBottom: '16px',
                        textAlign: 'center'
                    }}>
                        {errorMsg}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px', justifyContent: 'center', marginBottom: '16px', opacity: isLoading ? 0.7 : 1 }}
                >
                    {isLoading ? 'Enviando...' : 'Enviar enlace'}
                </button>
            </form>

            <div style={{ textAlign: 'center' }}>
                <button 
                    onClick={onBack}
                    style={{
                        background: 'none', border: 'none', color: 'var(--text-muted)',
                        fontSize: '13px', cursor: 'pointer'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                    ¿Recordaste tu contraseña? Inicia sesión
                </button>
            </div>
        </div>
    );
}

export function Landing({ initialMode = 'none' }: { initialMode?: AuthMode }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [authMode, setAuthMode] = useState<AuthMode>(initialMode || 'none');

    // Intercept internal navigation from InsForge components
    // When <SignIn> tries to navigate to /sign-up, or <SignUp> to /sign-in,
    // catch it and switch modal instead
    useEffect(() => {
        const path = location.pathname;
        if (path === '/sign-up') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAuthMode('signup');
            navigate('/', { replace: true });
        } else if (path === '/sign-in') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAuthMode('signin');
            navigate('/', { replace: true });
        }
    }, [location.pathname, navigate]);

    // Close modal handler — also cleans the URL
    const closeModal = () => {
        setAuthMode('none');
        if (location.pathname !== '/') {
            navigate('/', { replace: true });
        }
    };

    const renderAuthTitle = () => {
        switch (authMode) {
            case 'signin': return 'Iniciar Sesión';
            case 'signup': return 'Crear Cuenta';
            case 'forgotpassword': return 'Recuperar Contraseña';
            default: return '';
        }
    };

    return (
        <div className="landing-hero">
            {/* Auth Modal */}
            {authMode !== 'none' && (
                <div className="modal-overlay" onClick={(e) => {
                    if (e.target === e.currentTarget) closeModal();
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '440px',
                        animation: 'slideUp 0.25s ease',
                    }}>
                        {/* Modal header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '12px',
                        }}>
                            {authMode === 'forgotpassword' ? (
                                <button
                                    onClick={() => setAuthMode('signin')}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        background: 'none', border: 'none',
                                        color: 'var(--text-secondary)', cursor: 'pointer',
                                        fontSize: '13px', fontFamily: 'Inter, sans-serif',
                                        padding: '6px 10px', borderRadius: '8px',
                                        transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'none'; }}
                                >
                                    ← Volver al login
                                </button>
                            ) : (
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                    {renderAuthTitle()}
                                </span>
                            )}
                            <button
                                onClick={closeModal}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                                    color: 'var(--text-secondary)', cursor: 'pointer',
                                    fontSize: '18px', transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                            >✕</button>
                        </div>

                        {/* Auth forms */}
                        {authMode === 'signin' && (
                            <SignIn
                                title="Bienvenido de vuelta"
                                subtitle="Ingresa a tu cuenta de MotoGestor"
                                emailLabel="Correo electrónico"
                                emailPlaceholder="tu@correo.com"
                                passwordLabel="Contraseña"
                                submitButtonText="Iniciar sesión"
                                loadingButtonText="Ingresando..."
                                signUpText="¿No tienes cuenta?"
                                signUpLinkText="Regístrate aquí"
                                signUpUrl="/sign-up"
                                dividerText="o continúa con"
                                forgotPasswordText="¿Olvidaste tu contraseña?"
                                forgotPasswordUrl="/forgot-password"
                            />
                        )}
                        {authMode === 'signup' && (
                            <SignUp
                                title="Crea tu cuenta"
                                subtitle="Empieza a gestionar tu moto hoy"
                                emailLabel="Correo electrónico"
                                emailPlaceholder="tu@correo.com"
                                passwordLabel="Contraseña"
                                submitButtonText="Crear cuenta"
                                loadingButtonText="Creando cuenta..."
                                signInText="¿Ya tienes cuenta?"
                                signInLinkText="Inicia sesión"
                                signInUrl="/sign-in"
                                dividerText="o regístrate con"
                            />
                        )}
                        {authMode === 'forgotpassword' && (
                            <CustomForgotPassword 
                                onBack={() => setAuthMode('signin')} 
                            />
                        )}
                    </div>
                </div>
            )}

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
                    <button
                        className="btn btn-primary"
                        style={{ padding: '14px 32px', fontSize: '16px' }}
                        onClick={() => setAuthMode('signup')}
                    >
                        🚀 Empezar gratis
                    </button>
                    <button
                        className="btn btn-secondary"
                        style={{ padding: '14px 32px', fontSize: '16px' }}
                        onClick={() => setAuthMode('signin')}
                    >
                        Iniciar sesión
                    </button>
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
