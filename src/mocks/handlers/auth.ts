import { http } from 'msw';

import { REQUEST_DELAY_MS } from '../../lib/constants';
import {
  getSessionUser,
  login,
  logout,
  requestRegistrationOtp,
  verifyRegistrationOtp,
} from '../../lib/db/auth';
import type { LoginPayload, RegisterPayload } from '../../lib/types';
import { readJsonBody, withJsonHandler } from './shared';

interface VerifyRegistrationOtpBody {
  email?: string;
  otp?: string;
}

export const authHandlers = [
  http.get('/api/session', () => {
    return withJsonHandler(() => getSessionUser().then((user) => ({ user })), {
      delayMs: REQUEST_DELAY_MS.default,
    });
  }),

  http.post('/api/auth/register/request-otp', async ({ request }) => {
    return withJsonHandler(
      async () => {
        const payload = await readJsonBody<RegisterPayload>(request);
        const data = await requestRegistrationOtp(payload);
        return data;
      },
      {
        delayMs: REQUEST_DELAY_MS.reset,
        successStatus: 201,
      },
    );
  }),

  http.post('/api/auth/register/verify-otp', async ({ request }) => {
    return withJsonHandler(
      async () => {
        const payload = await readJsonBody<VerifyRegistrationOtpBody>(request);
        const data = await verifyRegistrationOtp(
          payload.email ?? '',
          payload.otp ?? '',
        );
        return { user: data };
      },
      {
        delayMs: REQUEST_DELAY_MS.auth,
        successStatus: 201,
      },
    );
  }),

  http.post('/api/auth/login', async ({ request }) => {
    return withJsonHandler(
      async () => {
        const payload = await readJsonBody<LoginPayload>(request);
        const data = await login(payload);
        return { user: data };
      },
      {
        delayMs: REQUEST_DELAY_MS.auth,
        errorStatus: 401,
        errorFallback: 'The request could not be completed.',
      },
    );
  }),

  http.post('/api/auth/logout', () => {
    return withJsonHandler(() => logout(), {
      delayMs: REQUEST_DELAY_MS.quick,
    });
  }),
];
