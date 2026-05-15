import { http } from 'msw';

import { REQUEST_DELAY_MS } from '../../lib/constants';
import { updateUserProfile } from '../../lib/db/profile';
import type { ProfileUpdatePayload } from '../../lib/validation/profile';
import { readJsonBody, withJsonHandler } from './shared';

export const userHandlers = [
  http.put('/api/user/profile', async ({ request }) => {
    return withJsonHandler(
      async () => {
        const payload = await readJsonBody<ProfileUpdatePayload>(request);
        const user = await updateUserProfile(payload);
        return { user };
      },
      {
        delayMs: REQUEST_DELAY_MS.auth,
        errorFallback: 'The profile could not be updated.',
      },
    );
  }),
];
