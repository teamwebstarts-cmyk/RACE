import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { QueryProvider } from './providers/query-provider';
import { useAuthStore } from './stores/auth.store';
import './index.css';

useAuthStore.getState().hydrateToken();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <App />
      </QueryProvider>
    </BrowserRouter>
  </StrictMode>,
);
