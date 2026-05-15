import { delay, HttpResponse } from 'msw';

import { REQUEST_DELAY_MS } from '../../lib/constants';

export function jsonErrorResponse(
  error: unknown,
  fallbackMessage: string,
  status = 400,
) {
  return HttpResponse.json(
    {
      message: error instanceof Error ? error.message : fallbackMessage,
    },
    { status },
  );
}

export async function readJsonBody<T>(request: Request) {
  return (await request.json()) as T;
}

export async function withJsonHandler<T>(
  handler: () => Promise<T>,
  options: {
    delayMs?: number;
    errorFallback?: string;
    errorStatus?: number;
    successStatus?: number;
  } = {},
) {
  await delay(options.delayMs ?? REQUEST_DELAY_MS.default);

  try {
    const data = await handler();
    return HttpResponse.json({ data }, { status: options.successStatus });
  } catch (error) {
    return jsonErrorResponse(
      error,
      options.errorFallback ?? 'The request could not be completed.',
      options.errorStatus ?? 400,
    );
  }
}
