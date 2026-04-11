import { delay, HttpResponse, http } from 'msw';

import { listOrders } from '../../lib/db/operations';
import { jsonErrorResponse } from './shared';

export const orderHandlers = [
  http.get('/api/orders', async () => {
    await delay(140);

    try {
      return HttpResponse.json({ data: await listOrders() });
    } catch (error) {
      return jsonErrorResponse(error, 'Orders could not be loaded.', 401);
    }
  }),
];
