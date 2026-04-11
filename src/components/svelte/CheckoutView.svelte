<script lang="ts">
import { onMount } from 'svelte';

import { apiFetch } from '../../lib/api/client';
import { refreshCartCount, refreshSession } from '../../lib/stores/app';
import type { CartSnapshot, Product, SessionResponse } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';

export let mode: 'cart' | 'instant' = 'cart';
export let productId: string | null = null;
export let quantity = 1;

let loading = true;
let submitting = false;
let errorMessage = '';
let sessionUser: SessionResponse['user'] = null;
let cart: CartSnapshot = { items: [], count: 0, subtotal: 0 };
let instantProduct: Product | null = null;
let mounted = false;

let addressLine1 = '';
let city = '';
let country = '';
let postalCode = '';

$: loginTarget =
  mode === 'instant' && productId
    ? `/login?next=${encodeURIComponent(`/checkout?mode=instant&productId=${productId}&qty=${quantity}`)}`
    : '/login?next=%2Fcheckout';

async function loadCheckoutState() {
  loading = true;
  errorMessage = '';

  try {
    const session = await apiFetch<SessionResponse>('/api/session');
    sessionUser = session.user;

    if (!session.user) {
      loading = false;
      return;
    }

    addressLine1 = session.user.addressLine1 ?? '';
    city = session.user.city ?? '';
    country = session.user.country ?? '';
    postalCode = session.user.postalCode ?? '';

    if (mode === 'instant' && productId) {
      instantProduct = await apiFetch<Product>(`/api/products/${productId}`);
    } else {
      cart = await apiFetch<CartSnapshot>('/api/cart');
    }
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : 'Checkout details could not be loaded.';
  } finally {
    loading = false;
  }
}

function getSubtotal() {
  if (mode === 'instant' && instantProduct) {
    return instantProduct.price * quantity;
  }

  return cart.subtotal;
}

async function handleSubmit(event: SubmitEvent) {
  event.preventDefault();
  submitting = true;
  errorMessage = '';

  try {
    const result = await apiFetch<{ orderId: string }>('/api/checkout/cash', {
      method: 'POST',
      body: JSON.stringify({
        mode,
        productId,
        quantity,
        shippingAddress: {
          addressLine1,
          city,
          country,
          postalCode,
        },
      }),
    });

    await Promise.all([refreshSession(), refreshCartCount()]);
    window.location.assign(
      `/history?highlight=${encodeURIComponent(result.orderId)}`,
    );
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'Checkout failed.';
  } finally {
    submitting = false;
  }
}

onMount(() => {
  const url = new URL(window.location.href);
  mode = url.searchParams.get('mode') === 'instant' ? 'instant' : 'cart';
  productId = url.searchParams.get('productId');

  const quantityParam = Number.parseInt(url.searchParams.get('qty') ?? '1', 10);
  quantity = Number.isNaN(quantityParam) ? 1 : Math.max(1, quantityParam);

  mounted = true;
  void loadCheckoutState();
});
</script>

{#if !mounted || loading}
  <div class="surface-panel p-8 text-sm text-slate-500">Loading checkout...</div>
{:else if !sessionUser}
  <div class="surface-panel p-8">
    <h2 class="text-2xl font-black tracking-tight text-slate-950">Login required for checkout</h2>
    <p class="mt-2 text-sm text-slate-500">Your cart is stored locally, but Shopedia only completes cash orders for signed-in customers.</p>
    <a href={loginTarget} class="mt-5 inline-flex rounded-full bg-shopedia-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-shopedia-700">
      Login to continue
    </a>
  </div>
{:else if mode === 'instant' && !instantProduct}
  <div class="surface-panel p-8 text-sm text-rose-600">The selected product is no longer available for instant checkout.</div>
{:else if mode === 'cart' && !cart.items.length}
  <div class="surface-panel p-8">
    <h2 class="text-2xl font-black tracking-tight text-slate-950">Your cart is empty</h2>
    <p class="mt-2 text-sm text-slate-500">Return to the storefront and add something before starting checkout.</p>
    <a href="/" class="mt-5 inline-flex rounded-full bg-shopedia-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-shopedia-700">
      Browse products
    </a>
  </div>
{:else}
  <div class="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
    <section class="surface-panel p-6 sm:p-8">
      <div class="mb-6 space-y-2">
        <p class="text-xs uppercase tracking-[0.24em] text-slate-400">Checkout</p>
        <h2 class="text-3xl font-black tracking-tight text-slate-950">Cash checkout</h2>
        <p class="text-sm text-slate-500">We save this shipping address to your local Shopedia profile for future orders.</p>
      </div>

      <form class="space-y-5" on:submit|preventDefault={handleSubmit}>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2 md:col-span-2">
            <label class="text-sm font-semibold text-slate-700" for="checkout-address">Address line</label>
            <input
              id="checkout-address"
              bind:value={addressLine1}
              type="text"
              required
              autocomplete="street-address"
              class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-shopedia-400 focus:ring-4 focus:ring-shopedia-100"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold text-slate-700" for="checkout-city">City</label>
            <input id="checkout-city" bind:value={city} type="text" required class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-shopedia-400 focus:ring-4 focus:ring-shopedia-100" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold text-slate-700" for="checkout-country">Country</label>
            <input id="checkout-country" bind:value={country} type="text" required class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-shopedia-400 focus:ring-4 focus:ring-shopedia-100" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold text-slate-700" for="checkout-postal-code">Postal code</label>
            <input id="checkout-postal-code" bind:value={postalCode} type="text" required class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-shopedia-400 focus:ring-4 focus:ring-shopedia-100" />
          </div>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-semibold text-slate-900">Payment method</p>
              <p class="mt-1 text-sm text-slate-500">Cash payment is the only method enabled in this demo flow.</p>
            </div>
            <span class="rounded-full bg-white px-3 py-1 text-sm font-semibold text-shopedia-700 shadow-sm">Cash</span>
          </div>
        </div>

        {#if errorMessage}
          <p class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
        {/if}

        <button
          type="submit"
          class="w-full rounded-2xl bg-shopedia-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-shopedia-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={submitting}
          data-testid="checkout-submit"
        >
          {submitting ? 'Placing order...' : 'Place cash order'}
        </button>
      </form>
    </section>

    <aside class="surface-panel h-fit p-6">
      <p class="text-xs uppercase tracking-[0.24em] text-slate-400">Order summary</p>
      <div class="mt-5 space-y-4">
        {#if mode === 'instant' && instantProduct}
          <div class="flex items-center gap-4 rounded-3xl bg-slate-50 p-4">
            <img src={instantProduct.imageUrl} alt={instantProduct.alt} class="h-20 w-20 rounded-2xl object-cover" />
            <div class="min-w-0 flex-1">
              <h3 class="truncate font-semibold text-slate-950">{instantProduct.name}</h3>
              <p class="mt-1 text-sm text-slate-500">Qty {quantity}</p>
              <p class="mt-2 text-sm font-semibold text-slate-900">{formatCurrency(instantProduct.price * quantity)}</p>
            </div>
          </div>
        {:else}
          {#each cart.items as item (item.id)}
            <div class="flex items-center gap-4 rounded-3xl bg-slate-50 p-4">
              <img src={item.product.imageUrl} alt={item.product.alt} class="h-20 w-20 rounded-2xl object-cover" />
              <div class="min-w-0 flex-1">
                <h3 class="truncate font-semibold text-slate-950">{item.product.name}</h3>
                <p class="mt-1 text-sm text-slate-500">Qty {item.quantity}</p>
                <p class="mt-2 text-sm font-semibold text-slate-900">{formatCurrency(item.lineTotal)}</p>
              </div>
            </div>
          {/each}
        {/if}
      </div>

      <div class="mt-6 space-y-3 border-t border-slate-200 pt-5 text-sm">
        <div class="flex items-center justify-between text-slate-600">
          <span>Customer</span>
          <span class="font-semibold text-slate-900">{sessionUser.nickname}</span>
        </div>
        <div class="flex items-center justify-between text-slate-600">
          <span>Subtotal</span>
          <span class="font-semibold text-slate-900">{formatCurrency(getSubtotal())}</span>
        </div>
        <div class="flex items-center justify-between text-slate-600">
          <span>Total</span>
          <span class="text-lg font-black tracking-tight text-slate-950">{formatCurrency(getSubtotal())}</span>
        </div>
      </div>
    </aside>
  </div>
{/if}
