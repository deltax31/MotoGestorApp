import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, useAuth } from '@insforge/react';
import { ToastProvider } from './context/ToastContext';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Garage } from './pages/Garage';
import { MotoDetail } from './pages/MotoDetail';
import { MaintenancePage } from './pages/Maintenance';
import { FinancesPage } from './pages/Finances';
import { AIPage } from './pages/AI';
import { ProfilePage } from './pages/Profile';
import './App.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
      <div className="spinner spinner-accent" style={{ width: '36px', height: '36px', borderWidth: '3px' }} />
      <span style={{ fontSize: '14px' }}>Cargando MotoGestor...</span>
    </div>
  );
  if (!isSignedIn) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={
          <>
            <SignedOut><Landing /></SignedOut>
            <SignedIn><Navigate to="/dashboard" replace /></SignedIn>
          </>
        } />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/garage" element={<ProtectedRoute><Garage /></ProtectedRoute>} />
        <Route path="/garage/:id" element={<ProtectedRoute><MotoDetail /></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />
        <Route path="/finances" element={<ProtectedRoute><FinancesPage /></ProtectedRoute>} />
        <Route path="/ai" element={<ProtectedRoute><AIPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}
