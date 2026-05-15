import Dexie, { type Table } from 'dexie';

import { DB_NAME } from '../constants';
import type {
  CartItem,
  MetaRecord,
  Order,
  OrderItem,
  PendingRegistration,
  Product,
  SessionRecord,
  User,
} from '../types';

class ShopediaDatabase extends Dexie {
  meta!: Table<MetaRecord, MetaRecord['key']>;
  users!: Table<User, User['id']>;
  session!: Table<SessionRecord, SessionRecord['key']>;
  products!: Table<Product, Product['id']>;
  cartItems!: Table<CartItem, CartItem['id']>;
  orders!: Table<Order, Order['id']>;
  orderItems!: Table<OrderItem, OrderItem['id']>;
  pendingRegistrations!: Table<PendingRegistration, PendingRegistration['id']>;

  constructor() {
    super(DB_NAME);

    this.version(1).stores({
      meta: 'key',
      users: 'id, &email, role, createdAt',
      session: 'key, userId',
      products: 'id, slug, name, category, featured',
      cartItems: 'id, ownerKey, productId, addedAt, [ownerKey+productId]',
      orders: 'id, userId, createdAt',
      orderItems: 'id, orderId, productId',
      pendingRegistrations: 'id, &email, createdAt',
    });
  }
}

export const db = new ShopediaDatabase();
