import { http } from 'msw';

import { REQUEST_DELAY_MS } from '../../lib/constants';
import { checkoutCash } from '../../lib/db/checkout';
import type { CheckoutPayload } from '../../lib/types';
import { readJsonBody, withJsonHandler } from './shared';

export const checkoutHandlers = [
  http.post('/api/checkout/cash', async ({ request }) => {
    return withJsonHandler(
      async () => {
        const payload = await readJsonBody<CheckoutPayload>(request);
        return checkoutCash(payload);
      },
      {
        delayMs: REQUEST_DELAY_MS.checkout,
        successStatus: 201,
        errorFallback: 'Checkout failed.',
        errorStatus: 401,
      },
    );
  }),
];
