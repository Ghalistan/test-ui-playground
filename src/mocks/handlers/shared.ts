import { HttpResponse } from 'msw';

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
