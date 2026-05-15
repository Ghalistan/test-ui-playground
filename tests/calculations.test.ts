import { describe, expect, test } from 'bun:test';

import {
  calculateItemCount,
  calculateSubtotal,
  capQuantity,
  clampQuantity,
  mergeGuestQuantity,
} from '../src/lib/db/calculations';

describe('clampQuantity', () => {
  test('adds to existing quantity', () => {
    expect(clampQuantity(1, 0, 10)).toBe(1);
    expect(clampQuantity(2, 3, 10)).toBe(5);
  });

  test('caps at stock limit', () => {
    expect(clampQuantity(5, 7, 10)).toBe(10);
    expect(clampQuantity(1, 9, 10)).toBe(10);
    expect(clampQuantity(10, 0, 5)).toBe(5);
  });

  test('handles zero existing quantity', () => {
    expect(clampQuantity(3, 0, 10)).toBe(3);
    expect(clampQuantity(3, 0, 1)).toBe(1);
  });

  test('handles zero stock', () => {
    expect(clampQuantity(1, 0, 0)).toBe(0);
  });
});

describe('mergeGuestQuantity', () => {
  test('merges guest cart with existing user cart', () => {
    expect(mergeGuestQuantity(2, 3, 10)).toBe(5);
  });

  test('caps at stock limit', () => {
    expect(mergeGuestQuantity(8, 5, 10)).toBe(10);
  });

  test('handles zero existing quantity', () => {
    expect(mergeGuestQuantity(3, 0, 10)).toBe(3);
  });
});

describe('capQuantity', () => {
  test('returns quantity when under stock', () => {
    expect(capQuantity(3, 10)).toBe(3);
  });

  test('caps at stock', () => {
    expect(capQuantity(15, 10)).toBe(10);
    expect(capQuantity(10, 10)).toBe(10);
  });

  test('handles zero stock', () => {
    expect(capQuantity(1, 0)).toBe(0);
  });
});

describe('calculateSubtotal', () => {
  test('returns zero for empty items', () => {
    expect(calculateSubtotal([])).toBe(0);
  });

  test('calculates single item', () => {
    expect(calculateSubtotal([{ price: 1249000, quantity: 1 }])).toBe(1249000);
    expect(calculateSubtotal([{ price: 5000, quantity: 3 }])).toBe(15000);
  });

  test('calculates multiple items', () => {
    expect(
      calculateSubtotal([
        { price: 1249000, quantity: 2 },
        { price: 2399000, quantity: 1 },
      ]),
    ).toBe(4897000);
  });

  test('handles zero quantity items', () => {
    expect(
      calculateSubtotal([
        { price: 1000, quantity: 3 },
        { price: 2000, quantity: 0 },
      ]),
    ).toBe(3000);
  });
});

describe('calculateItemCount', () => {
  test('returns zero for empty items', () => {
    expect(calculateItemCount([])).toBe(0);
  });

  test('counts single item', () => {
    expect(calculateItemCount([{ quantity: 1 }])).toBe(1);
    expect(calculateItemCount([{ quantity: 5 }])).toBe(5);
  });

  test('counts multiple items', () => {
    expect(
      calculateItemCount([{ quantity: 2 }, { quantity: 3 }, { quantity: 1 }]),
    ).toBe(6);
  });
});
