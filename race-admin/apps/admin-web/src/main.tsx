import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { AuthHydrationGate } from './providers/auth-hydration-gate';
import { QueryProvider } from './providers/query-provider';
import { ThemeProvider } from './providers/theme-provider';
import { useAuthStore } from './stores/auth.store';
import './index.css';

const markAuthHydrated = () => {
  useAuthStore.setState({ hasHydrated: true });
  useAuthStore.getState().hydrateToken();
};

useAuthStore.persist.onFinishHydration(() => {
  markAuthHydrated();
});

if (useAuthStore.persist.hasHydrated()) {
  markAuthHydrated();
}

window.setTimeout(() => {
  if (!useAuthStore.getState().hasHydrated) {
    console.warn('Auth hydration timed out; continuing with default session state');
    markAuthHydrated();
  }
}, 1500);

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
