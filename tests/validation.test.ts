import { describe, expect, test } from 'bun:test';

import {
  NICKNAME_MIN_LENGTH,
  NICKNAME_PATTERN,
  validateNickname,
} from '../src/lib/validation/shared';
import {
  getFirstRegistrationError,
  validateRegistrationFields,
} from '../src/lib/validation/register';
import {
  getFirstProfileError,
  validateProfileUpdateFields,
} from '../src/lib/validation/profile';

describe('validateNickname', () => {
  test('returns undefined for valid nickname', () => {
    expect(validateNickname('valid_nick')).toBeUndefined();
    expect(validateNickname('mira_tan')).toBeUndefined();
    expect(validateNickname('user123')).toBeUndefined();
    expect(validateNickname('test.user')).toBeUndefined();
    expect(validateNickname('name#tag')).toBeUndefined();
    expect(validateNickname('hello-world')).toBeUndefined();
  });

  test('returns error for empty nickname when required', () => {
    expect(validateNickname('', true)).toBe('Nickname is required.');
    expect(validateNickname('   ', true)).toBe('Nickname is required.');
  });

  test('returns undefined for empty nickname when not required', () => {
    expect(validateNickname('', false)).toBeUndefined();
    expect(validateNickname('   ', false)).toBeUndefined();
  });

  test('returns error for too-short nickname', () => {
    expect(validateNickname('abc')).toBe(
      'Nickname must be at least 5 characters and can only use letters, numbers, ., -, _, or #.',
    );
    expect(validateNickname('ab12')).toBe(
      'Nickname must be at least 5 characters and can only use letters, numbers, ., -, _, or #.',
    );
  });

  test('returns error for invalid characters', () => {
    expect(validateNickname('hello world')).toBe(
      'Nickname must be at least 5 characters and can only use letters, numbers, ., -, _, or #.',
    );
    expect(validateNickname('hello@world')).toBe(
      'Nickname must be at least 5 characters and can only use letters, numbers, ., -, _, or #.',
    );
    expect(validateNickname('hello!')).toBe(
      'Nickname must be at least 5 characters and can only use letters, numbers, ., -, _, or #.',
    );
  });

  test('pattern constant is correct', () => {
    expect(NICKNAME_PATTERN.test('valid_nick')).toBe(true);
    expect(NICKNAME_PATTERN.test('valid.nick#1')).toBe(true);
    expect(NICKNAME_PATTERN.test('ab cd')).toBe(false);
    expect(NICKNAME_PATTERN.test('ab@cd')).toBe(false);
  });

  test('min length constant is 5', () => {
    expect(NICKNAME_MIN_LENGTH).toBe(5);
  });
});

describe('validateRegistrationFields', () => {
  test('returns no errors for valid payload', () => {
    const errors = validateRegistrationFields({
      fullName: 'Jane Doe',
      nickname: 'jane_doe',
      email: 'jane@example.com',
      password: 'password12345',
      passwordConfirmation: 'password12345',
    });
    expect(Object.keys(errors).length).toBe(0);
  });

  test('returns error for missing full name', () => {
    const errors = validateRegistrationFields({
      fullName: '',
      nickname: 'jane_doe',
      email: 'jane@example.com',
      password: 'password12345',
      passwordConfirmation: 'password12345',
    });
    expect(errors.fullName).toBe('Full name is required.');
  });

  test('returns error for invalid email', () => {
    const errors = validateRegistrationFields({
      fullName: 'Jane Doe',
      nickname: 'jane_doe',
      email: 'not-an-email',
      password: 'password12345',
      passwordConfirmation: 'password12345',
    });
    expect(errors.email).toBe(
      'Enter a valid email address, like name@example.com.',
    );
  });

  test('returns error for short password', () => {
    const errors = validateRegistrationFields({
      fullName: 'Jane Doe',
      nickname: 'jane_doe',
      email: 'jane@example.com',
      password: 'short',
      passwordConfirmation: 'short',
    });
    expect(errors.password).toBe(
      'Password must be at least 12 characters long.',
    );
  });

  test('returns error for mismatched password confirmation', () => {
    const errors = validateRegistrationFields({
      fullName: 'Jane Doe',
      nickname: 'jane_doe',
      email: 'jane@example.com',
      password: 'password12345',
      passwordConfirmation: 'different12345',
    });
    expect(errors.passwordConfirmation).toBe(
      'Password confirmation does not match.',
    );
  });

  test('returns error for invalid nickname via shared validator', () => {
    const errors = validateRegistrationFields({
      fullName: 'Jane Doe',
      nickname: 'ab',
      email: 'jane@example.com',
      password: 'password12345',
      passwordConfirmation: 'password12345',
    });
    expect(errors.nickname).toBeDefined();
  });
});

describe('getFirstRegistrationError', () => {
  test('returns null when no errors', () => {
    expect(getFirstRegistrationError({})).toBeNull();
  });

  test('returns first error in priority order', () => {
    const errors = {
      email: 'bad email',
      nickname: 'bad nickname',
    };
    expect(getFirstRegistrationError(errors)).toBe('bad nickname');
  });
});

describe('validateProfileUpdateFields', () => {
  test('returns no errors for valid payload', () => {
    const errors = validateProfileUpdateFields({
      firstName: 'Jane',
      lastName: 'Doe',
      nickname: 'jane_doe',
      addressLine1: '123 Main St',
      city: 'Singapore',
      country: 'Singapore',
      postalCode: '123456',
    });
    expect(Object.keys(errors).length).toBe(0);
  });

  test('returns error for missing first name', () => {
    const errors = validateProfileUpdateFields({
      firstName: '',
      lastName: 'Doe',
      nickname: 'jane_doe',
      addressLine1: '123 Main St',
      city: 'Singapore',
      country: 'Singapore',
      postalCode: '123456',
    });
    expect(errors.firstName).toBe('First name is required.');
  });

  test('returns error for missing last name', () => {
    const errors = validateProfileUpdateFields({
      firstName: 'Jane',
      lastName: '',
      nickname: 'jane_doe',
      addressLine1: '123 Main St',
      city: 'Singapore',
      country: 'Singapore',
      postalCode: '123456',
    });
    expect(errors.lastName).toBe('Last name is required.');
  });

  test('returns error for invalid nickname (uses shared validator)', () => {
    const errors = validateProfileUpdateFields({
      firstName: 'Jane',
      lastName: 'Doe',
      nickname: 'ab',
      addressLine1: '123 Main St',
      city: 'Singapore',
      country: 'Singapore',
      postalCode: '123456',
    });
    expect(errors.nickname).toBeDefined();
  });
});

describe('getFirstProfileError', () => {
  test('returns null when no errors', () => {
    expect(getFirstProfileError({})).toBeNull();
  });

  test('returns first error in priority order', () => {
    const errors = {
      nickname: 'bad nickname',
      city: 'bad city',
    };
    expect(getFirstProfileError(errors)).toBe('bad nickname');
  });
});
