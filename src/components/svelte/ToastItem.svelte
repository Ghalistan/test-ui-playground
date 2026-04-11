<script lang="ts">
import Check from 'lucide-svelte/icons/check';
import CircleAlert from 'lucide-svelte/icons/circle-alert';
import LoaderCircle from 'lucide-svelte/icons/loader-circle';
import { onMount } from 'svelte';

import { type AppToast, clearToast } from '../../lib/stores/app';

export let toast: AppToast;
export let index = 0;

const EXIT_DURATION = 180;

let closing = false;
let entered = false;
let progressBar: HTMLDivElement | null = null;
let progressAnimation: Animation | null = null;
let removalTimeout: number | null = null;
let enterFrame = 0;
let hasAutoDismiss = false;

$: hasAutoDismiss = toast.duration !== null;

function dismiss() {
  if (closing) {
    return;
  }

  closing = true;

  if (progressAnimation) {
    progressAnimation.cancel();
    progressAnimation = null;
  }

  if (progressBar) {
    progressBar.style.transform = 'scaleX(0)';
  }

  removalTimeout = window.setTimeout(() => {
    clearToast(toast.id);
  }, EXIT_DURATION);
}

onMount(() => {
  enterFrame = window.requestAnimationFrame(() => {
    entered = true;
  });

  if (progressBar && hasAutoDismiss) {
    progressAnimation = progressBar.animate(
      [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }],
      {
        duration: toast.duration,
        easing: 'linear',
        fill: 'forwards',
      },
    );

    progressAnimation.onfinish = () => {
      dismiss();
    };
  }

  return () => {
    if (enterFrame) {
      window.cancelAnimationFrame(enterFrame);
    }

    if (progressAnimation) {
      progressAnimation.cancel();
    }

    if (removalTimeout) {
      window.clearTimeout(removalTimeout);
    }
  };
});
</script>

<button
  type="button"
  class={`toast-item relative w-full cursor-pointer overflow-hidden rounded-[1.2rem] border px-4 pt-3 pb-4 text-left shadow-xl backdrop-blur-sm ${
    toast.tone === 'error'
      ? 'border-rose-200 bg-rose-50/95 text-rose-900 hover:border-rose-300'
      : toast.tone === 'info'
        ? 'border-sky-200 bg-sky-50/95 text-sky-950 hover:border-sky-300'
        : 'border-shopedia-200 bg-white/95 text-slate-900 hover:border-shopedia-300'
  } ${entered ? 'toast-item-entered' : ''} ${closing ? 'toast-item-leaving' : ''}`}
  style={`--toast-accent:${toast.tone === 'error' ? '244 63 94' : toast.tone === 'info' ? '14 165 233' : '22 101 52'}; --toast-depth:${Math.min(index, 4)};`}
  on:pointerenter={() => {
    if (!closing && hasAutoDismiss) {
      progressAnimation?.pause();
    }
  }}
  on:pointerleave={() => {
    if (!closing && hasAutoDismiss) {
      progressAnimation?.play();
    }
  }}
  on:click={dismiss}
  data-testid="app-toast"
  data-toast-id={toast.id}
  aria-label={`Dismiss notification: ${toast.message}`}
>
  <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--toast-accent),0.12),transparent_45%)]"></div>

  <div class="relative flex items-start gap-3 pr-3">
    <span
      class={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
        toast.tone === 'error'
          ? 'bg-rose-100 text-rose-700'
          : toast.tone === 'info'
            ? 'bg-sky-100 text-sky-700'
            : 'bg-shopedia-50 text-shopedia-700'
      }`}
      aria-hidden="true"
    >
      {#if toast.tone === 'error'}
        <CircleAlert class="h-4 w-4" />
      {:else if toast.tone === 'info'}
        <LoaderCircle class="h-4 w-4 animate-spin" />
      {:else}
        <Check class="h-4 w-4" />
      {/if}
    </span>

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <p
          class={`text-[11px] font-bold uppercase tracking-[0.24em] ${
            toast.tone === 'error' ? 'text-rose-700/80' : toast.tone === 'info' ? 'text-sky-700/90' : 'text-shopedia-700'
          }`}
        >
          {toast.label}
        </p>
      </div>
      <p class="text-sm font-semibold leading-6">{toast.message}</p>
    </div>
  </div>

  <div
    class={`absolute inset-x-0 bottom-0 h-1.5 overflow-hidden ${
      toast.tone === 'error' ? 'bg-rose-100/90' : toast.tone === 'info' ? 'bg-sky-100/95' : 'bg-slate-100/95'
    }`}
    aria-hidden="true"
  >
    <div
      bind:this={progressBar}
      class={`h-full origin-left ${toast.tone === 'error' ? 'bg-rose-500' : toast.tone === 'info' ? 'bg-sky-500' : 'bg-shopedia-500'}`}
      style="transform: scaleX(1);"
    ></div>
  </div>
</button>

<style>
  .toast-item {
    opacity: 0;
    transform: translate3d(18px, -10px, 0) scale(0.97);
    box-shadow: 0 22px 42px -28px rgb(15 23 42 / 0.34);
    transition:
      transform 240ms cubic-bezier(0.21, 1, 0.32, 1),
      opacity 220ms ease,
      box-shadow 220ms ease,
      border-color 220ms ease;
  }

  .toast-item-entered {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }

  .toast-item-entered:hover {
    transform: translate3d(-1px, -2px, 0) scale(1.01);
    box-shadow: 0 28px 56px -30px rgb(15 23 42 / 0.42);
  }

  .toast-item-leaving,
  .toast-item-leaving:hover {
    opacity: 0;
    transform: translate3d(28px, -2px, 0) scale(0.95);
    box-shadow: 0 16px 30px -24px rgb(15 23 42 / 0.18);
  }
</style>
