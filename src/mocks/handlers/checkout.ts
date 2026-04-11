import { delay, HttpResponse, http } from 'msw';

import { checkoutCash } from '../../lib/db/operations';
import type { CheckoutPayload } from '../../lib/types';
import { jsonErrorResponse, readJsonBody } from './shared';

export const checkoutHandlers = [
  http.post('/api/checkout/cash', async ({ request }) => {
    await delay(220);

    try {
      const payload = await readJsonBody<CheckoutPayload>(request);
      const data = await checkoutCash(payload);
      return HttpResponse.json({ data }, { status: 201 });
    } catch (error) {
      return jsonErrorResponse(error, 'Checkout failed.', 401);
    }
  }),
];
