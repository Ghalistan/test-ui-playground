import type { CheckoutPayload, Order, OrderItem, Product } from '../types';
import { createId } from '../utils';
import { db } from './app-db';
import { calculateItemCount, calculateSubtotal } from './calculations';
import {
  assertCompleteAddress,
  getCurrentUserRecord,
  getOwnerKey,
  sanitizeAddress,
} from './db-helpers';

export async function checkoutCash(payload: CheckoutPayload) {
  return db.transaction(
    'rw',
    [db.session, db.users, db.products, db.cartItems, db.orders, db.orderItems],
    async () => {
      const user = await getCurrentUserRecord();

      if (!user) {
        throw new Error('Please log in before completing checkout.');
      }

      const shippingAddress = sanitizeAddress(payload.shippingAddress);
      assertCompleteAddress(shippingAddress);

      const ownerKey = getOwnerKey(user.id);
      let checkoutItems: Array<{
        product: Product;
        quantity: number;
        cartItemId?: string;
      }> = [];

      if (payload.mode === 'cart') {
        const cartItems = await db.cartItems
          .where('ownerKey')
          .equals(ownerKey)
          .toArray();

        if (!cartItems.length) {
          throw new Error(
            'Your cart is empty. Add something before checking out.',
          );
        }

        for (const cartItem of cartItems) {
          const product = await db.products.get(cartItem.productId);

          if (!product) {
            continue;
          }

          checkoutItems.push({
            product,
            quantity: cartItem.quantity,
            cartItemId: cartItem.id,
          });
        }
      } else {
        const productId = payload.productId?.trim();
        const quantity = Math.max(1, payload.quantity ?? 1);

        if (!productId) {
          throw new Error(
            'The selected product could not be found for instant checkout.',
          );
        }

        const product = await db.products.get(productId);

        if (!product) {
          throw new Error(
            'The selected product could not be found for instant checkout.',
          );
        }

        checkoutItems = [{ product, quantity }];
      }

      if (!checkoutItems.length) {
        throw new Error('There are no items available to check out.');
      }

      for (const item of checkoutItems) {
        if (item.product.stock < item.quantity) {
          throw new Error(
            `Only ${item.product.stock} units remain for ${item.product.name}.`,
          );
        }
      }

      const subtotal = calculateSubtotal(
        checkoutItems.map((item) => ({
          price: item.product.price,
          quantity: item.quantity,
        })),
      );

      const orderId = createId('order');
      const createdAt = new Date().toISOString();

      const order: Order = {
        id: orderId,
        userId: user.id,
        subtotal,
        total: subtotal,
        itemCount: calculateItemCount(checkoutItems),
        paymentMethod: 'cash',
        status: 'processing',
        shippingAddressLine1: shippingAddress.addressLine1,
        shippingCity: shippingAddress.city,
        shippingCountry: shippingAddress.country,
        shippingPostalCode: shippingAddress.postalCode,
        createdAt,
      };

      const orderItems: OrderItem[] = checkoutItems.map((item) => ({
        id: createId('order-item'),
        orderId,
        productId: item.product.id,
        productName: item.product.name,
        productImageUrl: item.product.imageUrl,
        unitPrice: item.product.price,
        quantity: item.quantity,
        lineTotal: item.product.price * item.quantity,
      }));

      for (const item of checkoutItems) {
        await db.products.update(item.product.id, {
          stock: item.product.stock - item.quantity,
        });

        if (item.cartItemId) {
          await db.cartItems.delete(item.cartItemId);
        }
      }

      await db.users.update(user.id, shippingAddress);
      await db.orders.put(order);
      await db.orderItems.bulkPut(orderItems);

      return { orderId };
    },
  );
}
