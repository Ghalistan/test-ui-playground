import { http } from 'msw';

import { REQUEST_DELAY_MS } from '../../lib/constants';
import { getProductById, listProducts } from '../../lib/db/products';
import { withJsonHandler } from './shared';

function parseOptionalNumber(value: string | null) {
  if (value === null || value.trim() === '') {
    return null;
  }

  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function parseProductQuery(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get('search') ?? '';
  const offset = Number.parseInt(url.searchParams.get('offset') ?? '0', 10);
  const limit = Number.parseInt(url.searchParams.get('limit') ?? '8', 10);
  const minPrice = parseOptionalNumber(url.searchParams.get('minPrice'));
  const maxPrice = parseOptionalNumber(url.searchParams.get('maxPrice'));
  return { search, offset, limit, minPrice, maxPrice };
}

export const productHandlers = [
  http.get('/api/products', async ({ request }) => {
    const { search, offset, limit, minPrice, maxPrice } =
      parseProductQuery(request);
    return withJsonHandler(
      () => listProducts(search, offset, limit, minPrice, maxPrice),
      { delayMs: REQUEST_DELAY_MS.default },
    );
  }),

  http.get('/api/products/:productId', ({ params }) => {
    return withJsonHandler(() => getProductById(String(params.productId)), {
      delayMs: REQUEST_DELAY_MS.quick,
      errorFallback: 'Product request failed.',
      errorStatus: 404,
    });
  }),
];
