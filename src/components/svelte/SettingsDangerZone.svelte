<script lang="ts">
import { onMount } from 'svelte';

import { apiFetch } from '../../lib/api/client';
import {
  clearToast,
  queueToastForNextLoad,
  showPersistentToast,
  showToast,
  syncChromeState,
} from '../../lib/stores/app';
import type { SessionResponse } from '../../lib/types';
import { createInitials } from '../../lib/utils';

let loading = true;
let resetting = false;
let errorMessage = '';
let sessionUser: SessionResponse['user'] = null;

async function loadSession() {
  loading = true;

  try {
    const session = await apiFetch<SessionResponse>('/api/session');
    sessionUser = session.user;
    errorMessage = '';
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : 'Settings could not be loaded.';
  } finally {
    loading = false;
  }
}

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

onMount(() => {
  void loadSession();
});
</script>

{#if loading}
  <div class="surface-panel p-8 text-sm text-slate-500">Loading settings...</div>
{:else}
  <div class="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
    <section class="surface-panel p-6 sm:p-8">
      <p class="text-xs uppercase tracking-[0.24em] text-slate-400">Stored profile</p>
      {#if sessionUser}
        <div class="mt-5 flex items-center gap-4">
          {#if sessionUser.profileImageUrl}
            <img src={sessionUser.profileImageUrl} alt={`${sessionUser.nickname} profile`} class="h-16 w-16 rounded-full border border-slate-200 object-cover" />
          {:else}
            <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-shopedia-100 text-lg font-bold text-shopedia-700">
              {createInitials(sessionUser.nickname)}
            </div>
          {/if}
          <div>
            <h2 class="text-2xl font-black tracking-tight text-slate-950">{sessionUser.nickname}</h2>
            <p class="text-sm text-slate-500">{sessionUser.email}</p>
          </div>
        </div>

        <div class="mt-6 rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">
          <p class="font-semibold text-slate-900">Address snapshot</p>
          <p class="mt-3 leading-6">
            {#if sessionUser.addressLine1}
              {sessionUser.addressLine1}<br />
              {sessionUser.city}, {sessionUser.country} {sessionUser.postalCode}
            {:else}
              No address saved yet. Add one during checkout to persist it here.
            {/if}
          </p>
        </div>
      {:else}
        <div class="mt-5 rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">
          You are viewing settings as a guest. The database reset still applies to the entire local Shopedia app.
        </div>
      {/if}
    </section>

    <section class="surface-panel border-rose-200 p-6 sm:p-8">
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
  </div>
{/if}
