import type { CartSnapshot } from '../types';
import { createId } from '../utils';
import { db } from './app-db';
import { capQuantity, clampQuantity } from './calculations';
import {
  buildCartSnapshot,
  getCurrentUserRecord,
  getOwnerKey,
} from './db-helpers';

export async function getCart(): Promise<CartSnapshot> {
  const user = await getCurrentUserRecord();
  return buildCartSnapshot(getOwnerKey(user?.id));
}

export async function addCartItem(
  productId: string,
  quantity = 1,
): Promise<CartSnapshot> {
  if (quantity < 1) {
    throw new Error('Quantity must be at least 1.');
  }

  await db.transaction(
    'rw',
    db.products,
    db.cartItems,
    db.session,
    db.users,
    async () => {
      const user = await getCurrentUserRecord();
      const ownerKey = getOwnerKey(user?.id);
      const product = await db.products.get(productId);

      if (!product) {
        throw new Error('Product not found.');
      }

      if (product.stock < 1) {
        throw new Error('This item is out of stock.');
      }

      const existingItem = await db.cartItems
        .where('[ownerKey+productId]')
        .equals([ownerKey, productId])
        .first();
      const nextQuantity = clampQuantity(
        quantity,
        existingItem?.quantity ?? 0,
        product.stock,
      );

      if (existingItem) {
        await db.cartItems.update(existingItem.id, { quantity: nextQuantity });
        return;
      }

      await db.cartItems.put({
        id: createId('cart'),
        ownerKey,
        productId,
        quantity: nextQuantity,
        addedAt: new Date().toISOString(),
      });
    },
  );

  return getCart();
}

export async function updateCartItem(
  itemId: string,
  quantity: number,
): Promise<CartSnapshot> {
  const user = await getCurrentUserRecord();
  const ownerKey = getOwnerKey(user?.id);

  await db.transaction('rw', db.cartItems, db.products, async () => {
    const item = await db.cartItems.get(itemId);

    if (!item || item.ownerKey !== ownerKey) {
      throw new Error('Cart item not found.');
    }

    if (quantity <= 0) {
      await db.cartItems.delete(item.id);
      return;
    }

    const product = await db.products.get(item.productId);

    if (!product) {
      throw new Error('Product not found.');
    }

    await db.cartItems.update(item.id, {
      quantity: capQuantity(quantity, product.stock),
    });
  });

  return getCart();
}

export async function removeCartItem(itemId: string): Promise<CartSnapshot> {
  const user = await getCurrentUserRecord();
  const ownerKey = getOwnerKey(user?.id);
  const item = await db.cartItems.get(itemId);

  if (!item || item.ownerKey !== ownerKey) {
    throw new Error('Cart item not found.');
  }

  await db.cartItems.delete(itemId);
  return getCart();
}
