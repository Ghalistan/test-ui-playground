import { delay, HttpResponse, http } from 'msw';

import { updateUserProfile } from '../../lib/db/operations';
import type { ProfileUpdatePayload } from '../../lib/validation/profile';
import { jsonErrorResponse, readJsonBody } from './shared';

export const userHandlers = [
  http.put('/api/user/profile', async ({ request }) => {
    await delay(160);

    try {
      const payload = await readJsonBody<ProfileUpdatePayload>(request);
      const user = await updateUserProfile(payload);
      return HttpResponse.json({ data: { user } }, { status: 200 });
    } catch (error) {
      return jsonErrorResponse(error, 'The profile could not be updated.');
    }
  }),
];
