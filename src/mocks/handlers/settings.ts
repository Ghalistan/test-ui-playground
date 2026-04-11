import { delay, HttpResponse, http } from 'msw';

import { resetDatabase } from '../../lib/db/operations';

export const settingsHandlers = [
  http.post('/api/settings/reset', async () => {
    await delay(180);
    return HttpResponse.json({ data: await resetDatabase() });
  }),
];
