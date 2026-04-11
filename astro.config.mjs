// @ts-check

import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

const excludedPaths = new Set([
  '/login',
  '/register',
  '/register/verify',
  '/cart',
  '/checkout',
  '/history',
  '/settings',
  '/search',
]);

// https://astro.build/config
export default defineConfig({
  site: 'https://tst-ui-playground.gghgh.dev',
  output: 'static',
  trailingSlash: 'never',
  integrations: [
    svelte(),
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname.replace(/\/$/, '') || '/';
        return !excludedPaths.has(pathname);
      },
      serialize: (item) => {
        const pathname = new URL(item.url).pathname.replace(/\/$/, '') || '/';

        if (pathname === '/') {
          item.changefreq = ChangeFreqEnum.DAILY;
          item.priority = 1;
        }

        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        'lucide-svelte/icons/check',
        'lucide-svelte/icons/circle-alert',
        'lucide-svelte/icons/loader-circle',
        'lucide-svelte/icons/plus',
        'lucide-svelte/icons/shopping-cart',
        'lucide-svelte/icons/trash-2',
      ],
    },
    resolve: {
      noExternal: [/^lucide-svelte/],
    },
  },
});
