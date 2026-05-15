import type { CartProductItem, CartSnapshot, CheckoutPayload } from '../types';
import { db } from './app-db';
import { mergeGuestQuantity } from './calculations';

const GUEST_OWNER_KEY = 'guest';

export function getOwnerKey(userId?: string | null) {
  return userId ? `user:${userId}` : GUEST_OWNER_KEY;
}

export async function getCurrentUserRecord() {
  const session = await db.session.get('current');

  if (!session) {
    return null;
  }

  const user = await db.users.get(session.userId);

  if (!user) {
    await db.session.delete('current');
    return null;
  }

  return user;
}

export async function buildCartSnapshot(
  ownerKey: string,
): Promise<CartSnapshot> {
  const rawItems = await db.cartItems
    .where('ownerKey')
    .equals(ownerKey)
    .sortBy('addedAt');
  const products = await db.products.bulkGet(
    rawItems.map((item) => item.productId),
  );

  const items = rawItems
    .map((item, index) => {
      const product = products[index];

      if (!product) {
        return null;
      }

      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product,
        lineTotal: product.price * item.quantity,
      } satisfies CartProductItem;
    })
    .filter((item): item is CartProductItem => Boolean(item))
    .reverse();

  return {
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0),
  };
}

export async function mergeGuestCartToUser(userId: string) {
  const guestItems = await db.cartItems
    .where('ownerKey')
    .equals(GUEST_OWNER_KEY)
    .toArray();
  const ownerKey = getOwnerKey(userId);

  for (const guestItem of guestItems) {
    const existing = await db.cartItems
      .where('[ownerKey+productId]')
      .equals([ownerKey, guestItem.productId])
      .first();
    const product = await db.products.get(guestItem.productId);

    if (!product) {
      await db.cartItems.delete(guestItem.id);
      continue;
    }

    const mergedQuantity = mergeGuestQuantity(
      guestItem.quantity,
      existing?.quantity ?? 0,
      product.stock,
    );

    if (existing) {
      await db.cartItems.update(existing.id, { quantity: mergedQuantity });
      await db.cartItems.delete(guestItem.id);
      continue;
    }

    await db.cartItems.update(guestItem.id, {
      ownerKey,
      quantity: mergedQuantity,
    });
  }
}

export function sanitizeAddress(address: CheckoutPayload['shippingAddress']) {
  return {
    addressLine1: address.addressLine1.trim(),
    city: address.city.trim(),
    country: address.country.trim(),
    postalCode: address.postalCode.trim(),
  };
}

export function assertCompleteAddress(
  address: ReturnType<typeof sanitizeAddress>,
) {
  if (
    !address.addressLine1 ||
    !address.city ||
    !address.country ||
    !address.postalCode
  ) {
    throw new Error(
      'Please provide a full shipping address before placing the order.',
    );
  }
}
