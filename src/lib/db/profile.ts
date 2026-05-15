import type { SessionUser } from '../types';
import { toSessionUser } from '../utils';
import { validateNickname } from '../validation/shared';
import { db } from './app-db';
import { getCurrentUserRecord } from './db-helpers';

export async function updateUserProfile(payload: {
  firstName: string;
  lastName: string;
  nickname: string;
  addressLine1: string;
  city: string;
  country: string;
  postalCode: string;
}): Promise<SessionUser> {
  const user = await getCurrentUserRecord();

  if (!user) {
    throw new Error('Please log in to update your profile.');
  }

  const nickname = payload.nickname.trim();
  const nicknameError = validateNickname(nickname);
  if (nicknameError) {
    throw new Error(nicknameError);
  }

  const firstName = payload.firstName.trim();
  const lastName = payload.lastName.trim();

  if (!firstName) {
    throw new Error('First name is required.');
  }

  if (!lastName) {
    throw new Error('Last name is required.');
  }

  await db.users.update(user.id, {
    firstName,
    lastName,
    nickname,
    addressLine1: payload.addressLine1.trim(),
    city: payload.city.trim(),
    country: payload.country.trim(),
    postalCode: payload.postalCode.trim(),
  });

  const updatedUser = await db.users.get(user.id);
  if (!updatedUser) {
    throw new Error('User not found after update.');
  }

  return toSessionUser(updatedUser);
}
