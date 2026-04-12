import type { SessionUser } from '../types';

export interface ProfileUpdatePayload {
  firstName: string;
  lastName: string;
  nickname: string;
  addressLine1: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface ProfileFieldErrors {
  firstName?: string;
  lastName?: string;
  nickname?: string;
  addressLine1?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

const NICKNAME_PATTERN = /^[A-Za-z0-9._#-]+$/;

export function validateProfileUpdateFields(
  payload: ProfileUpdatePayload,
): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {};
  const firstName = payload.firstName?.trim() ?? '';
  const lastName = payload.lastName?.trim() ?? '';
  const nickname = payload.nickname?.trim() ?? '';

  if (!firstName) {
    errors.firstName = 'First name is required.';
  }

  if (!lastName) {
    errors.lastName = 'Last name is required.';
  }

  if (!nickname) {
    errors.nickname = 'Nickname is required.';
  } else if (nickname.length < 5 || !NICKNAME_PATTERN.test(nickname)) {
    errors.nickname =
      'Nickname must be at least 5 characters and can only use letters, numbers, ., -, _, or #.';
  }

  return errors;
}

export function getFirstProfileError(errors: ProfileFieldErrors) {
  return (
    errors.firstName ??
    errors.lastName ??
    errors.nickname ??
    errors.addressLine1 ??
    errors.city ??
    errors.country ??
    errors.postalCode ??
    null
  );
}
