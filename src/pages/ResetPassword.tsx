import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { insforge } from '../lib/insforge';

export function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'invalid'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!token) {
            setStatus('invalid');
        }
    }, [token]);

    const passwordStrength = (pwd: string): { score: number; label: string; color: string } => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;

        if (score <= 1) return { score: 20, label: 'Muy débil', color: 'var(--error)' };
        if (score === 2) return { score: 40, label: 'Débil', color: 'var(--warning)' };
        if (score === 3) return { score: 60, label: 'Aceptable', color: 'var(--warning)' };
        if (score === 4) return { score: 80, label: 'Fuerte', color: 'var(--success)' };
        return { score: 100, label: 'Muy fuerte', color: 'var(--success)' };
    };

    const strength = passwordStrength(newPassword);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (newPassword.length < 8) {
            setErrorMsg('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMsg('Las contraseñas no coinciden');
            return;
        }

        setIsLoading(true);

        try {
            const { data, error } = await insforge.database.rpc('reset_custom_password', {
                p_token: token,
                p_new_password: newPassword,
            });

            if (error) {
                if (error.message?.includes('Invalid or expired')) {
                    setErrorMsg('El enlace ha expirado o ya fue utilizado. Solicita uno nuevo.');
                } else {
                    setErrorMsg('Error al restablecer la contraseña. Intenta nuevamente.');
                }
                setStatus('error');
            } else if (data === true) {
                setStatus('success');
            } else {
                setErrorMsg('Error inesperado. Intenta nuevamente.');
                setStatus('error');
            }
        } catch {
            setErrorMsg('Error de conexión. Verifica tu internet e intenta nuevamente.');
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    // Invalid token state
    if (status === 'invalid') {
        return (
            <div className="landing-hero">
                <div style={{
                    maxWidth: '440px', width: '100%',
                    animation: 'slideUp 0.3s ease',
                }}>
                    <div className="glass" style={{ padding: '40px 32px', textAlign: 'center' }}>
                        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔗</div>
                        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>
                            Enlace inválido
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>
                            Este enlace de recuperación no es válido. Es posible que haya expirado o que la URL esté incompleta.
                        </p>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                            onClick={() => navigate('/')}
                        >
                            Volver al inicio
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    if (status === 'success') {
        return (
            <div className="landing-hero">
                <div style={{
                    maxWidth: '440px', width: '100%',
                    animation: 'slideUp 0.3s ease',
                }}>
                    <div className="glass" style={{ padding: '40px 32px', textAlign: 'center' }}>
                        <div style={{
                            width: '72px', height: '72px', borderRadius: '50%',
                            background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px', fontSize: '32px',
                            animation: 'fadeIn 0.5s ease',
                        }}>
                            ✓
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px', color: 'var(--success)' }}>
                            ¡Contraseña actualizada!
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>
                            Tu contraseña se ha restablecido correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
                        </p>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                            onClick={() => navigate('/sign-in')}
                        >
                            🔑 Iniciar sesión
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Form state
    return (
        <div className="landing-hero">
            <div style={{
                maxWidth: '440px', width: '100%',
                animation: 'slideUp 0.3s ease',
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔐</div>
                    <h1 style={{
                        fontSize: '26px', fontWeight: 800,
                        background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        Nueva contraseña
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                        Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.
                    </p>
                </div>

                {/* Form Card */}
                <div className="glass" style={{ padding: '28px' }}>
                    <form onSubmit={handleSubmit}>
                        {/* New Password */}
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="form-label">Nueva contraseña</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="new-password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="input"
                                    placeholder="Mínimo 8 caracteres"
                                    value={newPassword}
                                    onChange={(e) => { setNewPassword(e.target.value); setErrorMsg(''); }}
                                    required
                                    minLength={8}
                                    disabled={isLoading}
                                    style={{ paddingRight: '44px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--text-muted)', fontSize: '16px',
                                        padding: '4px', borderRadius: '4px',
                                    }}
                                    tabIndex={-1}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>

                            {/* Password strength indicator */}
                            {newPassword.length > 0 && (
                                <div style={{ marginTop: '8px' }}>
                                    <div style={{
                                        height: '4px', borderRadius: '999px',
                                        background: 'var(--border)', overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            height: '100%', width: `${strength.score}%`,
                                            background: strength.color, borderRadius: '999px',
                                            transition: 'all 0.3s ease',
                                        }} />
                                    </div>
                                    <span style={{
                                        fontSize: '11px', color: strength.color,
                                        fontWeight: 600, marginTop: '4px', display: 'block',
                                    }}>
                                        {strength.label}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label className="form-label">Confirmar contraseña</label>
                            <input
                                id="confirm-password"
                                type={showPassword ? 'text' : 'password'}
                                className="input"
                                placeholder="Repite tu contraseña"
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); setErrorMsg(''); }}
                                required
                                disabled={isLoading}
                                style={{
                                    borderColor: confirmPassword && confirmPassword !== newPassword
                                        ? 'var(--error)' : undefined,
                                }}
                            />
                            {confirmPassword && confirmPassword !== newPassword && (
                                <span style={{ fontSize: '12px', color: 'var(--error)' }}>
                                    Las contraseñas no coinciden
                                </span>
                            )}
                        </div>

                        {/* Error message */}
                        {errorMsg && (
                            <div style={{
                                padding: '12px 14px', borderRadius: '10px', marginBottom: '16px',
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                                color: '#fca5a5', fontSize: '13px',
                                display: 'flex', alignItems: 'center', gap: '8px',
                            }}>
                                <span>⚠️</span> {errorMsg}
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            id="reset-submit"
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading || !newPassword || !confirmPassword}
                            style={{
                                width: '100%', justifyContent: 'center', padding: '13px',
                                fontSize: '15px', opacity: isLoading ? 0.7 : 1,
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <div className="spinner" style={{ width: '18px', height: '18px' }} />
                                    Actualizando...
                                </>
                            ) : (
                                '🔒 Restablecer contraseña'
                            )}
                        </button>
                    </form>
                </div>

                {/* Back to login link */}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-muted)', fontSize: '13px',
                            fontFamily: 'Inter, sans-serif',
                            transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                        ← Volver al inicio
                    </button>
                </div>
            </div>
        </div>
    );
}
