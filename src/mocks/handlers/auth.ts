import { delay, HttpResponse, http } from 'msw';

import {
  getSessionUser,
  login,
  logout,
  requestRegistrationOtp,
  verifyRegistrationOtp,
} from '../../lib/db/operations';
import type { LoginPayload, RegisterPayload } from '../../lib/types';
import { jsonErrorResponse, readJsonBody } from './shared';

interface VerifyRegistrationOtpBody {
  email?: string;
  otp?: string;
}

export const authHandlers = [
  http.get('/api/session', async () => {
    await delay(120);
    return HttpResponse.json({ data: { user: await getSessionUser() } });
  }),

  http.post('/api/auth/register/request-otp', async ({ request }) => {
    await delay(180);

    try {
      const payload = await readJsonBody<RegisterPayload>(request);
      const data = await requestRegistrationOtp(payload);
      return HttpResponse.json({ data }, { status: 201 });
    } catch (error) {
      return jsonErrorResponse(error, 'The request could not be completed.');
    }
  }),

  http.post('/api/auth/register/verify-otp', async ({ request }) => {
    await delay(160);

    try {
      const payload = await readJsonBody<VerifyRegistrationOtpBody>(request);
      const data = await verifyRegistrationOtp(
        payload.email ?? '',
        payload.otp ?? '',
      );
      return HttpResponse.json({ data: { user: data } }, { status: 201 });
    } catch (error) {
      return jsonErrorResponse(error, 'The request could not be completed.');
    }
  }),

  http.post('/api/auth/login', async ({ request }) => {
    await delay(160);

    try {
      const payload = await readJsonBody<LoginPayload>(request);
      const data = await login(payload);
      return HttpResponse.json({ data: { user: data } });
    } catch (error) {
      return jsonErrorResponse(
        error,
        'The request could not be completed.',
        401,
      );
    }
  }),

  http.post('/api/auth/logout', async () => {
    await delay(100);
    return HttpResponse.json({ data: await logout() });
  }),
];
