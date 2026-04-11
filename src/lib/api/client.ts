import { ensureClientAppReady } from '../runtime/bootstrap';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiFetch<T>(input: string, init: RequestInit = {}) {
  await ensureClientAppReady();

  const headers = new Headers(init.headers);

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      payload.message ?? 'The request could not be completed.',
      response.status,
    );
  }

  return (payload.data ?? payload) as T;
}
