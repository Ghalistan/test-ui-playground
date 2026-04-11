<script lang="ts">
import { onMount } from 'svelte';

import { apiFetch } from '../../lib/api/client';
import type { Product, ProductListResponse } from '../../lib/types/index';
import ProductCard from './ProductCard.svelte';

type ProductGridResponse = ProductListResponse & {
  availableMinPrice: number | null;
  availableMaxPrice: number | null;
};

export let searchQuery = '';
export let pageSize = 8;
export let minPrice: number | null = null;
export let maxPrice: number | null = null;
export let availableMinPrice: number | null = null;
export let availableMaxPrice: number | null = null;

let products: Product[] = [];
let loadingInitial = true;
let loadingMore = false;
let errorMessage = '';
let loadMoreError = '';
let total = 0;
let offset = 0;
let hasMore = false;
let sentinel: HTMLDivElement | null = null;
let observer: IntersectionObserver | null = null;
let sentinelVisible = false;
let mounted = false;
let activeSearchQuery = searchQuery;
let activeMinPrice = minPrice;
let activeMaxPrice = maxPrice;
let requestToken = 0;
let skeletonIndexes: number[] = [];

$: skeletonIndexes = Array.from({ length: pageSize }, (_, index) => index);

$: if (
  mounted &&
  (searchQuery !== activeSearchQuery ||
    minPrice !== activeMinPrice ||
    maxPrice !== activeMaxPrice)
) {
  activeSearchQuery = searchQuery;
  activeMinPrice = minPrice;
  activeMaxPrice = maxPrice;
  void refreshProducts();
}

$: if (
  mounted &&
  sentinelVisible &&
  hasMore &&
  !loadingInitial &&
  !loadingMore &&
  !loadMoreError
) {
  void loadMoreProducts();
}

function buildProductsUrl(nextOffset: number) {
  const params = new URLSearchParams({
    offset: String(nextOffset),
    limit: String(pageSize),
  });

  if (searchQuery) {
    params.set('search', searchQuery);
  }

  if (minPrice !== null) {
    params.set('minPrice', String(minPrice));
  }

  if (maxPrice !== null) {
    params.set('maxPrice', String(maxPrice));
  }

  return `/api/products?${params.toString()}`;
}

async function fetchProducts(nextOffset: number, mode: 'replace' | 'append') {
  const token = ++requestToken;

  if (mode === 'replace') {
    loadingInitial = true;
    errorMessage = '';
    loadMoreError = '';
    products = [];
    total = 0;
    offset = 0;
    hasMore = false;
  } else {
    loadingMore = true;
    loadMoreError = '';
  }

  try {
    const response = await apiFetch<ProductGridResponse>(
      buildProductsUrl(nextOffset),
    );

    if (token !== requestToken) {
      return;
    }

    products =
      mode === 'append' ? [...products, ...response.items] : response.items;
    total = response.total;
    offset = response.offset + response.items.length;
    hasMore = response.hasMore;
    availableMinPrice = response.availableMinPrice;
    availableMaxPrice = response.availableMaxPrice;
    errorMessage = '';
  } catch (error) {
    if (token !== requestToken) {
      return;
    }

    const message =
      error instanceof Error
        ? error.message
        : 'The catalog could not be loaded.';

    if (mode === 'append') {
      loadMoreError = message;
    } else {
      errorMessage = message;
    }
  } finally {
    if (token === requestToken) {
      loadingInitial = false;
      loadingMore = false;
    }
  }
}

async function refreshProducts() {
  await fetchProducts(0, 'replace');
}

async function loadMoreProducts() {
  if (!hasMore || loadingInitial || loadingMore) {
    return;
  }

  await fetchProducts(offset, 'append');
}

onMount(() => {
  mounted = true;
  activeSearchQuery = searchQuery;
  activeMinPrice = minPrice;
  activeMaxPrice = maxPrice;

  observer = new IntersectionObserver(
    ([entry]) => {
      sentinelVisible = entry?.isIntersecting ?? false;
    },
    {
      rootMargin: '220px 0px 320px 0px',
    },
  );

  if (sentinel) {
    observer.observe(sentinel);
  }

  void refreshProducts();

  return () => {
    observer?.disconnect();
  };
});
</script>

{#if errorMessage}
  <div class="surface-panel p-6 text-sm text-rose-600">{errorMessage}</div>
{:else if !products.length && !loadingInitial}
  <div class="surface-panel p-10 text-center">
    <h3 class="text-xl font-bold text-slate-950">No matching products yet</h3>
    <p class="mt-2 text-sm text-slate-500">Try another keyword or clear the search to see the full seeded catalog.</p>
  </div>
{:else}
  <div class="space-y-4">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" data-testid={loadingInitial ? 'product-grid-loading' : 'product-grid'}>
      {#if loadingInitial}
        {#each skeletonIndexes as index (index)}
          <article class="surface-panel overflow-hidden animate-pulse" aria-hidden="true">
            <div class="aspect-[4/3] bg-slate-200"></div>
            <div class="space-y-4 p-5">
              <div class="h-3 w-24 rounded-full bg-slate-200"></div>
              <div class="space-y-2">
                <div class="h-5 w-3/4 rounded-full bg-slate-200"></div>
              </div>
              <div class="h-6 w-20 rounded-full bg-slate-200"></div>
              <div class="flex gap-3">
                <div class="h-11 w-11 rounded-2xl bg-slate-200"></div>
                <div class="h-11 flex-1 rounded-2xl bg-slate-200"></div>
              </div>
            </div>
          </article>
        {/each}
      {:else}
        {#each products as product (product.id)}
          <ProductCard {product} />
        {/each}
      {/if}
    </div>

    {#if loadingMore}
      <div class="space-y-3" data-testid="product-grid-loading-more">
        <p class="text-sm font-medium text-slate-500">Loading more products...</p>
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {#each skeletonIndexes.slice(0, Math.min(pageSize, 4)) as index (index)}
            <article class="surface-panel overflow-hidden animate-pulse" aria-hidden="true">
              <div class="aspect-[4/3] bg-slate-200"></div>
              <div class="space-y-4 p-5">
              <div class="h-3 w-24 rounded-full bg-slate-200"></div>
              <div class="space-y-2">
                <div class="h-5 w-3/4 rounded-full bg-slate-200"></div>
              </div>
              <div class="h-6 w-20 rounded-full bg-slate-200"></div>
            </div>
            </article>
          {/each}
        </div>
      </div>
    {/if}

    {#if loadMoreError}
      <div class="surface-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-rose-600">{loadMoreError}</p>
        <button
          type="button"
          class="inline-flex w-fit rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50"
          on:click={() => void loadMoreProducts()}
        >
          Try again
        </button>
      </div>
    {:else if !loadingInitial && products.length}
      <p class="text-sm text-slate-500">
        Showing {products.length} of {total} products
      </p>
    {/if}
  </div>
{/if}

<div bind:this={sentinel} class="h-1" data-testid="product-grid-sentinel" aria-hidden="true"></div>
