// src/sentry.ts
import * as Sentry from '@sentry/react';

/**
 * Инициализация Sentry для мониторинга ошибок
 * Автоматически пропускается, если DSN не определён в .env
 */
export function initSentry() {
  // Skip Sentry initialization if DSN is not defined
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.log('Sentry DSN not found. Skipping Sentry initialization.');
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
              Sentry.replayIntegration({
                maskAllText: false, // для отладки; в продакшене можно `true`
                blockAllMedia: false,
              }),
    ],
    // Performance Monitoring: 10% в продакшене, 100% в разработке
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0, // 100% при ошибках
    // Environment: автоматически 'development' или 'production'
    environment: import.meta.env.MODE,
  });
}
