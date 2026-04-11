import { expect, type Page, test } from '@playwright/test';

async function waitForCatalogPage(page: Page, expectedCount: number) {
  await expect(
    page.locator('[data-testid="product-grid-loading"]'),
  ).toHaveCount(0, { timeout: 15000 });
  await expect(page.locator('[data-testid^="product-card-"]')).toHaveCount(
    expectedCount,
    { timeout: 15000 },
  );
}

async function addProductToCart(
  page: Page,
  productId: string,
  message: string,
) {
  const addToCartButton = page.getByTestId(`add-to-cart-${productId}`);
  await addToCartButton.scrollIntoViewIfNeeded();
  await addToCartButton.click();
  await expect(
    page.getByTestId('app-toast').filter({ hasText: message }),
  ).toBeVisible({ timeout: 10000 });
}

async function runSiteSearch(page: Page, query: string) {
  await page.getByTestId('site-search').fill(query);
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page).toHaveURL(/\/search\?q=/);
  await expect
    .poll(() => new URL(page.url()).searchParams.get('q'))
    .toBe(query);
}

async function fillPriceInputAndBlur(
  page: Page,
  testId: string,
  value: string,
) {
  const input = page.getByTestId(testId);
  await input.fill(value);
  await input.blur();
}

async function loginWithSeededUser(page: Page) {
  await page.getByTestId('login-button').click();
  await expect(page).toHaveURL(/\/login/);
  await page.getByTestId('login-email').fill('customer@gghgh.dev');
  await page.getByTestId('login-password').fill('password123');
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL('http://127.0.0.1:4321/');
}

async function openRegisterPage(page: Page) {
  await page.getByTestId('register-button').click();
  await expect(page).toHaveURL(/\/register/);
}

async function expectInstantCheckoutUrl(page: Page, productId: string) {
  await expect(page).toHaveURL(
    new RegExp(`/checkout\\?mode=instant&productId=${productId}&qty=1$`),
  );
}

test.describe('storefront checkout flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows about page overview and libraries tabs', async ({ page }) => {
    await expect(page.getByTestId('footer-about-link')).toHaveAttribute(
      'href',
      '/about',
    );

    await page.getByTestId('footer-about-link').click();
    await expect(page).toHaveURL('http://127.0.0.1:4321/about');
    await expect(page.getByTestId('about-tab-overview')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.getByTestId('about-panel-overview')).toBeVisible();
    await expect(page.getByText('What this app is about')).toBeVisible();

    await page.getByTestId('about-tab-libraries').click();
    await expect(page).toHaveURL('http://127.0.0.1:4321/about?tab=libraries');
    await expect(page.getByTestId('about-tab-libraries')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.getByTestId('about-panel-libraries')).toBeVisible();
    await expect(
      page.getByTestId('about-panel-libraries').getByText('dexie', {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page
        .getByTestId('about-panel-libraries')
        .getByText('@playwright/test', { exact: true }),
    ).toBeVisible();
  });

  test('loads paginated catalog and completes checkout', async ({
    page,
    isMobile,
  }) => {
    await waitForCatalogPage(page, 8);
    await expect(page.getByText('Showing 8 of 16 products')).toBeVisible();

    if (isMobile) {
      await expect(
        page.getByRole('link', { name: 'Browse catalog' }),
      ).toBeVisible();
    }

    await loginWithSeededUser(page);

    await waitForCatalogPage(page, 8);
    await addProductToCart(
      page,
      'p-skyline-brew-kettle',
      'Skyline Brew Kettle added to cart.',
    );

    await page.getByTestId('product-grid-sentinel').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-testid^="product-card-"]')).toHaveCount(
      16,
      { timeout: 15000 },
    );
    await expect(page.getByText('Showing 16 of 16 products')).toBeVisible();

    await addProductToCart(
      page,
      'p-trailsip-insulated-bottle',
      'TrailSip Insulated Bottle added to cart.',
    );

    await expect(page.getByTestId('cart-link')).toContainText('2');
    await page.getByTestId('cart-link').click();
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.getByText('Skyline Brew Kettle')).toBeVisible();
    await expect(page.getByText('TrailSip Insulated Bottle')).toBeVisible();

    await page.getByRole('link', { name: 'Proceed to cash checkout' }).click();
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.getByText('Cash checkout')).toBeVisible();
    await expect(page.getByText('Skyline Brew Kettle')).toBeVisible();
    await expect(page.getByText('TrailSip Insulated Bottle')).toBeVisible();

    await page.getByTestId('checkout-submit').click();
    await expect(page).toHaveURL(/\/history\?highlight=/);
    await expect(page.getByText('Skyline Brew Kettle')).toBeVisible();
    await expect(page.getByText('TrailSip Insulated Bottle')).toBeVisible();
    await expect(
      page.evaluate(() => {
        const root = document.documentElement;
        return root.scrollWidth <= root.clientWidth + 1;
      }),
    ).resolves.toBe(true);
  });

  test('search page matches product names', async ({ page }) => {
    await waitForCatalogPage(page, 8);
    await runSiteSearch(page, 'kettle');

    await expect(page.getByTestId('search-results-page')).toBeVisible();
    await expect(page.getByText('Results for “kettle”')).toBeVisible();
    await waitForCatalogPage(page, 1);
    await expect(
      page.getByTestId('product-card-p-skyline-brew-kettle'),
    ).toBeVisible();
    await expect(
      page.getByTestId('product-card-p-nimbus-wireless-headphones'),
    ).toHaveCount(0);
  });

  test('search page matches shop names and narrows with price inputs', async ({
    page,
  }) => {
    await waitForCatalogPage(page, 8);
    await runSiteSearch(page, 'north');

    await expect(page.getByTestId('search-filter-sidebar')).toBeVisible();
    await waitForCatalogPage(page, 2);
    await expect(
      page.getByTestId('product-card-p-skyline-brew-kettle'),
    ).toBeVisible();
    await expect(
      page.getByTestId('product-card-p-lumen-clip-reading-light'),
    ).toBeVisible();

    await fillPriceInputAndBlur(page, 'price-filter-max', '500000');

    await expect(page).toHaveURL(/maxPrice=500000/);
    await expect(page.getByTestId('price-filter-max')).toHaveValue('500.000');
    await waitForCatalogPage(page, 1);
    await expect(
      page.getByTestId('product-card-p-lumen-clip-reading-light'),
    ).toBeVisible();
    await expect(
      page.getByTestId('product-card-p-skyline-brew-kettle'),
    ).toHaveCount(0);
  });

  test('shows clear submit-time registration validation errors', async ({
    page,
  }) => {
    await openRegisterPage(page);

    await page.getByLabel('Full name').fill('Alex Example');
    await page.getByLabel('Nickname').fill('ab$');
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Password', { exact: true }).fill('short');
    await page.getByLabel('Confirm password').fill('different-pass');

    await page.getByTestId('register-submit').click();

    await expect(
      page.getByText(
        'Nickname must be at least 5 characters and can only use letters, numbers, ., -, _, or #.',
      ),
    ).toBeVisible();
    await expect(
      page.getByText('Enter a valid email address, like name@example.com.'),
    ).toBeVisible();
    await expect(
      page.getByText('Password must be at least 12 characters long.'),
    ).toBeVisible();
    await expect(
      page.getByText('Password confirmation does not match.'),
    ).toBeVisible();
    await expect(page).toHaveURL('http://127.0.0.1:4321/register');
  });

  test('valid registration continues to otp verification', async ({ page }) => {
    await openRegisterPage(page);

    await page.getByLabel('Full name').fill('Alex Example');
    await page.getByLabel('Nickname').fill('alex_01');
    await page.getByLabel('Email').fill('alex@example.com');
    await page.getByLabel('Password', { exact: true }).fill('supersecure12');
    await page.getByLabel('Confirm password').fill('supersecure12');

    await page.getByTestId('register-submit').click();

    await expect(page).toHaveURL(
      'http://127.0.0.1:4321/register/verify?email=alex%40example.com',
    );
    await expect(
      page.getByText('Verifying account for', { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByTestId('otp-form').getByText('alex@example.com'),
    ).toBeVisible();
  });

  test('cash order submits on first click when checkout appears', async ({
    page,
  }) => {
    await loginWithSeededUser(page);

    await page.goto(
      'http://127.0.0.1:4321/checkout?mode=instant&productId=p-glowdock-wireless-charger&qty=1',
    );

    await expect(page.getByTestId('checkout-submit')).toBeVisible();
    await page.getByTestId('checkout-submit').click();

    await expect(page).toHaveURL(/\/history\?highlight=/);
    await expect(page.getByText('GlowDock Wireless Charger')).toBeVisible();
  });

  test('cash order still submits when crypto.randomUUID is unavailable', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(globalThis.crypto, 'randomUUID', {
        value: undefined,
        configurable: true,
      });
    });

    await page.goto('http://127.0.0.1:4321/login');
    await page.getByTestId('login-email').fill('customer@gghgh.dev');
    await page.getByTestId('login-password').fill('password123');
    await page.getByTestId('login-submit').click();
    await page.waitForURL('http://127.0.0.1:4321/');

    await page.goto(
      'http://127.0.0.1:4321/checkout?mode=instant&productId=p-orbit-note-stand&qty=1',
    );

    await expect(page.getByTestId('checkout-submit')).toBeVisible();
    await page.getByTestId('checkout-submit').click();

    await expect(page).toHaveURL(/\/history\?highlight=/);
    await expect(page.getByText('Orbit Note Stand')).toBeVisible();
    await expect(
      page.getByText('crypto.randomUUID is not a function'),
    ).toHaveCount(0);
  });

  test('instant buy from product card opens one-item checkout', async ({
    page,
  }) => {
    await waitForCatalogPage(page, 8);
    await loginWithSeededUser(page);
    await waitForCatalogPage(page, 8);

    await page.getByTestId('buy-now-p-skyline-brew-kettle').click();

    await expectInstantCheckoutUrl(page, 'p-skyline-brew-kettle');
    await expect(page.getByText('Cash checkout')).toBeVisible();
    await expect(page.getByText('Skyline Brew Kettle')).toBeVisible();
    await expect(page.getByText('Your cart is empty')).toHaveCount(0);
    await expect(page.getByText('Qty 1')).toBeVisible();
  });

  test('instant buy from product detail opens one-item checkout', async ({
    page,
  }) => {
    await waitForCatalogPage(page, 8);
    await loginWithSeededUser(page);
    await waitForCatalogPage(page, 8);

    await page.getByTestId('view-product-p-skyline-brew-kettle').click();
    await expect(page).toHaveURL(/\/products\/skyline-brew-kettle/);

    await page.getByTestId('detail-buy-now-p-skyline-brew-kettle').click();

    await expectInstantCheckoutUrl(page, 'p-skyline-brew-kettle');
    await expect(page.getByText('Cash checkout')).toBeVisible();
    await expect(page.getByText('Skyline Brew Kettle')).toBeVisible();
    await expect(page.getByText('Your cart is empty')).toHaveCount(0);
    await expect(page.getByText('Qty 1')).toBeVisible();
  });

  test('instant buy while logged out shows login-required checkout', async ({
    page,
  }) => {
    await waitForCatalogPage(page, 8);

    await page.getByTestId('buy-now-p-skyline-brew-kettle').click();

    await expectInstantCheckoutUrl(page, 'p-skyline-brew-kettle');
    await expect(page.getByText('Login required for checkout')).toBeVisible();
  });
});
