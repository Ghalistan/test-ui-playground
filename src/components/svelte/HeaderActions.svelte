<script lang="ts">
import ShoppingCart from 'lucide-svelte/icons/shopping-cart';
import { onMount } from 'svelte';

import { apiFetch } from '../../lib/api/client';
import {
  cartCountStore,
  hydrateChromeState,
  sessionStore,
  syncChromeState,
} from '../../lib/stores/app';
import { createInitials } from '../../lib/utils';

export let currentPath = '/';

let pendingLogout = false;

onMount(() => {
  void hydrateChromeState();
});

async function handleLogout() {
  pendingLogout = true;

  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    await syncChromeState();
    window.location.assign('/');
  } finally {
    pendingLogout = false;
  }
}
</script>

<div class="flex items-center gap-2 sm:gap-3">
  <a
    href="/cart"
    class="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-shopedia-200 hover:text-shopedia-700"
    data-testid="cart-link"
    aria-label={`Cart, ${$cartCountStore} items`}
  >
    <span class="sr-only">Cart</span>
    <ShoppingCart class="h-5 w-5" aria-hidden="true" />
    <span class="absolute -right-1 -top-1 inline-flex min-w-6 items-center justify-center rounded-full bg-shopedia-50 px-2 py-0.5 text-xs font-bold text-shopedia-700 ring-2 ring-white">
      {$cartCountStore}
    </span>
  </a>

  {#if $sessionStore.loading}
    <div class="h-10 w-24 animate-pulse rounded-full bg-slate-200"></div>
  {:else if $sessionStore.user}
    <details class="group relative">
      <summary class="flex list-none items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-shopedia-200 hover:text-shopedia-700 [&::-webkit-details-marker]:hidden">
        {#if $sessionStore.user.profileImageUrl}
          <img
            src={$sessionStore.user.profileImageUrl}
            alt={`${$sessionStore.user.nickname} profile`}
            class="h-7 w-7 rounded-full border border-slate-200 object-cover"
          />
        {:else}
          <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-shopedia-100 text-xs font-bold text-shopedia-700">
            {createInitials($sessionStore.user.nickname)}
          </span>
        {/if}
        <span class="max-w-24 truncate">{$sessionStore.user.nickname}</span>
      </summary>

      <div class="absolute right-0 top-[calc(100%+0.75rem)] hidden min-w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl group-open:block">
        <a
          href="/history"
          class={`block rounded-xl px-3 py-2 text-sm font-medium transition ${currentPath === '/history' ? 'bg-shopedia-50 text-shopedia-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
        >
          Purchase history
        </a>
        <a
          href="/settings"
          class={`block rounded-xl px-3 py-2 text-sm font-medium transition ${currentPath === '/settings' ? 'bg-shopedia-50 text-shopedia-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
        >
          Settings
        </a>
        <button
          type="button"
          class="mt-1 block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
          on:click={handleLogout}
          disabled={pendingLogout}
        >
          {pendingLogout ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </details>
  {:else}
    <div class="flex items-center gap-2">
      <a
        href="/login"
        class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-shopedia-200 hover:text-shopedia-700"
        data-testid="login-button"
      >
        Login
      </a>
      <a
        href="/register"
        class="rounded-full bg-shopedia-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-shopedia-700"
        data-testid="register-button"
      >
        Register
      </a>
    </div>
  {/if}
</div>
