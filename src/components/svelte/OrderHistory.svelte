<script lang="ts">
import { onMount } from 'svelte';

import { apiFetch } from '../../lib/api/client';
import type { OrderWithItems, SessionResponse } from '../../lib/types';
import { formatCurrency, formatDate } from '../../lib/utils';

export let highlightOrderId = '';

let loading = true;
let errorMessage = '';
let sessionUser: SessionResponse['user'] = null;
let orders: OrderWithItems[] = [];

async function loadOrders() {
  loading = true;

  try {
    const session = await apiFetch<SessionResponse>('/api/session');
    sessionUser = session.user;

    if (!session.user) {
      loading = false;
      return;
    }

    orders = await apiFetch<OrderWithItems[]>('/api/orders');
    errorMessage = '';
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : 'Order history could not be loaded.';
  } finally {
    loading = false;
  }
}

onMount(() => {
  void loadOrders();
});
</script>

{#if loading}
  <div class="surface-panel p-8 text-sm text-slate-500">Loading purchase history...</div>
{:else if !sessionUser}
  <div class="surface-panel p-8">
    <h2 class="text-2xl font-black tracking-tight text-slate-950">Login to view history</h2>
    <p class="mt-2 text-sm text-slate-500">Purchase history is saved per account in local IndexedDB storage.</p>
    <a href="/login?next=%2Fhistory" class="mt-5 inline-flex rounded-full bg-shopedia-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-shopedia-700">
      Login now
    </a>
  </div>
{:else if errorMessage}
  <div class="surface-panel p-8 text-sm text-rose-600">{errorMessage}</div>
{:else if !orders.length}
  <div class="surface-panel p-8">
    <h2 class="text-2xl font-black tracking-tight text-slate-950">No orders yet</h2>
    <p class="mt-2 text-sm text-slate-500">Complete a cash checkout and your orders will appear here.</p>
    <a href="/" class="mt-5 inline-flex rounded-full bg-shopedia-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-shopedia-700">
      Start shopping
    </a>
  </div>
{:else}
  <div class="space-y-5">
    {#each orders as order (order.id)}
      <article class={`surface-panel p-6 ${order.id === highlightOrderId ? 'ring-2 ring-shopedia-500/30' : ''}`}>
        <div class="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <p class="break-all text-xs uppercase tracking-[0.24em] text-slate-400 sm:break-normal">Order {order.id}</p>
            <h2 class="mt-2 text-2xl font-black tracking-tight text-slate-950">{formatCurrency(order.total)}</h2>
            <p class="mt-2 text-sm text-slate-500">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 sm:shrink-0">
            <p><span class="font-semibold text-slate-900">Payment:</span> Cash</p>
            <p class="mt-1"><span class="font-semibold text-slate-900">Status:</span> Processing</p>
          </div>
        </div>

        <div class="mt-5 grid gap-5 lg:grid-cols-[1fr_auto]">
          <div class="space-y-3">
            {#each order.items as item (item.id)}
              <div class="rounded-3xl bg-slate-50 p-4">
                <div class="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div class="flex min-w-0 items-center gap-4">
                    <img src={item.productImageUrl} alt={item.productName} class="h-20 w-20 shrink-0 rounded-2xl object-cover" />
                    <div class="min-w-0 flex-1">
                      <h3 class="truncate font-semibold text-slate-950">{item.productName}</h3>
                      <p class="mt-1 text-sm text-slate-500">Qty {item.quantity}</p>
                    </div>
                  </div>
                  <p class="text-base font-semibold text-slate-900 sm:ml-auto sm:text-right sm:text-sm">{formatCurrency(item.lineTotal)}</p>
                </div>
              </div>
            {/each}
          </div>

          <div class="rounded-3xl border border-slate-200 p-4 text-sm text-slate-600 lg:min-w-64">
            <h3 class="font-semibold text-slate-900">Shipping address</h3>
            <p class="mt-3 leading-6">
              {order.shippingAddressLine1}<br />
              {order.shippingCity}, {order.shippingCountry} {order.shippingPostalCode}
            </p>
          </div>
        </div>
      </article>
    {/each}
  </div>
{/if}
