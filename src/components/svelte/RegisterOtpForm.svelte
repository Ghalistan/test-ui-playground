<script lang="ts">
import { onMount } from 'svelte';

import { apiFetch } from '../../lib/api/client';
import { syncChromeState } from '../../lib/stores/app';

export let email = '';

let otpDigits: string[] = ['', '', '', '', '', ''];
let inputRefs: HTMLInputElement[] = [];
let submitting = false;
let errorMessage = '';

$: otp = otpDigits.join('');

onMount(() => {
  if (email) {
    return;
  }

  const url = new URL(window.location.href);
  email = url.searchParams.get('email') ?? '';
});

function focusInput(index: number) {
  if (index >= 0 && index < 6 && inputRefs[index]) {
    inputRefs[index].focus();
  }
}

function handleInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement;
  const value = target.value;

  // Only allow digits
  const digit = value.replace(/\D/g, '').slice(-1);
  otpDigits[index] = digit;

  // Auto-focus next input if digit entered
  if (digit && index < 5) {
    focusInput(index + 1);
  }

  // Auto-submit if all digits filled
  if (otpDigits.every((d) => d) && index === 5) {
    setTimeout(() => {
      const form = target.closest('form');
      if (form) form.requestSubmit();
    }, 50);
  }
}

function handleKeydown(index: number, event: KeyboardEvent) {
  const target = event.target as HTMLInputElement;

  // Backspace on empty field moves to previous
  if (event.key === 'Backspace' && !target.value && index > 0) {
    event.preventDefault();
    otpDigits[index - 1] = '';
    focusInput(index - 1);
    return;
  }

  // Arrow keys navigate between inputs
  if (event.key === 'ArrowLeft' && index > 0) {
    event.preventDefault();
    focusInput(index - 1);
    return;
  }

  if (event.key === 'ArrowRight' && index < 5) {
    event.preventDefault();
    focusInput(index + 1);
    return;
  }

  // Delete key clears current and moves forward (or stays)
  if (event.key === 'Delete') {
    otpDigits[index] = '';
    return;
  }
}

function handlePaste(event: ClipboardEvent) {
  event.preventDefault();
  const pastedData = event.clipboardData?.getData('text') ?? '';
  const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');

  digits.forEach((digit, i) => {
    if (i < 6) otpDigits[i] = digit;
  });

  // Focus the appropriate input after paste
  if (digits.length < 6) {
    focusInput(digits.length);
  } else {
    focusInput(5);
    // Auto-submit if all 6 digits pasted
    setTimeout(() => {
      const form = (event.target as HTMLElement).closest('form');
      if (form) form.requestSubmit();
    }, 50);
  }
}

async function handleSubmit(event: SubmitEvent) {
  event.preventDefault();

  if (otp.length !== 6) {
    errorMessage = 'Please enter all 6 digits.';
    return;
  }

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
    // Clear inputs on error and focus first
    otpDigits = ['', '', '', '', '', ''];
    focusInput(0);
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

    <div class="space-y-3">
      <span id="otp-code-label" class="text-sm font-semibold text-slate-700">OTP code</span>
      <div
        class="flex justify-center gap-2 sm:gap-3"
        data-testid="otp-code"
        role="group"
        aria-labelledby="otp-code-label"
      >
        {#each otpDigits as digit, index}
          <input
            bind:this={inputRefs[index]}
            bind:value={otpDigits[index]}
            type="text"
            inputmode="numeric"
            pattern="[0-9]"
            maxlength="1"
            required
            class="h-12 w-10 rounded-xl border border-slate-200 bg-white text-center text-xl font-semibold text-slate-900 outline-none transition focus:border-shopedia-400 focus:ring-4 focus:ring-shopedia-100 sm:h-14 sm:w-12"
            on:input={(e) => handleInput(index, e)}
            on:keydown={(e) => handleKeydown(index, e)}
            on:paste={index === 0 ? handlePaste : null}
            autocomplete={index === 0 ? 'one-time-code' : 'off'}
            aria-label={`Digit ${index + 1} of 6`}
            disabled={submitting}
          />
        {/each}
      </div>
      <p class="text-center text-xs text-slate-500">Enter the 6-digit code sent to your email</p>
    </div>

    {#if errorMessage}
      <p class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
    {/if}

    <button
      type="submit"
      class="w-full rounded-2xl bg-shopedia-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-shopedia-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      disabled={submitting || otp.length !== 6}
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
