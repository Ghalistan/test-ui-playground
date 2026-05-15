import { describe, expect, test } from 'bun:test';

import {
  formatPriceInput,
  parseOptionalPrice,
  parsePositiveInteger,
  sanitizePriceInput,
} from '../src/lib/pricing';

describe('parseOptionalPrice', () => {
  test('returns null for empty or null input', () => {
    expect(parseOptionalPrice(null)).toBeNull();
    expect(parseOptionalPrice('')).toBeNull();
  });

  test('parses integer strings', () => {
    expect(parseOptionalPrice('12345')).toBe(12345);
    expect(parseOptionalPrice('0')).toBe(0);
    expect(parseOptionalPrice('999')).toBe(999);
  });

  test('returns null for non-numeric input', () => {
    expect(parseOptionalPrice('abc')).toBe(null);
    expect(parseOptionalPrice('12.34')).toBe(12);
  });
});

describe('formatPriceInput', () => {
  test('returns empty string for null or zero', () => {
    expect(formatPriceInput(null)).toBe('');
    expect(formatPriceInput(0)).toBe('');
    expect(formatPriceInput(-1)).toBe('');
  });

  test('formats with thousand separators', () => {
    expect(formatPriceInput(1000)).toBe('1.000');
    expect(formatPriceInput(1249000)).toBe('1.249.000');
    expect(formatPriceInput(2399000)).toBe('2.399.000');
    expect(formatPriceInput(999)).toBe('999');
  });
});

describe('sanitizePriceInput', () => {
  test('removes non-digit characters', () => {
    expect(sanitizePriceInput('abc123')).toBe('123');
    expect(sanitizePriceInput('12.34')).toBe('1.234');
    expect(sanitizePriceInput('1 000')).toBe('1.000');
  });

  test('strips leading zeros', () => {
    expect(sanitizePriceInput('00123')).toBe('123');
    expect(sanitizePriceInput('000')).toBe('0');
  });

  test('returns empty for empty input', () => {
    expect(sanitizePriceInput('')).toBe('');
    expect(sanitizePriceInput('abc')).toBe('');
  });

  test('formats with separators', () => {
    expect(sanitizePriceInput('1249000')).toBe('1.249.000');
  });
});

describe('parsePositiveInteger', () => {
  test('returns null for empty input', () => {
    expect(parsePositiveInteger('')).toBeNull();
    expect(parsePositiveInteger('abc')).toBeNull();
  });

  test('parses positive integers', () => {
    expect(parsePositiveInteger('123')).toBe(123);
    expect(parsePositiveInteger('1.000')).toBe(1000);
    expect(parsePositiveInteger('2.399.000')).toBe(2399000);
  });

  test('returns null for zero', () => {
    expect(parsePositiveInteger('0')).toBeNull();
  });

  test('strips non-digits including negative sign', () => {
    expect(parsePositiveInteger('-5')).toBe(5);
  });
});
