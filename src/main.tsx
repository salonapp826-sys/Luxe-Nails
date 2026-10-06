import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { installGlobalFetchInterceptor } from '@/lib/apiClient';

// Install global resilient fetch interceptor for 404/500 and network dropouts
installGlobalFetchInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
