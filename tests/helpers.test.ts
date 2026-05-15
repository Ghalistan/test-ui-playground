import { describe, expect, test } from 'bun:test';

import {
  getCheckoutLoginTarget,
  parseCheckoutParams,
} from '../src/lib/checkout/helpers';
import {
  getSearchInputsFromParams,
  readSearchParams,
  type SearchParams,
} from '../src/lib/url-sync';

describe('getCheckoutLoginTarget', () => {
  test('returns cart login URL for cart mode', () => {
    expect(getCheckoutLoginTarget('cart', null, 1)).toBe(
      '/login?next=%2Fcheckout',
    );
  });

  test('returns instant login URL for instant mode with productId', () => {
    const target = getCheckoutLoginTarget('instant', 'p-test-product', 1);
    const decoded = decodeURIComponent(target);
    expect(decoded).toContain('/login?next=');
    expect(decoded).toContain('checkout');
    expect(decoded).toContain('mode=instant');
    expect(decoded).toContain('productId=p-test-product');
    expect(decoded).toContain('qty=1');
  });

  test('falls back to cart login when instant has no productId', () => {
    expect(getCheckoutLoginTarget('instant', null, 1)).toBe(
      '/login?next=%2Fcheckout',
    );
  });
});

describe('getSearchInputsFromParams', () => {
  test('converts search params to inputs', () => {
    const params: SearchParams = {
      query: 'test query',
      minPrice: 10000,
      maxPrice: 50000,
    };
    const result = getSearchInputsFromParams(params);
    expect(result.query).toBe('test query');
    expect(result.minPriceInput).toBe('10.000');
    expect(result.maxPriceInput).toBe('50.000');
    expect(result.committedMinPrice).toBe(10000);
    expect(result.committedMaxPrice).toBe(50000);
  });

  test('handles null prices', () => {
    const params: SearchParams = {
      query: '',
      minPrice: null,
      maxPrice: null,
    };
    const result = getSearchInputsFromParams(params);
    expect(result.query).toBe('');
    expect(result.minPriceInput).toBe('');
    expect(result.maxPriceInput).toBe('');
    expect(result.committedMinPrice).toBeNull();
    expect(result.committedMaxPrice).toBeNull();
  });
});
