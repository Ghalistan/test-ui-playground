import { describe, expect, test } from 'bun:test';

import { matchesProductSearch } from '../src/lib/db/seed';
import type { Product } from '../src/lib/types';
import { createInitials, formatCurrency, normalizeEmail, splitFullName } from '../src/lib/utils';

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'test-1',
  slug: 'test-product',
  name: 'Test Product',
  price: 10000,
  currency: 'IDR',
  description: 'A test product',
  imageUrl: '/test.svg',
  alt: 'Test',
  category: 'Test',
  featured: false,
  seller: 'Test Shop',
  rating: 4.5,
  stock: 10,
  ...overrides,
});

describe('matchesProductSearch', () => {
  test('returns true for empty query', () => {
    const product = makeProduct();
    expect(matchesProductSearch(product, '')).toBe(true);
    expect(matchesProductSearch(product, '   ')).toBe(true);
  });

  test('matches product name case-insensitively', () => {
    const product = makeProduct({ name: 'Skyline Brew Kettle' });
    expect(matchesProductSearch(product, 'skyline')).toBe(true);
    expect(matchesProductSearch(product, 'SKYLINE')).toBe(true);
    expect(matchesProductSearch(product, 'brew')).toBe(true);
    expect(matchesProductSearch(product, 'kettle')).toBe(true);
  });

  test('matches seller name case-insensitively', () => {
    const product = makeProduct({ seller: 'Northwind Home' });
    expect(matchesProductSearch(product, 'northwind')).toBe(true);
    expect(matchesProductSearch(product, 'NORTHWIND')).toBe(true);
    expect(matchesProductSearch(product, 'home')).toBe(true);
  });

  test('returns false for non-matching query', () => {
    const product = makeProduct({
      name: 'Skyline Brew Kettle',
      seller: 'Northwind Home',
    });
    expect(matchesProductSearch(product, 'nonexistent')).toBe(false);
    expect(matchesProductSearch(product, 'xyz')).toBe(false);
  });
});

describe('formatCurrency', () => {
  test('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('Rp0');
  });

  test('formats positive values with thousand separators', () => {
    expect(formatCurrency(1249000)).toBe('Rp1.249.000');
    expect(formatCurrency(2399000)).toBe('Rp2.399.000');
    expect(formatCurrency(999)).toBe('Rp999');
    expect(formatCurrency(1000)).toBe('Rp1.000');
  });

  test('formats negative values', () => {
    expect(formatCurrency(-500)).toBe('-Rp500');
  });
});

describe('normalizeEmail', () => {
  test('trims and lowercases', () => {
    expect(normalizeEmail('  USER@Example.COM  ')).toBe('user@example.com');
    expect(normalizeEmail('test@test.com')).toBe('test@test.com');
  });
});

describe('splitFullName', () => {
  test('splits two-word name', () => {
    expect(splitFullName('Jane Doe')).toEqual({
      firstName: 'Jane',
      lastName: 'Doe',
    });
  });

  test('splits three-word name', () => {
    expect(splitFullName('John Michael Doe')).toEqual({
      firstName: 'John',
      lastName: 'Michael Doe',
    });
  });

  test('handles single word', () => {
    expect(splitFullName('Cher')).toEqual({
      firstName: 'Cher',
      lastName: '',
    });
  });

  test('handles empty string', () => {
    expect(splitFullName('')).toEqual({
      firstName: '',
      lastName: '',
    });
  });
});

describe('createInitials', () => {
  test('creates initials from two-word name', () => {
    expect(createInitials('Mira Tan')).toBe('MT');
    expect(createInitials('jane doe')).toBe('JD');
  });

  test('creates initials from single word', () => {
    expect(createInitials('Cher')).toBe('C');
  });

  test('handles empty string', () => {
    expect(createInitials('')).toBe('');
  });
});
