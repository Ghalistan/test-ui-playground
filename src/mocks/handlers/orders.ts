import { http } from 'msw';

import { REQUEST_DELAY_MS } from '../../lib/constants';
import { listOrders } from '../../lib/db/orders';
import { withJsonHandler } from './shared';

export const orderHandlers = [
  http.get('/api/orders', () => {
    return withJsonHandler(() => listOrders(), {
      delayMs: REQUEST_DELAY_MS.default,
      errorFallback: 'Orders could not be loaded.',
      errorStatus: 401,
    });
  }),
];
