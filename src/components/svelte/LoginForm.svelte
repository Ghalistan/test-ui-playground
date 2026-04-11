<script lang="ts">
import { apiFetch } from '../../lib/api/client';
import { syncChromeState } from '../../lib/stores/app';

export let next = '/';

let email = '';
let password = '';
let submitting = false;
let errorMessage = '';

async function handleSubmit(event: SubmitEvent) {
  event.preventDefault();
  submitting = true;
  errorMessage = '';

  try {
    await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    await syncChromeState();
    window.location.assign(next || '/');
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'Login failed.';
  } finally {
    submitting = false;
  }
}
</script>

<form class="space-y-5" on:submit|preventDefault={handleSubmit} data-testid="login-form">
  <div class="space-y-2">
    <label class="text-sm font-semibold text-slate-700" for="login-email">Email</label>
    <input
      id="login-email"
      bind:value={email}
      type="email"
      autocomplete="email"
      placeholder="customer@gghgh.dev"
      required
      class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-shopedia-400 focus:ring-4 focus:ring-shopedia-100"
      data-testid="login-email"
    />
  </div>

  <div class="space-y-2">
    <label class="text-sm font-semibold text-slate-700" for="login-password">Password</label>
    <input
      id="login-password"
      bind:value={password}
      type="password"
      autocomplete="current-password"
      placeholder="password123"
      required
      class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-shopedia-400 focus:ring-4 focus:ring-shopedia-100"
      data-testid="login-password"
    />
  </div>

  {#if errorMessage}
    <p class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
  {/if}

  <button
    type="submit"
    class="w-full rounded-2xl bg-shopedia-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-shopedia-700 disabled:cursor-not-allowed disabled:bg-slate-300"
    disabled={submitting}
    data-testid="login-submit"
  >
    {submitting ? 'Signing in...' : 'Login'}
  </button>
</form>
