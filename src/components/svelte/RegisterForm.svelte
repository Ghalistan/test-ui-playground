<script lang="ts">
import { apiFetch } from '../../lib/api/client';
import {
  type RegistrationFieldErrors,
  validateRegistrationFields,
} from '../../lib/validation/register';

let fullName = '';
let nickname = '';
let email = '';
let password = '';
let passwordConfirmation = '';
let addressLine1 = '';
let city = '';
let country = '';
let postalCode = '';
let submitting = false;
let errorMessage = '';
let fieldErrors: RegistrationFieldErrors = {};

const inputClass =
  'w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-shopedia-400 focus:ring-4 focus:ring-shopedia-100';

async function handleSubmit(event: SubmitEvent) {
  event.preventDefault();
  submitting = true;
  errorMessage = '';
  fieldErrors = validateRegistrationFields({
    fullName,
    nickname,
    email,
    password,
    passwordConfirmation,
  });

  if (Object.keys(fieldErrors).length > 0) {
    submitting = false;
    return;
  }

  try {
    const result = await apiFetch<{ email: string }>(
      '/api/auth/register/request-otp',
      {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          nickname,
          email,
          password,
          passwordConfirmation,
          addressLine1,
          city,
          country,
          postalCode,
        }),
      },
    );

    window.location.assign(
      `/register/verify?email=${encodeURIComponent(result.email)}`,
    );
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : 'Registration could not be started.';
  } finally {
    submitting = false;
  }
}
</script>

<form class="space-y-5" novalidate on:submit|preventDefault={handleSubmit} data-testid="register-form">
  <div class="grid gap-5 md:grid-cols-2">
    <div class="space-y-2 md:col-span-2">
      <label class="text-sm font-semibold text-slate-700" for="register-full-name">Full name</label>
      <input
        id="register-full-name"
        bind:value={fullName}
        type="text"
        autocomplete="name"
        required
        class={`${inputClass} ${fieldErrors.fullName ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200'}`}
      />
      {#if fieldErrors.fullName}
        <p class="text-sm text-rose-700">{fieldErrors.fullName}</p>
      {/if}
    </div>

    <div class="space-y-2">
      <label class="text-sm font-semibold text-slate-700" for="register-nickname">Nickname</label>
      <input
        id="register-nickname"
        bind:value={nickname}
        type="text"
        autocomplete="nickname"
        required
        class={`${inputClass} ${fieldErrors.nickname ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200'}`}
      />
      <p class="text-sm text-slate-500">At least 5 characters. Letters, numbers, and ., -, _, # only.</p>
      {#if fieldErrors.nickname}
        <p class="text-sm text-rose-700">{fieldErrors.nickname}</p>
      {/if}
    </div>

    <div class="space-y-2">
      <label class="text-sm font-semibold text-slate-700" for="register-email">Email</label>
      <input
        id="register-email"
        bind:value={email}
        type="email"
        autocomplete="email"
        required
        class={`${inputClass} ${fieldErrors.email ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200'}`}
      />
      {#if fieldErrors.email}
        <p class="text-sm text-rose-700">{fieldErrors.email}</p>
      {/if}
    </div>

    <div class="space-y-2">
      <label class="text-sm font-semibold text-slate-700" for="register-password">Password</label>
      <input
        id="register-password"
        bind:value={password}
        type="password"
        autocomplete="new-password"
        required
        class={`${inputClass} ${fieldErrors.password ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200'}`}
      />
      <p class="text-sm text-slate-500">Use at least 12 characters for better account protection.</p>
      {#if fieldErrors.password}
        <p class="text-sm text-rose-700">{fieldErrors.password}</p>
      {/if}
    </div>

    <div class="space-y-2">
      <label class="text-sm font-semibold text-slate-700" for="register-password-confirmation">Confirm password</label>
      <input
        id="register-password-confirmation"
        bind:value={passwordConfirmation}
        type="password"
        autocomplete="new-password"
        required
        class={`${inputClass} ${fieldErrors.passwordConfirmation ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200'}`}
      />
      {#if fieldErrors.passwordConfirmation}
        <p class="text-sm text-rose-700">{fieldErrors.passwordConfirmation}</p>
      {/if}
    </div>
  </div>

  <div class="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5">
    <div class="mb-4">
      <h3 class="text-sm font-semibold text-slate-900">Optional shipping details</h3>
      <p class="mt-1 text-sm text-slate-500">You can leave these blank now and fill them during checkout.</p>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2 md:col-span-2">
        <label class="text-sm font-medium text-slate-700" for="register-address">Address line</label>
        <input
          id="register-address"
          bind:value={addressLine1}
          type="text"
          autocomplete="street-address"
          class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-shopedia-400 focus:ring-4 focus:ring-shopedia-100"
        />
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium text-slate-700" for="register-city">City</label>
        <input id="register-city" bind:value={city} type="text" class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-shopedia-400 focus:ring-4 focus:ring-shopedia-100" />
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium text-slate-700" for="register-country">Country</label>
        <input id="register-country" bind:value={country} type="text" class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-shopedia-400 focus:ring-4 focus:ring-shopedia-100" />
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium text-slate-700" for="register-postal-code">Postal code</label>
        <input id="register-postal-code" bind:value={postalCode} type="text" class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-shopedia-400 focus:ring-4 focus:ring-shopedia-100" />
      </div>
    </div>
  </div>

  {#if errorMessage}
    <p class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
  {/if}

  <button
    type="submit"
    class="w-full rounded-2xl bg-shopedia-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-shopedia-700 disabled:cursor-not-allowed disabled:bg-slate-300"
    disabled={submitting}
    data-testid="register-submit"
  >
    {submitting ? 'Sending OTP...' : 'Continue to OTP'}
  </button>
</form>
