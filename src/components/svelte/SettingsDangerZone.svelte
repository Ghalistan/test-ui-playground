<script lang="ts">
import { apiFetch } from '../../lib/api/client';
import {
  clearToast,
  queueToastForNextLoad,
  showPersistentToast,
  showToast,
  syncChromeState,
} from '../../lib/stores/app';

let resetting = false;
let errorMessage = '';

async function handleReset() {
  const confirmed = window.confirm(
    'Reset Shopedia database? This will clear registered accounts, sessions, carts, and order history before reseeding the demo catalog.',
  );

  if (!confirmed) {
    return;
  }

  resetting = true;
  errorMessage = '';

  const setupToastId = showPersistentToast(
    'Database setup in progress...',
    'info',
    'Database setup',
  );

  try {
    await apiFetch('/api/settings/reset', { method: 'POST' });
    await syncChromeState();
    clearToast(setupToastId);
    queueToastForNextLoad(
      'Database setup finished.',
      'success',
      2800,
      'Database setup',
    );
    window.location.assign('/');
  } catch (error) {
    clearToast(setupToastId);
    showToast('Database setup failed.', 'error', 3800, 'Database setup');
    errorMessage =
      error instanceof Error
        ? error.message
        : 'The database could not be reset.';
  } finally {
    resetting = false;
  }
}
</script>

<section class="surface-panel h-fit border-rose-200 p-6 sm:p-8">
  <div class="rounded-3xl border border-rose-200 bg-rose-50/70 p-5">
    <p class="text-xs font-semibold uppercase tracking-[0.24em] text-rose-500">Danger zone</p>
    <h2 class="mt-3 text-2xl font-black tracking-tight text-slate-950">Reset local database</h2>
    <p class="mt-3 text-sm leading-6 text-slate-600">
      This clears the locally stored Shopedia session, registered users, cart items, and purchase history. The app will immediately reseed the demo catalog and the default customer account.
    </p>

    <ul class="mt-5 space-y-2 text-sm text-slate-600">
      <li>Reseeds the 16-product demo catalog</li>
      <li>Restores the seeded customer account</li>
      <li>Deletes local sessions, carts, and orders</li>
    </ul>

    {#if errorMessage}
      <p class="mt-5 rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
    {/if}

    <button
      type="button"
      class="mt-6 inline-flex rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
      on:click={handleReset}
      disabled={resetting}
      data-testid="reset-database"
    >
      {resetting ? 'Resetting database...' : 'Reset Database'}
    </button>
  </div>
</section>
