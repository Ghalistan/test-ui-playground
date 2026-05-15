import type { RegisterPayload } from '../types';
import { validateNickname } from './shared';

export interface RegistrationFieldErrors {
  fullName?: string;
  nickname?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegistrationFields(
  payload: Pick<
    RegisterPayload,
    'fullName' | 'nickname' | 'email' | 'password' | 'passwordConfirmation'
  >,
): RegistrationFieldErrors {
  const errors: RegistrationFieldErrors = {};
  const fullName = payload.fullName?.trim() ?? '';
  const email = payload.email?.trim() ?? '';
  const password = payload.password ?? '';
  const passwordConfirmation = payload.passwordConfirmation ?? '';

  if (!fullName) {
    errors.fullName = 'Full name is required.';
  }

  const nicknameError = validateNickname(payload.nickname ?? '', true);
  if (nicknameError) {
    errors.nickname = nicknameError;
  }

  if (!email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address, like name@example.com.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 12) {
    errors.password = 'Password must be at least 12 characters long.';
  }

  if (!passwordConfirmation) {
    errors.passwordConfirmation = 'Please confirm your password.';
  } else if (password !== passwordConfirmation) {
    errors.passwordConfirmation = 'Password confirmation does not match.';
  }

  return errors;
}

export function getFirstRegistrationError(errors: RegistrationFieldErrors) {
  return (
    errors.fullName ??
    errors.nickname ??
    errors.email ??
    errors.password ??
    errors.passwordConfirmation ??
    null
  );
}
