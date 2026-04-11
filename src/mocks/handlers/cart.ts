import { delay, HttpResponse, http } from 'msw';

import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
} from '../../lib/db/operations';
import { jsonErrorResponse, readJsonBody } from './shared';

interface AddCartItemBody {
  productId?: string;
  quantity?: number;
}

interface UpdateCartItemBody {
  quantity?: number;
}

export const cartHandlers = [
  http.get('/api/cart', async () => {
    await delay(100);
    return HttpResponse.json({ data: await getCart() });
  }),

  http.post('/api/cart/items', async ({ request }) => {
    await delay(120);

    try {
      const payload = await readJsonBody<AddCartItemBody>(request);
      const data = await addCartItem(
        payload.productId ?? '',
        payload.quantity ?? 1,
      );
      return HttpResponse.json({ data }, { status: 201 });
    } catch (error) {
      return jsonErrorResponse(error, 'Cart request failed.');
    }
  }),

  http.patch('/api/cart/items/:itemId', async ({ params, request }) => {
    await delay(120);

    try {
      const payload = await readJsonBody<UpdateCartItemBody>(request);
      const data = await updateCartItem(
        String(params.itemId),
        payload.quantity ?? 1,
      );
      return HttpResponse.json({ data });
    } catch (error) {
      return jsonErrorResponse(error, 'Cart request failed.');
    }
  }),

  http.delete('/api/cart/items/:itemId', async ({ params }) => {
    await delay(120);

    try {
      const data = await removeCartItem(String(params.itemId));
      return HttpResponse.json({ data });
    } catch (error) {
      return jsonErrorResponse(error, 'Cart request failed.');
    }
  }),
];
