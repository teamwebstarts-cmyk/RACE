import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { AppShell } from './components/layout/AppShell';
import { store } from './redux/store';
import { queryClient } from './services/queryClient';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppShell>
            <App />
          </AppShell>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);
