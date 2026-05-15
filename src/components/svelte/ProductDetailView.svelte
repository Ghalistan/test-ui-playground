<script lang="ts">
import LoaderCircle from 'lucide-svelte/icons/loader-circle';
import Plus from 'lucide-svelte/icons/plus';
import ShoppingCart from 'lucide-svelte/icons/shopping-cart';
import { onMount } from 'svelte';

import { apiFetch } from '../../lib/api/client';
import { addToCart } from '../../lib/cart/actions';
import type { Product } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';

export let initialProduct: Product;

let product = initialProduct;
let loading = true;
let adding = false;
let errorMessage = '';

async function loadProduct() {
  try {
    product = await apiFetch<Product>(`/api/products/${initialProduct.id}`);
    errorMessage = '';
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : 'The product could not be loaded.';
  } finally {
    loading = false;
  }
}

async function handleAddToCart() {
  adding = true;
  errorMessage = '';

  try {
    await addToCart(product.id, product.name);
    await loadProduct();
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : 'This product could not be added right now.';
  } finally {
    adding = false;
  }
}

onMount(() => {
  void loadProduct();
});

$: instantCheckoutHref = `/checkout?mode=instant&productId=${encodeURIComponent(product.id)}&qty=1`;
</script>

<div class="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
  <section class="surface-panel overflow-hidden">
    <div class="relative bg-gradient-to-br from-shopedia-50 via-white to-slate-100 p-5 sm:p-8">
      <img src={product.imageUrl} alt={product.alt} class="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-sm" />
      <div class="pointer-events-none absolute left-10 top-10 flex flex-wrap gap-2">
        {#if product.featured}
          <span class="rounded-full bg-shopedia-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
            Featured pick
          </span>
        {/if}
        <span class="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-sm">
          {product.category}
        </span>
      </div>
    </div>
  </section>

  <section class="surface-panel p-6 sm:p-8">
    <div class="space-y-3">
      <p class="text-xs uppercase tracking-[0.24em] text-slate-400">{product.category}</p>
      <h1 class="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{product.name}</h1>
      <p class="text-base leading-7 text-slate-600">{product.description}</p>
    </div>

    <div class="mt-6 grid gap-4 sm:grid-cols-3">
      <div class="rounded-3xl bg-slate-50 p-4">
        <p class="text-xs uppercase tracking-[0.24em] text-slate-400">Seller</p>
        <p class="mt-2 font-semibold text-slate-900">{product.seller}</p>
      </div>
      <div class="rounded-3xl bg-slate-50 p-4">
        <p class="text-xs uppercase tracking-[0.24em] text-slate-400">Rating</p>
        <p class="mt-2 font-semibold text-slate-900">{product.rating.toFixed(1)} ★</p>
      </div>
      <div class="rounded-3xl bg-slate-50 p-4">
        <p class="text-xs uppercase tracking-[0.24em] text-slate-400">Availability</p>
        <p class={`mt-2 font-semibold ${product.stock > 0 ? 'text-slate-900' : 'text-rose-600'}`}>
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </p>
      </div>
    </div>

    <div class="mt-8 rounded-[2rem] border border-slate-200 bg-slate-50 p-5 sm:p-6">
      <div>
        <div>
          <p class="text-xs uppercase tracking-[0.24em] text-slate-400">Price</p>
          <p class="mt-2 text-3xl font-black leading-none tracking-tight text-slate-950 tabular-nums sm:text-[2.5rem]">
            {formatCurrency(product.price)}
          </p>
        </div>
      </div>

      <div class="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-shopedia-200 hover:text-shopedia-700 disabled:cursor-not-allowed disabled:opacity-60"
          on:click={handleAddToCart}
          disabled={adding || product.stock < 1}
          data-testid={`detail-add-to-cart-${product.id}`}
        >
          {#if adding}
            <LoaderCircle class="h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Adding...</span>
          {:else}
            <span class="relative inline-flex items-center justify-center">
              <ShoppingCart class="h-4 w-4" aria-hidden="true" />
              <Plus class="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-white text-shopedia-700" aria-hidden="true" />
            </span>
            <span>Add to Cart</span>
          {/if}
        </button>
        {#if product.stock > 0}
          <a
            href={instantCheckoutHref}
            class="rounded-2xl bg-shopedia-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-shopedia-700"
            data-testid={`detail-buy-now-${product.id}`}
          >
            Buy Now
          </a>
        {:else}
          <button
            type="button"
            class="rounded-2xl bg-slate-300 px-5 py-3 text-sm font-semibold text-white"
            disabled
            data-testid={`detail-buy-now-${product.id}`}
          >
            Buy Now
          </button>
        {/if}
      </div>

      {#if errorMessage}
        <p class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
      {/if}

      {#if loading}
        <p class="mt-4 text-sm text-slate-500">Refreshing live product data...</p>
      {/if}
    </div>

    <div class="mt-8 grid gap-4 sm:grid-cols-2">
      <div class="rounded-3xl border border-slate-200 p-4">
        <p class="text-sm font-semibold text-slate-900">Why this page exists</p>
        <p class="mt-2 text-sm leading-6 text-slate-600">
          It gives the storefront a real product-route shape for navigation, indexing, and automation coverage beyond the landing grid.
        </p>
      </div>
      <div class="rounded-3xl border border-slate-200 p-4">
        <p class="text-sm font-semibold text-slate-900">Persistent state</p>
        <p class="mt-2 text-sm leading-6 text-slate-600">
          Add this item to cart, buy it directly, then revisit this page to see the live stock count coming from the local mock backend.
        </p>
      </div>
    </div>
  </section>
</div>
