<script lang="ts">
import { onMount } from 'svelte';

import { apiFetch } from '../../lib/api/client';
import { syncChromeState } from '../../lib/stores/app';

export let email = '';

let otp = '';
let submitting = false;
let errorMessage = '';

onMount(() => {
  if (email) {
    return;
  }

  const url = new URL(window.location.href);
  email = url.searchParams.get('email') ?? '';
});

async function handleSubmit(event: SubmitEvent) {
  event.preventDefault();
  submitting = true;
  errorMessage = '';

  try {
    await apiFetch('/api/auth/register/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });

    await syncChromeState();
    window.location.assign('/');
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : 'Verification failed.';
  } finally {
    submitting = false;
  }
}
</script>

{#if email}
  <form class="space-y-5" on:submit|preventDefault={handleSubmit} data-testid="otp-form">
    <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
      Verifying account for <span class="font-semibold text-slate-900">{email}</span>
    </div>

    <div class="space-y-2">
      <label class="text-sm font-semibold text-slate-700" for="register-otp">OTP code</label>
      <input
        id="register-otp"
        bind:value={otp}
        inputmode="numeric"
        autocomplete="one-time-code"
        minlength="6"
        maxlength="6"
        required
        class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm tracking-[0.35em] outline-none transition focus:border-shopedia-400 focus:ring-4 focus:ring-shopedia-100"
        data-testid="otp-code"
      />
    </div>

    {#if errorMessage}
      <p class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
    {/if}

    <button
      type="submit"
      class="w-full rounded-2xl bg-shopedia-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-shopedia-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      disabled={submitting}
      data-testid="otp-submit"
    >
      {submitting ? 'Verifying...' : 'Verify and Login'}
    </button>
  </form>
{:else}
  <div class="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
    This verification link is missing an email address. Return to registration and request a new OTP.
  </div>
{/if}
