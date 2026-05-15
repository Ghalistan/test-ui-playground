import { validateNickname } from './shared';

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

export function validateProfileUpdateFields(
  payload: ProfileUpdatePayload,
): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {};
  const firstName = payload.firstName?.trim() ?? '';
  const lastName = payload.lastName?.trim() ?? '';

  if (!firstName) {
    errors.firstName = 'First name is required.';
  }

  if (!lastName) {
    errors.lastName = 'Last name is required.';
  }

  const nicknameError = validateNickname(payload.nickname ?? '', true);
  if (nicknameError) {
    errors.nickname = nicknameError;
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
