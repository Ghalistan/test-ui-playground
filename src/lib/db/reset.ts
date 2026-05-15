import { resetDatabaseContent } from './init';

export async function resetDatabase() {
  await resetDatabaseContent();
  return { ok: true };
}
