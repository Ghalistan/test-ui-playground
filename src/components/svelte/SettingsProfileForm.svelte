<script lang="ts">
import { onMount } from 'svelte';

import { apiFetch } from '../../lib/api/client';
import {
  formValuesToPayload,
  sessionToFormValues,
} from '../../lib/profile/helpers';
import { showToast, syncChromeState } from '../../lib/stores/app';
import type { SessionResponse, SessionUser } from '../../lib/types';
import { createInitials } from '../../lib/utils';
import {
  type ProfileFieldErrors,
  validateProfileUpdateFields,
} from '../../lib/validation/profile';

let loading = true;
let editing = false;
let saving = false;
let errorMessage = '';
let sessionUser: SessionUser | null = null;

// Form field values
let firstName = '';
let lastName = '';
let nickname = '';
let email = '';
let addressLine1 = '';
let city = '';
let country = '';
let postalCode = '';

// Original values for cancel
let originalValues = {
  firstName: '',
  lastName: '',
  nickname: '',
  addressLine1: '',
  city: '',
  country: '',
  postalCode: '',
};

let fieldErrors: ProfileFieldErrors = {};

const inputClass =
  'w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-shopedia-400 focus:ring-4 focus:ring-shopedia-100';

async function loadSession() {
  loading = true;
  try {
    const session = await apiFetch<SessionResponse>('/api/session');
    sessionUser = session.user;
    if (sessionUser) {
      const values = sessionToFormValues(sessionUser);
      firstName = values.firstName;
      lastName = values.lastName;
      nickname = values.nickname;
      email = sessionUser.email;
      addressLine1 = values.addressLine1;
      city = values.city;
      country = values.country;
      postalCode = values.postalCode;

      originalValues = { ...values };
    }
    errorMessage = '';
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : 'Settings could not be loaded.';
  } finally {
    loading = false;
  }
}

function startEditing() {
  editing = true;
  fieldErrors = {};
  errorMessage = '';
}

function cancelEditing() {
  firstName = originalValues.firstName;
  lastName = originalValues.lastName;
  nickname = originalValues.nickname;
  addressLine1 = originalValues.addressLine1;
  city = originalValues.city;
  country = originalValues.country;
  postalCode = originalValues.postalCode;

  editing = false;
  fieldErrors = {};
  errorMessage = '';
}

function buildProfilePayload() {
  return formValuesToPayload({
    firstName,
    lastName,
    nickname,
    addressLine1,
    city,
    country,
    postalCode,
  });
}

async function handleSave() {
  fieldErrors = validateProfileUpdateFields({
    firstName,
    lastName,
    nickname,
    addressLine1,
    city,
    country,
    postalCode,
  });

  if (Object.keys(fieldErrors).length > 0) {
    return;
  }

  saving = true;
  errorMessage = '';

  try {
    await apiFetch('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(buildProfilePayload()),
    });

    originalValues = {
      firstName,
      lastName,
      nickname,
      addressLine1,
      city,
      country,
      postalCode,
    };

    // Sync session state and show toast
    await syncChromeState();
    showToast('Profile updated successfully.', 'success', 3000, 'Profile');

    editing = false;
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : 'Profile could not be saved.';
  } finally {
    saving = false;
  }
}

onMount(() => {
  void loadSession();
});
</script>

{#if loading}
  <div class="surface-panel p-8 text-sm text-slate-500">Loading profile...</div>
{:else if sessionUser}
  <section class="surface-panel p-6 sm:p-8">
    <div class="mb-6 flex items-center justify-between">
      <p class="text-xs uppercase tracking-[0.24em] text-slate-400">Profile Information</p>
      <div class="flex h-10 items-center gap-2">
        {#if !editing}
          <button
            type="button"
            on:click={startEditing}
            class="rounded-xl bg-shopedia-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-shopedia-700"
            data-testid="edit-profile"
          >
            Edit
          </button>
        {:else}
          <button
            type="button"
            on:click={cancelEditing}
            class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            disabled={saving}
            data-testid="cancel-profile"
          >
            Cancel
          </button>
          <button
            type="button"
            on:click={handleSave}
            class="rounded-xl bg-shopedia-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-shopedia-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={saving}
            data-testid="save-profile"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        {/if}
      </div>
    </div>

    <!-- Profile Image (read-only) -->
    <div class="mb-6 flex items-center gap-4">
      {#if sessionUser.profileImageUrl}
        <img
          src={sessionUser.profileImageUrl}
          alt={`${nickname} profile`}
          class="h-16 w-16 rounded-full border border-slate-200 object-cover"
        />
      {:else}
        <div
          class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-shopedia-100 text-lg font-bold text-shopedia-700"
        >
          {createInitials(nickname)}
        </div>
      {/if}
      <div>
        <h2 class="text-2xl font-black tracking-tight text-slate-950">{nickname}</h2>
        <p class="text-sm text-slate-500">{email}</p>
      </div>
    </div>

    <!-- Editable Form -->
    <form class="space-y-5" novalidate on:submit|preventDefault={handleSave}>
      <div class="grid gap-5 md:grid-cols-2">
        <!-- First Name -->
        <div class="space-y-2">
          <label class="text-sm font-semibold text-slate-700" for="profile-first-name">First name</label>
          <input
            id="profile-first-name"
            bind:value={firstName}
            type="text"
            disabled={!editing}
            class={`${inputClass} ${fieldErrors.firstName ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200'} ${!editing ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500' : 'bg-white'}`}
          />
          {#if fieldErrors.firstName}
            <p class="text-sm text-rose-700">{fieldErrors.firstName}</p>
          {/if}
        </div>

        <!-- Last Name -->
        <div class="space-y-2">
          <label class="text-sm font-semibold text-slate-700" for="profile-last-name">Last name</label>
          <input
            id="profile-last-name"
            bind:value={lastName}
            type="text"
            disabled={!editing}
            class={`${inputClass} ${fieldErrors.lastName ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200'} ${!editing ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500' : 'bg-white'}`}
          />
          {#if fieldErrors.lastName}
            <p class="text-sm text-rose-700">{fieldErrors.lastName}</p>
          {/if}
        </div>

        <!-- Nickname -->
        <div class="space-y-2">
          <label class="text-sm font-semibold text-slate-700" for="profile-nickname">Nickname</label>
          <input
            id="profile-nickname"
            bind:value={nickname}
            type="text"
            disabled={!editing}
            class={`${inputClass} ${fieldErrors.nickname ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200'} ${!editing ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500' : 'bg-white'}`}
          />
          {#if fieldErrors.nickname}
            <p class="text-sm text-rose-700">{fieldErrors.nickname}</p>
          {/if}
        </div>

        <!-- Email (always disabled) -->
        <div class="space-y-2">
          <label class="text-sm font-semibold text-slate-700" for="profile-email">Email</label>
          <input
            id="profile-email"
            bind:value={email}
            type="email"
            disabled
            class={`${inputClass} cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500`}
          />
          <p class="text-xs text-slate-400">Email cannot be changed</p>
        </div>
      </div>

      <div class="border-t border-slate-100 pt-5">
        <p class="mb-4 text-sm font-semibold text-slate-700">Address</p>
        <div class="grid gap-5 md:grid-cols-2">
          <!-- Address Line 1 -->
          <div class="space-y-2 md:col-span-2">
            <label class="text-sm font-medium text-slate-700" for="profile-address">Address line</label>
            <input
              id="profile-address"
              bind:value={addressLine1}
              type="text"
              disabled={!editing}
              class={`${inputClass} ${fieldErrors.addressLine1 ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200'} ${!editing ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500' : 'bg-white'}`}
            />
            {#if fieldErrors.addressLine1}
              <p class="text-sm text-rose-700">{fieldErrors.addressLine1}</p>
            {/if}
          </div>

          <!-- City -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700" for="profile-city">City</label>
            <input
              id="profile-city"
              bind:value={city}
              type="text"
              disabled={!editing}
              class={`${inputClass} ${fieldErrors.city ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200'} ${!editing ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500' : 'bg-white'}`}
            />
            {#if fieldErrors.city}
              <p class="text-sm text-rose-700">{fieldErrors.city}</p>
            {/if}
          </div>

          <!-- Country -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700" for="profile-country">Country</label>
            <input
              id="profile-country"
              bind:value={country}
              type="text"
              disabled={!editing}
              class={`${inputClass} ${fieldErrors.country ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200'} ${!editing ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500' : 'bg-white'}`}
            />
            {#if fieldErrors.country}
              <p class="text-sm text-rose-700">{fieldErrors.country}</p>
            {/if}
          </div>

          <!-- Postal Code -->
          <div class="space-y-2 md:col-span-2">
            <label class="text-sm font-medium text-slate-700" for="profile-postal-code">Postal code</label>
            <input
              id="profile-postal-code"
              bind:value={postalCode}
              type="text"
              disabled={!editing}
              class={`${inputClass} ${fieldErrors.postalCode ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200'} ${!editing ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500' : 'bg-white'}`}
            />
            {#if fieldErrors.postalCode}
              <p class="text-sm text-rose-700">{fieldErrors.postalCode}</p>
            {/if}
          </div>
        </div>
      </div>

      {#if errorMessage}
        <p class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
      {/if}
    </form>
  </section>
{:else}
  <section class="surface-panel p-6 sm:p-8">
    <p class="text-xs uppercase tracking-[0.24em] text-slate-400">Profile Information</p>
    <div class="mt-5 rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">
      You are viewing settings as a guest. Log in to manage your profile information.
    </div>
  </section>
{/if}
