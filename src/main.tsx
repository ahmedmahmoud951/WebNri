import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './app/App';
import { AuthProvider } from './core/auth/AuthProvider';
import { ApiError, shouldSkipRetry } from './core/api/errors';
import './core/i18n';
import './index.css';

function showBootError(err: unknown) {
  const root = document.getElementById('root');
  if (!root) return;
  const message = err instanceof Error ? `${err.message}\n${err.stack ?? ''}` : String(err);
  root.innerHTML = `<pre style="color:#fb7185;background:#050810;min-height:100vh;margin:0;padding:24px;white-space:pre-wrap;font:14px/1.5 Consolas,monospace">${message.replace(/</g, '&lt;')}</pre>`;
}

window.addEventListener('error', (event) => {
  if (!document.getElementById('root')?.childElementCount) showBootError(event.error ?? event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  if (!document.getElementById('root')?.childElementCount) showBootError(event.reason);
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (shouldSkipRetry(error) || (error instanceof ApiError && error.statusCode === 404)) return false;
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
      refetchOnWindowFocus: false,
      staleTime: 5000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider queryClient={queryClient}>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
