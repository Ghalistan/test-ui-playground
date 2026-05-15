import { http } from 'msw';

import { REQUEST_DELAY_MS } from '../../lib/constants';
import { resetDatabase } from '../../lib/db/reset';
import { withJsonHandler } from './shared';

export const settingsHandlers = [
  http.post('/api/settings/reset', () => {
    return withJsonHandler(() => resetDatabase(), {
      delayMs: REQUEST_DELAY_MS.reset,
    });
  }),
];
