import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { InsforgeProvider } from '@insforge/react';
import { insforge } from './lib/insforge';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
    <InsforgeProvider client={insforge as any}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </InsforgeProvider>
  </StrictMode>
);
