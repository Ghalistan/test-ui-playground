<script lang="ts">
import { onMount } from 'svelte';

import {
  formatPriceInput,
  parsePositiveInteger,
  sanitizePriceInput,
} from '../../lib/pricing';
import { readSearchParams, syncSearchParamsToUrl } from '../../lib/url-sync';
import { formatCurrency } from '../../lib/utils';
import ProductGrid from './ProductGrid.svelte';

export let initialSearchQuery = '';
export let initialMinPrice: number | null = null;
export let initialMaxPrice: number | null = null;

let searchQuery = initialSearchQuery;
let availableMinPrice: number | null = null;
let availableMaxPrice: number | null = null;
let minPriceInput = formatPriceInput(initialMinPrice);
let maxPriceInput = formatPriceInput(initialMaxPrice);
let committedMinPrice: number | null = initialMinPrice;
let committedMaxPrice: number | null = initialMaxPrice;
let mounted = false;

function applySearchParams(params: ReturnType<typeof readSearchParams>) {
  searchQuery = params.query;
  committedMinPrice = params.minPrice;
  committedMaxPrice = params.maxPrice;
  minPriceInput = formatPriceInput(committedMinPrice);
  maxPriceInput = formatPriceInput(committedMaxPrice);
}

function handleMinPriceInput(event: Event) {
  minPriceInput = sanitizePriceInput(
    (event.currentTarget as HTMLInputElement).value,
  );
}

function handleMaxPriceInput(event: Event) {
  maxPriceInput = sanitizePriceInput(
    (event.currentTarget as HTMLInputElement).value,
  );
}

function handlePriceInputKeydown(event: KeyboardEvent, field: 'min' | 'max') {
  if (event.key !== 'Enter') {
    return;
  }

  event.preventDefault();

  if (field === 'min') {
    commitMinPrice();
  } else {
    commitMaxPrice();
  }

  (event.currentTarget as HTMLInputElement).blur();
}

function commitMinPrice() {
  const nextMinPrice = parsePositiveInteger(minPriceInput);

  if (
    nextMinPrice !== null &&
    committedMaxPrice !== null &&
    nextMinPrice > committedMaxPrice
  ) {
    committedMinPrice = committedMaxPrice;
    minPriceInput = formatPriceInput(committedMaxPrice);
    return;
  }

  committedMinPrice = nextMinPrice;
  minPriceInput = formatPriceInput(nextMinPrice);
}

function commitMaxPrice() {
  const nextMaxPrice = parsePositiveInteger(maxPriceInput);

  if (
    nextMaxPrice !== null &&
    committedMinPrice !== null &&
    nextMaxPrice < committedMinPrice
  ) {
    committedMaxPrice = committedMinPrice;
    maxPriceInput = formatPriceInput(committedMinPrice);
    return;
  }

  committedMaxPrice = nextMaxPrice;
  maxPriceInput = formatPriceInput(nextMaxPrice);
}

function clearPriceFilter() {
  committedMinPrice = null;
  committedMaxPrice = null;
  minPriceInput = '';
  maxPriceInput = '';
}

onMount(() => {
  applySearchParams(readSearchParams());
  mounted = true;
  syncSearchParamsToUrl(searchQuery, committedMinPrice, committedMaxPrice);
});

$: hasSearchQuery = Boolean(searchQuery.trim());
$: hasAvailablePriceRange =
  availableMinPrice !== null && availableMaxPrice !== null;

$: if (mounted) {
  syncSearchParamsToUrl(searchQuery, committedMinPrice, committedMaxPrice);
}
</script>

{#if !hasSearchQuery}
  <section class="surface-panel p-8 sm:p-10" data-testid="search-results-empty-query">
    <p class="text-xs uppercase tracking-[0.24em] text-slate-400">Search</p>
    <h1 class="mt-3 text-3xl font-black tracking-tight text-slate-950">Find products by item or shop</h1>
    <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
      Use search bar above to look for matching product names or shop names.
    </p>
  </section>
{:else}
  <section class="space-y-6" data-testid="search-results-page">
    <div class="space-y-2">
      <p class="text-xs uppercase tracking-[0.24em] text-slate-400">Search results</p>
      <h1 class="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
        Results for “{searchQuery}”
      </h1>
      <p class="text-sm text-slate-500" data-testid="search-results-summary">
        Matching product names and shop names. Narrow results with price range.
      </p>
    </div>

    <div class="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
      <aside class="lg:sticky lg:top-24" data-testid="search-filter-sidebar">
        <div class="surface-panel space-y-6 p-5 sm:p-6">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg font-bold text-slate-950">Harga</h2>
            <button
              type="button"
              class="text-sm font-semibold text-slate-500 transition hover:text-shopedia-700 disabled:cursor-not-allowed disabled:opacity-60"
              on:click={clearPriceFilter}
              disabled={committedMinPrice === null && committedMaxPrice === null}
              data-testid="clear-price-filter"
            >
              Clear
            </button>
          </div>

          <div class="space-y-3">
            <label class="block" for="price-filter-min">
              <span class="sr-only">Harga Minimum</span>
              <div class="flex overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <span class="flex h-12 items-center justify-center bg-slate-100 px-4 text-base font-semibold text-slate-500">
                  Rp
                </span>
                <input
                  id="price-filter-min"
                  type="text"
                  inputmode="numeric"
                  value={minPriceInput}
                  placeholder="Harga Minimum"
                  class="h-12 min-w-0 flex-1 border-0 bg-transparent px-4 text-base text-slate-900 outline-none placeholder:text-slate-400"
                  on:input={handleMinPriceInput}
                  on:blur={commitMinPrice}
                  on:keydown={(event) => handlePriceInputKeydown(event, 'min')}
                  data-testid="price-filter-min"
                  aria-label="Harga Minimum"
                />
              </div>
            </label>

            <label class="block" for="price-filter-max">
              <span class="sr-only">Harga Maksimum</span>
              <div class="flex overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <span class="flex h-12 items-center justify-center bg-slate-100 px-4 text-base font-semibold text-slate-500">
                  Rp
                </span>
                <input
                  id="price-filter-max"
                  type="text"
                  inputmode="numeric"
                  value={maxPriceInput}
                  placeholder="Harga Maksimum"
                  class="h-12 min-w-0 flex-1 border-0 bg-transparent px-4 text-base text-slate-900 outline-none placeholder:text-slate-400"
                  on:input={handleMaxPriceInput}
                  on:blur={commitMaxPrice}
                  on:keydown={(event) => handlePriceInputKeydown(event, 'max')}
                  data-testid="price-filter-max"
                  aria-label="Harga Maksimum"
                />
              </div>
            </label>

          </div>

          {#if committedMinPrice !== null || committedMaxPrice !== null}
            <div class="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p class="font-semibold text-slate-900">Active price filter</p>
              <p class="mt-2" data-testid="price-filter-summary">
                {committedMinPrice !== null ? formatCurrency(committedMinPrice) : 'Any minimum'}
                {' '}
                to
                {' '}
                {committedMaxPrice !== null ? formatCurrency(committedMaxPrice) : 'Any maximum'}
              </p>
            </div>
          {/if}
        </div>
      </aside>

      <div class="min-w-0">
          <ProductGrid
          searchQuery={searchQuery}
          minPrice={committedMinPrice}
          maxPrice={committedMaxPrice}
          bind:availableMinPrice
          bind:availableMaxPrice
          pageSize={8}
        />
      </div>
    </div>
  </section>
{/if}
