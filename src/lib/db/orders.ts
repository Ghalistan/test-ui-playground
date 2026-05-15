import type { OrderWithItems } from '../types';
import { db } from './app-db';
import { getCurrentUserRecord } from './db-helpers';

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
