import { hydrateRoot } from 'react-dom/client'
import { StartClient } from '@tanstack/react-start/client'
import * as Sentry from '@sentry/react'

import { initSentry } from './sentry'

// Initialize Sentry (will be skipped if DSN is not defined)
initSentry()

// Check if Sentry DSN is defined before creating error boundary
const AppComponent = import.meta.env.VITE_SENTRY_DSN
? Sentry.withErrorBoundary(StartClient, {
  fallback: () => (
    <div className="p-4 text-red-600 bg-red-50 rounded-lg">
    <h2 className="font-bold mb-2">Произошла ошибка</h2>
    <p>Наша команда уведомлена. Пожалуйста, обновите страницу или попробуйте позже.</p>
    </div>
  ),
  onError: (error) => {
    console.error('🐛 ErrorBoundary caught:', error);
    // Опционально: логировать в Convex
    // logErrorToConvex(error);
  },
})
: StartClient

hydrateRoot(document, <AppComponent />)

// ─────────────────────────────────────────────────────────────
// Глобальный перехват ошибок (бесплатный мониторинг через Convex)
// ─────────────────────────────────────────────────────────────

window.addEventListener('error', (event) => {
  console.error('🐛 Global error:', {
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno,
    stack: event.error?.stack,
  });

  // Опционально: отправить в Convex (асинхронно, безопасно)
  if (import.meta.env.VITE_CONVEX_URL) {
    (async () => {
      try {
        // Динамический импорт, чтобы не ломать сборку, если Convex не настроен
        const { convex } = await import('./convex');
        await convex.mutation('errors:log', {
          message: event.message,
          stack: event.error?.stack,
          url: window.location.href,
          userAgent: navigator.userAgent,
        });
      } catch (e) {
        // Тихо игнорируем, чтобы не создавать цикл ошибок
        console.debug('Failed to log error to Convex:', e);
      }
    })();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🐛 Unhandled promise rejection:', event.reason);

  // Опционально: логировать в Convex
  if (import.meta.env.VITE_CONVEX_URL) {
    (async () => {
      try {
        const { convex } = await import('./convex');
        await convex.mutation('errors:log', {
          message: `Unhandled rejection: ${event.reason?.message || event.reason}`,
          stack: event.reason?.stack,
          url: window.location.href,
          userAgent: navigator.userAgent,
        });
      } catch (e) {
        console.debug('Failed to log rejection to Convex:', e);
      }
    })();
  }
});
