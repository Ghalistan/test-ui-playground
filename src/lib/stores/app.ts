import { writable } from 'svelte/store';

import { apiFetch } from '../api/client';
import type { CartSnapshot, SessionResponse } from '../types';

export type ToastTone = 'success' | 'error' | 'info';

export interface AppToast {
  id: number;
  message: string;
  tone: ToastTone;
  duration: number | null;
  label: string;
}

const MAX_VISIBLE_TOASTS = 5;
const PENDING_TOAST_KEY = 'shopedia-pending-toast';

export const sessionStore = writable<{
  loading: boolean;
  user: SessionResponse['user'];
}>({
  loading: true,
  user: null,
});

export const cartCountStore = writable(0);
export const toastStore = writable<AppToast[]>([]);

let chromeStatePromise: Promise<void> | null = null;
let nextToastId = 1;

function getDefaultToastLabel(tone: ToastTone) {
  if (tone === 'error') {
    return 'Action failed';
  }

  if (tone === 'info') {
    return 'Heads up';
  }

  return 'Cart updated';
}

function createToast(
  message: string,
  tone: ToastTone,
  duration: number | null,
  label: string,
): AppToast {
  return {
    id: nextToastId++,
    message,
    tone,
    duration,
    label,
  };
}

export async function refreshSession() {
  try {
    const data = await apiFetch<SessionResponse>('/api/session');
    sessionStore.set({ loading: false, user: data.user });
  } catch {
    sessionStore.set({ loading: false, user: null });
  }
}

export async function refreshCartCount() {
  try {
    const data = await apiFetch<CartSnapshot>('/api/cart');
    cartCountStore.set(data.count);
  } catch {
    cartCountStore.set(0);
  }
}

export async function syncChromeState() {
  await Promise.all([refreshSession(), refreshCartCount()]);
}

export function hydrateChromeState() {
  if (!chromeStatePromise) {
    chromeStatePromise = syncChromeState().finally(() => {
      chromeStatePromise = null;
    });
  }

  return chromeStatePromise;
}

export function clearToast(id: number) {
  toastStore.update((currentToasts) =>
    currentToasts.filter((toast) => toast.id !== id),
  );
}

export function showToast(
  message: string,
  tone: ToastTone = 'success',
  duration = 2800,
  label = getDefaultToastLabel(tone),
) {
  const toast = createToast(message, tone, duration, label);

  toastStore.update((currentToasts) =>
    [toast, ...currentToasts].slice(0, MAX_VISIBLE_TOASTS),
  );

  return toast.id;
}

export function showPersistentToast(
  message: string,
  tone: ToastTone = 'success',
  label = getDefaultToastLabel(tone),
) {
  const toast = createToast(message, tone, null, label);

  toastStore.update((currentToasts) =>
    [toast, ...currentToasts].slice(0, MAX_VISIBLE_TOASTS),
  );

  return toast.id;
}

export function queueToastForNextLoad(
  message: string,
  tone: ToastTone = 'success',
  duration = 2800,
  label = getDefaultToastLabel(tone),
) {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(
    PENDING_TOAST_KEY,
    JSON.stringify({ message, tone, duration, label }),
  );
}

export function flushQueuedToast() {
  if (typeof window === 'undefined') {
    return;
  }

  const serializedToast = window.sessionStorage.getItem(PENDING_TOAST_KEY);

  if (!serializedToast) {
    return;
  }

  window.sessionStorage.removeItem(PENDING_TOAST_KEY);

  try {
    const { message, tone, duration, label } = JSON.parse(serializedToast) as {
      message?: string;
      tone?: ToastTone;
      duration?: number;
      label?: string;
    };

    if (!message) {
      return;
    }

    const resolvedTone = tone ?? 'success';

    showToast(
      message,
      resolvedTone,
      duration ?? 2800,
      label ?? getDefaultToastLabel(resolvedTone),
    );
  } catch {
    return;
  }
}
