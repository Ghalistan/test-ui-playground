<script lang="ts">
import Trash2 from 'lucide-svelte/icons/trash-2';
import { onMount } from 'svelte';

import { apiFetch } from '../../lib/api/client';
import { refreshCartCount, refreshSession } from '../../lib/stores/app';
import type { CartSnapshot, SessionResponse } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';

let loading = true;
let busyItemId = '';
let errorMessage = '';
let sessionUser: SessionResponse['user'] = null;
let cart: CartSnapshot = {
  items: [],
  count: 0,
  subtotal: 0,
};

async function loadCartState() {
  loading = true;
  errorMessage = '';

  try {
    const [session, currentCart] = await Promise.all([
      apiFetch<SessionResponse>('/api/session'),
      apiFetch<CartSnapshot>('/api/cart'),
    ]);

    sessionUser = session.user;
    cart = currentCart;
    void Promise.all([refreshSession(), refreshCartCount()]);
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : 'The cart could not be loaded.';
  } finally {
    loading = false;
  }
}

async function mutateItem(itemId: string, quantity: number) {
  if (quantity < 1) {
    return;
  }

  busyItemId = itemId;
  errorMessage = '';

  try {
    cart = await apiFetch<CartSnapshot>(`/api/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
    await refreshCartCount();
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : 'The cart could not be updated.';
  } finally {
    busyItemId = '';
  }
}

async function removeItem(itemId: string) {
  busyItemId = itemId;
  errorMessage = '';

  try {
    cart = await apiFetch<CartSnapshot>(`/api/cart/items/${itemId}`, {
      method: 'DELETE',
    });
    await refreshCartCount();
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : 'The cart item could not be removed.';
  } finally {
    busyItemId = '';
  }
}

onMount(() => {
  void loadCartState();
});
</script>

{#if loading}
  <div class="surface-panel p-8 text-sm text-slate-500">Loading cart...</div>
{:else}
  <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
    <section class="space-y-4">
      {#if errorMessage}
        <div class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>
      {/if}

      {#if !cart.items.length}
        <div class="surface-panel p-8">
          <h2 class="text-2xl font-black tracking-tight text-slate-950">Your cart is empty</h2>
          <p class="mt-2 text-sm text-slate-500">Browse the homepage and add a few seeded products to start your cash checkout flow.</p>
          <a href="/" class="mt-5 inline-flex rounded-full bg-shopedia-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-shopedia-700">
            Browse products
          </a>
        </div>
      {:else}
        {#each cart.items as item (item.id)}
          <article class="surface-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <img src={item.product.imageUrl} alt={item.product.alt} class="h-28 w-full rounded-2xl object-cover sm:w-32" />

            <div class="min-w-0 flex-1">
              <p class="text-xs uppercase tracking-[0.24em] text-slate-400">{item.product.category}</p>
              <h3 class="mt-2 text-lg font-bold text-slate-950">{item.product.name}</h3>
              <p class="mt-2 text-sm text-slate-500">{formatCurrency(item.product.price)} each</p>
            </div>

            <div class="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
              <div class="inline-flex items-center rounded-full border border-slate-200 bg-white p-1">
                <button
                  type="button"
                  class="h-9 w-9 rounded-full text-lg font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  on:click={() => mutateItem(item.id, item.quantity - 1)}
                  disabled={busyItemId === item.id || item.quantity <= 1}
                >
                  −
                </button>
                <span class="min-w-10 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                <button
                  type="button"
                  class="h-9 w-9 rounded-full text-lg font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  on:click={() => mutateItem(item.id, item.quantity + 1)}
                  disabled={busyItemId === item.id || item.quantity >= item.product.stock}
                >
                  +
                </button>
              </div>

              <div class="min-w-28 shrink-0 text-right">
                <div class="flex items-center justify-end gap-2">
                  <p class="text-sm font-semibold text-slate-900">{formatCurrency(item.lineTotal)}</p>
                  <button
                    type="button"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-full text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                    on:click={() => removeItem(item.id)}
                    disabled={busyItemId === item.id}
                    data-testid={`remove-cart-item-${item.id}`}
                    aria-label={`Remove ${item.product.name} from cart`}
                  >
                    <Trash2 class="h-4 w-4" aria-hidden="true" />
                    <span class="sr-only">Remove</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        {/each}
      {/if}
    </section>

    <aside class="surface-panel h-fit p-6">
      <p class="text-xs uppercase tracking-[0.24em] text-slate-400">Cart summary</p>
      <h2 class="mt-2 text-2xl font-black tracking-tight text-slate-950">{formatCurrency(cart.subtotal)}</h2>
      <p class="mt-2 text-sm text-slate-500">{cart.count} item{cart.count === 1 ? '' : 's'} ready for checkout.</p>

      <div class="mt-6 space-y-3 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
        <div class="flex items-center justify-between">
          <span>Payment</span>
          <span class="font-semibold text-slate-900">Cash</span>
        </div>
        <div class="flex items-center justify-between">
          <span>Account</span>
          <span class="font-semibold text-slate-900">{sessionUser ? sessionUser.nickname : 'Guest cart'}</span>
        </div>
      </div>

      <a
        href={sessionUser ? '/checkout' : '/login?next=%2Fcheckout'}
        class={`mt-6 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${cart.items.length ? 'bg-shopedia-600 text-white hover:bg-shopedia-700' : 'pointer-events-none bg-slate-200 text-slate-400'}`}
      >
        {sessionUser ? 'Proceed to cash checkout' : 'Login to continue'}
      </a>

      <p class="mt-3 text-sm text-slate-500">
        Guests can save items in the browser cart, but checkout requires a logged-in Shopedia account.
      </p>
    </aside>
  </div>
{/if}
