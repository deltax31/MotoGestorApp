import { useState, createContext, useContext, useCallback, ReactNode } from 'react';

interface Toast { id: string; type: 'success' | 'error' | 'info'; message: string; }
interface ToastContextType { addToast: (type: Toast['type'], message: string) => void; }

const ToastContext = createContext<ToastContextType>({ addToast: () => { } });

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((type: Toast['type'], message: string) => {
        const id = Math.random().toString(36).slice(2);
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    const icons = { success: '✓', error: '✕', info: 'ℹ' };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`toast toast-${t.type}`}>
                        <span>{icons[t.type]}</span>
                        <span>{t.message}</span>
                        <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}
                            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '16px' }}>×</button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);
