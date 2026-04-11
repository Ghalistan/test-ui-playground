<script lang="ts">
import LoaderCircle from 'lucide-svelte/icons/loader-circle';
import Plus from 'lucide-svelte/icons/plus';
import ShoppingCart from 'lucide-svelte/icons/shopping-cart';
import { apiFetch } from '../../lib/api/client';
import { refreshCartCount, showToast } from '../../lib/stores/app';
import type { Product } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';

export let product: Product;

let adding = false;
let feedback = '';
let errorState = false;

async function handleAddToCart() {
  adding = true;
  feedback = '';
  errorState = false;

  try {
    await apiFetch('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    });

    await refreshCartCount();
    showToast(`${product.name} added to cart.`);
  } catch (error) {
    feedback =
      error instanceof Error
        ? error.message
        : 'This product could not be added right now.';
    errorState = true;
  } finally {
    adding = false;
  }
}

const productHref = `/products/${product.slug}`;
const instantCheckoutHref = `/checkout?mode=instant&productId=${encodeURIComponent(product.id)}&qty=1`;
</script>

<article class="group surface-panel relative flex h-full flex-col overflow-hidden" data-testid={`product-card-${product.id}`}>
  <div class="relative overflow-hidden bg-gradient-to-br from-shopedia-50 via-white to-slate-100">
    <img
      src={product.imageUrl}
      alt={product.alt}
      class="aspect-[4/3] h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
      loading="lazy"
    />
    <div class="absolute left-4 top-4 flex gap-2">
      {#if product.featured}
        <span class="rounded-full bg-shopedia-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
          Featured
        </span>
      {/if}
      <span class="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-600 shadow-sm">
        {product.category}
      </span>
    </div>
  </div>

  <div class="flex flex-1 flex-col gap-4 p-5">
    <div>
      <h3 class="line-clamp-2 text-lg font-bold tracking-tight text-slate-950 transition group-hover:text-shopedia-700">
        {product.name}
      </h3>
    </div>

    <div class="flex items-center justify-between text-sm text-slate-500">
      <span>{product.seller}</span>
      <span>{product.rating.toFixed(1)} ★</span>
    </div>

    <div class="mt-auto space-y-3">
      <div class="space-y-1.5">
        <div>
          <p class="text-xs uppercase tracking-[0.24em] text-slate-400">Price</p>
          <p class="mt-1 text-[1.35rem] font-black leading-tight tracking-tight text-slate-950 tabular-nums sm:text-2xl">
            {formatCurrency(product.price)}
          </p>
        </div>
        <p class="text-xs font-medium text-slate-500">{product.stock} in stock</p>
      </div>

      <div class="relative z-20 flex gap-2">
        <button
          type="button"
          class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-shopedia-200 hover:text-shopedia-700 disabled:cursor-not-allowed disabled:opacity-60"
          on:click|stopPropagation={handleAddToCart}
          disabled={adding || product.stock < 1}
          data-testid={`add-to-cart-${product.id}`}
          aria-label={`Add ${product.name} to cart`}
        >
          {#if adding}
            <LoaderCircle class="h-4 w-4 animate-spin" aria-hidden="true" />
          {:else}
            <span class="relative inline-flex items-center justify-center">
              <ShoppingCart class="h-4 w-4" aria-hidden="true" />
              <Plus class="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-white text-shopedia-700" aria-hidden="true" />
            </span>
          {/if}
          <span class="sr-only">{adding ? 'Adding to cart' : 'Add to cart'}</span>
        </button>
        {#if product.stock > 0}
          <a
            href={instantCheckoutHref}
            class="flex-1 rounded-2xl bg-shopedia-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-shopedia-700"
            data-testid={`buy-now-${product.id}`}
          >
            Buy Now
          </a>
        {:else}
          <button
            type="button"
            class="flex-1 rounded-2xl bg-slate-300 px-4 py-3 text-sm font-semibold text-white"
            disabled
            data-testid={`buy-now-${product.id}`}
          >
            Buy Now
          </button>
        {/if}
      </div>

      {#if feedback}
        <p class={`relative z-20 text-sm ${errorState ? 'text-rose-600' : 'text-shopedia-700'}`}>{feedback}</p>
      {/if}
    </div>
  </div>

  <a
    href={productHref}
    class="absolute inset-0 z-10 rounded-[inherit] outline-none focus-visible:ring-4 focus-visible:ring-shopedia-100"
    data-testid={`view-product-${product.id}`}
    aria-label={`View details for ${product.name}`}
  >
    <span class="sr-only">View details for {product.name}</span>
  </a>
</article>
