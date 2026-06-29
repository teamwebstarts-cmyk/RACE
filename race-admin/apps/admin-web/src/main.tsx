import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { AuthHydrationGate } from './providers/auth-hydration-gate';
import { QueryProvider } from './providers/query-provider';
import { ThemeProvider } from './providers/theme-provider';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <AuthHydrationGate>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </AuthHydrationGate>
      </QueryProvider>
    </BrowserRouter>
  </StrictMode>,
);
