# AGENTS.md

## Trust These Sources
- `README.md` is maintained and should match current app behavior at a high level.
- For exact implementation details, trust `package.json`, `astro.config.mjs`, `src/`, and current tests over prose docs.

## Commands
- Use Bun for installs and scripts: `bun install`, `bun run dev`, `bun run check`, `bun run check:biome`, `bun run lint`, `bun run lint:fix`, `bun run format`, `bun run build`, `bun run preview`, `bun run test:e2e`.
- `package.json` requires Node `>=22.12.0`.
- There is no CI workflow or pre-commit config in this repo right now. Normal verification is `bun run check:biome`, `bun run check`, then `bun run build`. Add `bun run test:e2e` when you touch user flows, selectors, navigation, forms, or browser-only behavior.

## App Shape
- This is a single Astro app with Svelte islands. Pages are in `src/pages`, shared shell/layouts in `src/layouts`, interactive UI in `src/components/svelte`.
- Storefront data flow is intentional: Svelte -> `apiFetch()` -> `/api/*` -> MSW handlers in `src/mocks/handlers` -> Dexie operations in `src/lib/db/operations.ts` -> IndexedDB.
- There are no real `/api/*` Astro routes. Keep storefront endpoints in MSW + Dexie unless you are intentionally changing the architecture.
- `apiFetch()` waits for `ensureClientAppReady()`, which opens Dexie and starts the MSW worker. Use it from hydrated client components instead of raw `fetch('/api/...')`.
- Shared MSW request helpers live in `src/mocks/handlers/shared.ts`; reuse them instead of duplicating JSON body parsing or error response helpers in each handler.
- Navigation is plain links and `window.location.assign(...)`; there is no client router.

## State And Seed Gotchas
- IndexedDB database name is `shopedia-demo-db` in `src/lib/db/app-db.ts`.
- Seed/reset logic lives in `src/lib/db/init.ts`; existing browsers only reseed when `SEED_VERSION` in `src/lib/db/seed.ts` changes or the user resets the database.
- If you change seeded products, accounts, or other default data, bump `SEED_VERSION` or existing IndexedDB state will hide your change.
- If you change Dexie schema or indexes, update `this.version(...)` in `src/lib/db/app-db.ts`.
- Fast manual smoke-test credentials: seeded login `customer@gghgh.dev` / `password123`; registration OTP is always `123456`.
- `User.role` already supports `'admin'`, but there are no admin routes or handlers yet.
- Product detail pages are build-time static: `src/pages/products/[slug].astro` uses `getStaticPaths()` from `seedProducts`. Runtime-only products will not get pages.
- Header session/cart state is centralized in `src/lib/stores/app.ts`; after auth, cart, checkout, or reset mutations, refresh it with `syncChromeState()`, `refreshCartCount()`, or `refreshSession()`.

## SEO And Rendering
- `src/layouts/BaseLayout.astro` owns canonical, OG, Twitter, and JSON-LD tags and also bootstraps the client app.
- Account and utility pages use `<StoreLayout ... noindex />`. If you add another non-indexed page, also add its pathname to `excludedPaths` in `astro.config.mjs` or it will still appear in the sitemap.
- Site now builds as static output. Query-driven pages like search, checkout, and OTP verification read URL params on hydrated client components instead of Astro SSR.
- Auth, cart, checkout, and orders remain client-side via IndexedDB.

## Styling And Assets
- Tailwind 4 is configured through the Vite plugin plus `src/styles/global.css`; there is no `tailwind.config.*` file.
- Theme tokens and shared shell utilities such as `.page-shell` and `.surface-panel` live in `src/styles/global.css`.
- Keep storefront images as local assets under `public/`.
- `src/mocks/browser.ts` hardcodes the service worker URL as `/mockServiceWorker.js`; if that file moves, update the startup config too.

## Automation Conventions
- This repo is built for UI automation practice. Preserve existing `data-testid` patterns and add selectors for new interactive flows when they materially help automation.
- Accessible names matter for automation too. Avoid naming collisions that make role-based locators ambiguous.
- Treat `.astro/`, `dist/`, and `public/mockServiceWorker.js` as generated artifacts.
