import { NavLink } from 'react-router-dom';
import { useUser } from '@insforge/react';
import { insforge } from '../lib/insforge';
import { useToast } from '../context/ToastContext';

const navItems = [
    { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/garage', icon: '🏍️', label: 'Mi Garaje' },
    { to: '/maintenance', icon: '🔧', label: 'Mantenimientos' },
    { to: '/finances', icon: '💰', label: 'Finanzas' },
    { to: '/ai', icon: '🤖', label: 'Asistente IA' },
    { to: '/profile', icon: '👤', label: 'Mi Perfil' },
];

export function Sidebar() {
    const { user } = useUser();
    const { addToast } = useToast();

    const handleLogout = async () => {
        await insforge.auth.signOut();
        addToast('info', 'Sesión cerrada');
        window.location.href = '/';
    };

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--accent), #e65100)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '20px', flexShrink: 0
                    }}>🏍️</div>
                    <div>
                        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '18px' }}>MotoGestor</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Colombia</div>
                    </div>
                </div>
            </div>

            {/* Realtime indicator */}
            <div style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)' }}>
                <div className="realtime-dot" />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Actualización en vivo</span>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '12px' }}>
                {navItems.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                        style={{ marginBottom: '2px' }}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User area */}
            <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent-2), var(--accent-2-light))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '15px', fontWeight: 700, flexShrink: 0
                    }}>
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.profile?.name || user?.email?.split('@')[0]}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                    </div>
                </div>
                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '13px' }} onClick={handleLogout}>
                    🚪 Cerrar sesión
                </button>
            </div>
        </aside>
    );
}
