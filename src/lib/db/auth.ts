import { DEFAULT_AVATAR_PATH, DEMO_OTP } from '../constants';
import type {
  LoginPayload,
  PendingRegistration,
  RegisterPayload,
  SessionUser,
  User,
} from '../types';
import {
  createId,
  normalizeEmail,
  splitFullName,
  toSessionUser,
} from '../utils';
import {
  getFirstRegistrationError,
  validateRegistrationFields,
} from '../validation/register';
import { db } from './app-db';
import { getCurrentUserRecord, mergeGuestCartToUser } from './db-helpers';

export async function getSessionUser(): Promise<SessionUser | null> {
  const user = await getCurrentUserRecord();
  return user ? toSessionUser(user) : null;
}

export async function requestRegistrationOtp(payload: RegisterPayload) {
  const email = normalizeEmail(payload.email);
  const fullName = payload.fullName.trim();
  const nickname = payload.nickname.trim();
  const validationError = getFirstRegistrationError(
    validateRegistrationFields({
      fullName,
      nickname,
      email,
      password: payload.password,
      passwordConfirmation: payload.passwordConfirmation,
    }),
  );

  if (validationError) {
    throw new Error(validationError);
  }

  const existingUser = await db.users.where('email').equals(email).first();

  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  await db.transaction('rw', db.pendingRegistrations, async () => {
    const existingPending = await db.pendingRegistrations
      .where('email')
      .equals(email)
      .first();

    if (existingPending) {
      await db.pendingRegistrations.delete(existingPending.id);
    }

    await db.pendingRegistrations.put({
      id: createId('pending'),
      email,
      fullName,
      nickname,
      password: payload.password,
      addressLine1: payload.addressLine1?.trim() ?? '',
      city: payload.city?.trim() ?? '',
      country: payload.country?.trim() ?? '',
      postalCode: payload.postalCode?.trim() ?? '',
      profileImageUrl: payload.profileImageUrl?.trim() || DEFAULT_AVATAR_PATH,
      createdAt: new Date().toISOString(),
      otp: DEMO_OTP,
    } satisfies PendingRegistration);
  });

  return { email };
}

export async function verifyRegistrationOtp(
  email: string,
  otp: string,
): Promise<SessionUser> {
  const normalizedEmail = normalizeEmail(email);

  return db.transaction(
    'rw',
    [db.pendingRegistrations, db.users, db.session, db.cartItems, db.products],
    async () => {
      const pending = await db.pendingRegistrations
        .where('email')
        .equals(normalizedEmail)
        .first();

      if (!pending) {
        throw new Error('No pending registration was found for this email.');
      }

      if (otp.trim() !== pending.otp) {
        throw new Error(
          'The OTP code is invalid. Please use the demo code shown on the page.',
        );
      }

      const { firstName, lastName } = splitFullName(pending.fullName);

      const user: User = {
        id: createId('user'),
        firstName,
        lastName,
        nickname: pending.nickname,
        email: pending.email,
        password: pending.password,
        role: 'customer',
        profileImageUrl: pending.profileImageUrl,
        addressLine1: pending.addressLine1,
        city: pending.city,
        country: pending.country,
        postalCode: pending.postalCode,
        createdAt: new Date().toISOString(),
      };

      await db.users.put(user);
      await db.pendingRegistrations.delete(pending.id);
      await db.session.put({
        key: 'current',
        userId: user.id,
        createdAt: new Date().toISOString(),
      });
      await mergeGuestCartToUser(user.id);

      return toSessionUser(user);
    },
  );
}

export async function login(payload: LoginPayload): Promise<SessionUser> {
  const email = normalizeEmail(payload.email);

  return db.transaction(
    'rw',
    db.users,
    db.session,
    db.cartItems,
    db.products,
    async () => {
      const user = await db.users.where('email').equals(email).first();

      if (!user || user.password !== payload.password) {
        throw new Error('Incorrect email or password.');
      }

      await db.session.put({
        key: 'current',
        userId: user.id,
        createdAt: new Date().toISOString(),
      });
      await mergeGuestCartToUser(user.id);

      return toSessionUser(user);
    },
  );
}

export async function logout() {
  await db.session.delete('current');
  return { ok: true };
}
