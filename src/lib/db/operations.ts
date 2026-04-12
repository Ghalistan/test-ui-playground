import type {
  CartProductItem,
  CartSnapshot,
  CheckoutPayload,
  LoginPayload,
  Order,
  OrderItem,
  OrderWithItems,
  PendingRegistration,
  Product,
  ProductListResponse,
  RegisterPayload,
  SessionUser,
  User,
} from '../types';
import {
  createId,
  normalizeEmail,
  splitFullName,
  toSessionUser,
} from '../utils';
import {
  getFirstRegistrationError,
  validateRegistrationFields,
} from '../validation/register';
import { db } from './app-db';
import { resetDatabaseContent } from './init';
import { matchesProductSearch } from './seed';

const GUEST_OWNER_KEY = 'guest';

function getOwnerKey(userId?: string | null) {
  return userId ? `user:${userId}` : GUEST_OWNER_KEY;
}

async function getCurrentUserRecord() {
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

async function buildCartSnapshot(ownerKey: string): Promise<CartSnapshot> {
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

async function mergeGuestCartToUser(userId: string) {
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

    const mergedQuantity = Math.min(
      (existing?.quantity ?? 0) + guestItem.quantity,
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

function sanitizeAddress(address: CheckoutPayload['shippingAddress']) {
  return {
    addressLine1: address.addressLine1.trim(),
    city: address.city.trim(),
    country: address.country.trim(),
    postalCode: address.postalCode.trim(),
  };
}

function assertCompleteAddress(address: ReturnType<typeof sanitizeAddress>) {
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

export async function listProducts(
  search = '',
  offset = 0,
  limit = 8,
  minPrice?: number | null,
  maxPrice?: number | null,
): Promise<ProductListResponse> {
  const products = await db.products.toArray();

  const safeOffset = Number.isFinite(offset)
    ? Math.max(0, Math.floor(offset))
    : 0;
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.floor(limit)) : 8;
  const safeMinPrice =
    typeof minPrice === 'number' && Number.isFinite(minPrice)
      ? Math.max(0, Math.floor(minPrice))
      : null;
  const safeMaxPrice =
    typeof maxPrice === 'number' && Number.isFinite(maxPrice)
      ? Math.max(0, Math.floor(maxPrice))
      : null;

  const searchMatchingProducts = products
    .filter((product) => matchesProductSearch(product, search))
    .sort((left, right) => {
      if (left.featured !== right.featured) {
        return Number(right.featured) - Number(left.featured);
      }

      return left.name.localeCompare(right.name);
    });

  const availableMinPrice = searchMatchingProducts.length
    ? searchMatchingProducts.reduce(
        (lowestPrice, product) => Math.min(lowestPrice, product.price),
        Number.POSITIVE_INFINITY,
      )
    : null;
  const availableMaxPrice = searchMatchingProducts.length
    ? searchMatchingProducts.reduce(
        (highestPrice, product) => Math.max(highestPrice, product.price),
        0,
      )
    : null;

  let normalizedMinPrice = safeMinPrice;
  let normalizedMaxPrice = safeMaxPrice;

  if (
    normalizedMinPrice !== null &&
    normalizedMaxPrice !== null &&
    normalizedMinPrice > normalizedMaxPrice
  ) {
    [normalizedMinPrice, normalizedMaxPrice] = [
      normalizedMaxPrice,
      normalizedMinPrice,
    ];
  }

  const matchingProducts = searchMatchingProducts.filter((product) => {
    if (normalizedMinPrice !== null && product.price < normalizedMinPrice) {
      return false;
    }

    if (normalizedMaxPrice !== null && product.price > normalizedMaxPrice) {
      return false;
    }

    return true;
  });

  const items = matchingProducts.slice(safeOffset, safeOffset + safeLimit);

  return {
    items,
    total: matchingProducts.length,
    offset: safeOffset,
    limit: safeLimit,
    hasMore: safeOffset + items.length < matchingProducts.length,
    availableMinPrice,
    availableMaxPrice,
  };
}

export async function getProductById(productId: string) {
  const product = await db.products.get(productId);

  if (!product) {
    throw new Error('Product not found.');
  }

  return product;
}

export async function getSessionUser() {
  const user = await getCurrentUserRecord();
  return user ? toSessionUser(user) : null;
}

export async function getCart() {
  const user = await getCurrentUserRecord();
  return buildCartSnapshot(getOwnerKey(user?.id));
}

export async function addCartItem(productId: string, quantity = 1) {
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
      const nextQuantity = Math.min(
        (existingItem?.quantity ?? 0) + quantity,
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

export async function updateCartItem(itemId: string, quantity: number) {
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
      quantity: Math.min(quantity, product.stock),
    });
  });

  return getCart();
}

export async function removeCartItem(itemId: string) {
  const user = await getCurrentUserRecord();
  const ownerKey = getOwnerKey(user?.id);
  const item = await db.cartItems.get(itemId);

  if (!item || item.ownerKey !== ownerKey) {
    throw new Error('Cart item not found.');
  }

  await db.cartItems.delete(itemId);
  return getCart();
}

export async function requestRegistrationOtp(payload: RegisterPayload) {
  const email = normalizeEmail(payload.email);
  const fullName = payload.fullName.trim();
  const nickname = payload.nickname.trim();
  const validationError = getFirstRegistrationError(
    validateRegistrationFields({
      fullName,
      nickname,
      email,
      password: payload.password,
      passwordConfirmation: payload.passwordConfirmation,
    }),
  );

  if (validationError) {
    throw new Error(validationError);
  }

  const existingUser = await db.users.where('email').equals(email).first();

  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  await db.transaction('rw', db.pendingRegistrations, async () => {
    const existingPending = await db.pendingRegistrations
      .where('email')
      .equals(email)
      .first();

    if (existingPending) {
      await db.pendingRegistrations.delete(existingPending.id);
    }

    await db.pendingRegistrations.put({
      id: createId('pending'),
      email,
      fullName,
      nickname,
      password: payload.password,
      addressLine1: payload.addressLine1?.trim() ?? '',
      city: payload.city?.trim() ?? '',
      country: payload.country?.trim() ?? '',
      postalCode: payload.postalCode?.trim() ?? '',
      profileImageUrl:
        payload.profileImageUrl?.trim() || '/images/avatars/default-avatar.svg',
      createdAt: new Date().toISOString(),
      otp: '123456',
    } satisfies PendingRegistration);
  });

  return { email };
}

export async function verifyRegistrationOtp(
  email: string,
  otp: string,
): Promise<SessionUser> {
  const normalizedEmail = normalizeEmail(email);

  return db.transaction(
    'rw',
    [db.pendingRegistrations, db.users, db.session, db.cartItems, db.products],
    async () => {
      const pending = await db.pendingRegistrations
        .where('email')
        .equals(normalizedEmail)
        .first();

      if (!pending) {
        throw new Error('No pending registration was found for this email.');
      }

      if (otp.trim() !== pending.otp) {
        throw new Error(
          'The OTP code is invalid. Please use the demo code shown on the page.',
        );
      }

      const { firstName, lastName } = splitFullName(pending.fullName);

      const user: User = {
        id: createId('user'),
        firstName,
        lastName,
        nickname: pending.nickname,
        email: pending.email,
        password: pending.password,
        role: 'customer',
        profileImageUrl: pending.profileImageUrl,
        addressLine1: pending.addressLine1,
        city: pending.city,
        country: pending.country,
        postalCode: pending.postalCode,
        createdAt: new Date().toISOString(),
      };

      await db.users.put(user);
      await db.pendingRegistrations.delete(pending.id);
      await db.session.put({
        key: 'current',
        userId: user.id,
        createdAt: new Date().toISOString(),
      });
      await mergeGuestCartToUser(user.id);

      return toSessionUser(user);
    },
  );
}

export async function login(payload: LoginPayload) {
  const email = normalizeEmail(payload.email);

  return db.transaction(
    'rw',
    db.users,
    db.session,
    db.cartItems,
    db.products,
    async () => {
      const user = await db.users.where('email').equals(email).first();

      if (!user || user.password !== payload.password) {
        throw new Error('Incorrect email or password.');
      }

      await db.session.put({
        key: 'current',
        userId: user.id,
        createdAt: new Date().toISOString(),
      });
      await mergeGuestCartToUser(user.id);

      return toSessionUser(user);
    },
  );
}

export async function logout() {
  await db.session.delete('current');
  return { ok: true };
}

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

      let subtotal = 0;

      for (const item of checkoutItems) {
        if (item.product.stock < item.quantity) {
          throw new Error(
            `Only ${item.product.stock} units remain for ${item.product.name}.`,
          );
        }

        subtotal += item.product.price * item.quantity;
      }

      const orderId = createId('order');
      const createdAt = new Date().toISOString();

      const order: Order = {
        id: orderId,
        userId: user.id,
        subtotal,
        total: subtotal,
        itemCount: checkoutItems.reduce((sum, item) => sum + item.quantity, 0),
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

export async function listOrders(): Promise<OrderWithItems[]> {
  const user = await getCurrentUserRecord();

  if (!user) {
    throw new Error('Please log in to view your purchase history.');
  }

  const orders = (
    await db.orders.where('userId').equals(user.id).toArray()
  ).sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  const orderIds = orders.map((order) => order.id);

  if (!orderIds.length) {
    return [];
  }

  const items = await db.orderItems.where('orderId').anyOf(orderIds).toArray();

  return orders.map((order) => ({
    ...order,
    items: items.filter((item) => item.orderId === order.id),
  }));
}

export async function resetDatabase() {
  await resetDatabaseContent();
  return { ok: true };
}

export async function updateUserProfile(payload: {
  firstName: string;
  lastName: string;
  nickname: string;
  addressLine1: string;
  city: string;
  country: string;
  postalCode: string;
}): Promise<SessionUser> {
  const user = await getCurrentUserRecord();

  if (!user) {
    throw new Error('Please log in to update your profile.');
  }

  const nickname = payload.nickname.trim();
  const NICKNAME_PATTERN = /^[A-Za-z0-9._#-]+$/;

  if (!nickname || nickname.length < 5 || !NICKNAME_PATTERN.test(nickname)) {
    throw new Error(
      'Nickname must be at least 5 characters and can only use letters, numbers, ., -, _, or #.',
    );
  }

  const firstName = payload.firstName.trim();
  const lastName = payload.lastName.trim();

  if (!firstName) {
    throw new Error('First name is required.');
  }

  if (!lastName) {
    throw new Error('Last name is required.');
  }

  await db.users.update(user.id, {
    firstName,
    lastName,
    nickname,
    addressLine1: payload.addressLine1.trim(),
    city: payload.city.trim(),
    country: payload.country.trim(),
    postalCode: payload.postalCode.trim(),
  });

  const updatedUser = await db.users.get(user.id);
  if (!updatedUser) {
    throw new Error('User not found after update.');
  }

  return toSessionUser(updatedUser);
}
