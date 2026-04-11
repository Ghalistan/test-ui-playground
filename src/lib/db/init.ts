import { db } from './app-db';
import { SEED_VERSION, seedCustomer, seedProducts } from './seed';

export async function ensureDatabaseReady(onSetupStart?: () => void) {
  await db.open();

  const meta = await db.meta.get('app');

  if (!meta || meta.seedVersion !== SEED_VERSION) {
    onSetupStart?.();
    await resetDatabaseContent();
    return true;
  }

  return false;
}

export async function resetDatabaseContent() {
  await db.open();

  await db.transaction(
    'rw',
    [
      db.meta,
      db.users,
      db.session,
      db.products,
      db.cartItems,
      db.orders,
      db.orderItems,
      db.pendingRegistrations,
    ],
    async () => {
      await Promise.all([
        db.meta.clear(),
        db.users.clear(),
        db.session.clear(),
        db.products.clear(),
        db.cartItems.clear(),
        db.orders.clear(),
        db.orderItems.clear(),
        db.pendingRegistrations.clear(),
      ]);

      await db.products.bulkPut(seedProducts);
      await db.users.put(seedCustomer);
      await db.meta.put({
        key: 'app',
        seedVersion: SEED_VERSION,
        initializedAt: new Date().toISOString(),
      });
    },
  );
}
