# Shopedia

Shopedia is a demo e-commerce storefront built for UI automation practice.

It uses Astro for the shell, Svelte for interactive islands, Tailwind 4 for styling, MSW for browser-routed `/api/*` requests, and Dexie + IndexedDB for persistent local data. There is no real backend.

## Stack

- Astro 6
- Svelte 5
- Tailwind CSS 4
- Bun
- MSW 2
- Dexie
- `@astrojs/sitemap`

## Requirements

- Node `>=22.12.0`
- Bun

## Commands

Run all commands from the repo root.

| Command | Action |
| :-- | :-- |
| `bun install` | Install dependencies |
| `bun run dev` | Start the Astro dev server with `--host` |
| `bun run check` | Run `astro check` |
| `bun run check:biome` | Run Biome formatter, lint, and assist checks |
| `bun run build` | Build the production app |
| `bun run lint` | Run Biome lint rules |
| `bun run lint:fix` | Apply safe Biome lint fixes |
| `bun run format` | Format scoped files with Biome |
| `bun run preview` | Preview the production build with `--host` |
| `bun run test:e2e` | Run Playwright E2E tests in desktop and mobile Chromium |

Recommended verification before finishing changes:

1. `bun run check:biome`
2. `bun run check`
3. `bun run build`
4. `bun run test:e2e` when you change user flows, selectors, forms, navigation, or other browser behavior

There is currently no CI workflow in this repo. Formatting and linting are handled with Biome, and browser E2E coverage is available through Playwright.

## How It Works

The storefront data flow is:

`Svelte component -> apiFetch() -> /api/* -> MSW handler -> Dexie operation -> IndexedDB`

Important details:

- `src/lib/api/client.ts` waits for `ensureClientAppReady()` before making requests.
- `src/lib/runtime/bootstrap.ts` opens the database and starts the MSW worker in the browser.
- Storefront endpoints live in `src/mocks/handlers/*.ts`, not Astro server routes.
- Shared MSW helpers for JSON body parsing and error responses live in `src/mocks/handlers/shared.ts`.
- `public/robots.txt` is a static asset.
- Navigation is plain links and `window.location.assign(...)`; there is no client router.

## App Structure

- `src/pages`: Astro routes
- `src/layouts`: shared page/layout shell
- `src/components/svelte`: hydrated interactive UI
- `src/components/server`: Astro-only display components
- `src/lib/db`: Dexie schema, seeding, and data operations
- `src/mocks`: MSW browser setup and request handlers
- `src/styles/global.css`: Tailwind 4 entrypoint, theme tokens, and shared utilities
- `public/`: static assets such as branding, product images, and the generated MSW worker

## Routes

- `/`: storefront homepage
- `/about`: app overview and library/architecture snapshot
- `/products/[slug]`: static product detail pages generated from seeded products
- `/login`: login flow
- `/register`: registration flow
- `/register/verify`: OTP verification flow
- `/cart`: cart
- `/checkout`: cart checkout or instant checkout
- `/history`: purchase history
- `/settings`: local database reset and profile snapshot
- `/robots.txt`: static robots file

## Seeded Demo State

The app seeds local IndexedDB data on first run.

- 16 products
- 1 seeded customer account

Demo login:

- Email: `customer@gghgh.dev`
- Password: `password123`

Registration OTP is always:

- `123456`

## Persistence And Reset

- IndexedDB database name: `shopedia-demo-db`
- Seed/reset logic lives in `src/lib/db/init.ts`
- If you change seeded data in `src/lib/db/seed.ts`, bump `SEED_VERSION` or existing browsers will keep older local data
- If you change the Dexie schema or indexes in `src/lib/db/app-db.ts`, update `this.version(...)`
- Users can reset the app from `/settings`, which clears local state and reseeds the default catalog and seeded account

## Checkout And Auth Rules

- Guest carts are supported and persist locally
- Logging in or completing registration merges the guest cart into the user cart
- Checkout requires a signed-in user
- Payment method is cash only
- Shipping address entered during checkout is written back to the stored user profile

## SEO And Rendering

- Site URL is `https://tst-ui-playground.gghgh.dev`
- Sitemap generation is enabled through `@astrojs/sitemap`
- `src/layouts/BaseLayout.astro` owns canonical, OG, Twitter, and JSON-LD metadata
- Auth/account/utility pages use `noindex`
- These same paths are excluded from the sitemap in `astro.config.mjs`
- App now builds as static output and can be hosted on static platforms such as Cloudflare Pages
- Query-driven pages like `/search`, `/checkout`, and `/register/verify` read URL params in hydrated client components instead of Astro SSR

## Styling Notes

- Tailwind 4 is configured through `@tailwindcss/vite`
- There is no `tailwind.config.*` file
- Shared utilities such as `.page-shell` and `.surface-panel` live in `src/styles/global.css`
- Storefront images are local assets under `public/images/...`

## Automation Notes

- The app is intentionally built for UI automation practice
- Existing `data-testid` attributes are part of that contract and should be preserved when possible
- Keep accessible names distinct where possible so role-based automation locators stay stable
- `public/mockServiceWorker.js`, `.astro/`, and `dist/` are generated artifacts
