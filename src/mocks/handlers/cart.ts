import { http } from 'msw';

import { REQUEST_DELAY_MS } from '../../lib/constants';
import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
} from '../../lib/db/cart';
import { readJsonBody, withJsonHandler } from './shared';

interface AddCartItemBody {
  productId?: string;
  quantity?: number;
}

interface UpdateCartItemBody {
  quantity?: number;
}

export const cartHandlers = [
  http.get('/api/cart', () => {
    return withJsonHandler(() => getCart(), {
      delayMs: REQUEST_DELAY_MS.quick,
    });
  }),

  http.post('/api/cart/items', async ({ request }) => {
    return withJsonHandler(
      async () => {
        const payload = await readJsonBody<AddCartItemBody>(request);
        return addCartItem(payload.productId ?? '', payload.quantity ?? 1);
      },
      {
        delayMs: REQUEST_DELAY_MS.default,
        successStatus: 201,
        errorFallback: 'Cart request failed.',
      },
    );
  }),

  http.patch('/api/cart/items/:itemId', async ({ params, request }) => {
    return withJsonHandler(
      async () => {
        const payload = await readJsonBody<UpdateCartItemBody>(request);
        return updateCartItem(String(params.itemId), payload.quantity ?? 1);
      },
      {
        delayMs: REQUEST_DELAY_MS.default,
        errorFallback: 'Cart request failed.',
      },
    );
  }),

  http.delete('/api/cart/items/:itemId', async ({ params }) => {
    return withJsonHandler(() => removeCartItem(String(params.itemId)), {
      delayMs: REQUEST_DELAY_MS.default,
      errorFallback: 'Cart request failed.',
    });
  }),
];
