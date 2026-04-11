import { delay, HttpResponse, http } from 'msw';

import { getProductById, listProducts } from '../../lib/db/operations';
import { jsonErrorResponse } from './shared';

function parseOptionalNumber(value: string | null) {
  if (value === null || value.trim() === '') {
    return null;
  }

  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export const productHandlers = [
  http.get('/api/products', async ({ request }) => {
    await delay(120);
    const url = new URL(request.url);
    const search = url.searchParams.get('search') ?? '';
    const offset = Number.parseInt(url.searchParams.get('offset') ?? '0', 10);
    const limit = Number.parseInt(url.searchParams.get('limit') ?? '8', 10);
    const minPrice = parseOptionalNumber(url.searchParams.get('minPrice'));
    const maxPrice = parseOptionalNumber(url.searchParams.get('maxPrice'));

    return HttpResponse.json({
      data: await listProducts(search, offset, limit, minPrice, maxPrice),
    });
  }),

  http.get('/api/products/:productId', async ({ params }) => {
    await delay(100);

    try {
      const product = await getProductById(String(params.productId));
      return HttpResponse.json({ data: product });
    } catch (error) {
      return jsonErrorResponse(error, 'Product request failed.', 404);
    }
  }),
];
