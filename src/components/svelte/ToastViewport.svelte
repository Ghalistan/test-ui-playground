<script lang="ts">
import type { FlipParams } from 'svelte/animate';
import { flip as stackFlip } from 'svelte/animate';
import { cubicOut } from 'svelte/easing';
import { toastStore } from '../../lib/stores/app';
import ToastItem from './ToastItem.svelte';

function stackMotion(...args: Parameters<typeof stackFlip>) {
  const [node, animations, params] = args;

  return stackFlip(node, animations, {
    duration: 260,
    easing: cubicOut,
    ...((params ?? {}) as FlipParams),
  });
}
</script>

<div
  class="pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col gap-2.5 sm:left-auto sm:right-4 sm:w-[25rem]"
  aria-live="polite"
  aria-atomic="false"
  aria-relevant="additions removals"
>
  {#each $toastStore as toast, index (toast.id)}
    <div
      animate:stackMotion={{ duration: 260 }}
      class="toast-stack-shell pointer-events-auto"
      style={`--toast-depth:${Math.min(index, 4)};`}
    >
      <ToastItem {toast} {index} />
    </div>
  {/each}
</div>

<style>
  .toast-stack-shell {
    width: 100%;
    transform-origin: top right;
    padding-left: calc(var(--toast-depth) * 0.55rem);
    opacity: calc(1 - var(--toast-depth) * 0.08);
    filter: saturate(calc(1 - var(--toast-depth) * 0.05));
    transition: padding 220ms ease, opacity 220ms ease, filter 220ms ease;
  }

  @media (max-width: 639px) {
    .toast-stack-shell {
      padding-left: calc(var(--toast-depth) * 0.3rem);
    }
  }
</style>
