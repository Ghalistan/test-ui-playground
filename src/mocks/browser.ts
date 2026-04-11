import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

const worker = setupWorker(...handlers);

let started: Promise<void> | null = null;

export function startMockWorker() {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (!started) {
    started = worker
      .start({
        onUnhandledRequest: 'bypass',
        quiet: true,
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      })
      .then(() => undefined);
  }

  return started;
}
