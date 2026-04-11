import {
  clearToast,
  flushQueuedToast,
  showPersistentToast,
  showToast,
} from '../stores/app';

let readyPromise: Promise<void> | null = null;

async function bootstrapClientApp() {
  const [{ ensureDatabaseReady }, { startMockWorker }] = await Promise.all([
    import('../db/init'),
    import('../../mocks/browser'),
  ]);

  flushQueuedToast();

  let setupToastId: number | null = null;

  try {
    const didSetup = await ensureDatabaseReady(() => {
      setupToastId = showPersistentToast(
        'Database setup in progress...',
        'info',
        'Database setup',
      );
    });

    if (setupToastId !== null) {
      clearToast(setupToastId);
    }

    if (didSetup) {
      showToast('Database setup finished.', 'success', 2800, 'Database setup');
    }
  } catch (error) {
    if (setupToastId !== null) {
      clearToast(setupToastId);
    }

    showToast('Database setup failed.', 'error', 3800, 'Database setup');
    throw error;
  }

  await startMockWorker();
}

export function ensureClientAppReady() {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (!readyPromise) {
    readyPromise = bootstrapClientApp();
  }

  return readyPromise;
}
