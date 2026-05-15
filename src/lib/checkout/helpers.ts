export interface CheckoutParams {
  mode: 'cart' | 'instant';
  productId: string | null;
  quantity: number;
}

export function parseCheckoutParams(): CheckoutParams {
  if (typeof window === 'undefined') {
    return { mode: 'cart', productId: null, quantity: 1 };
  }

  const url = new URL(window.location.href);
  const mode = url.searchParams.get('mode') === 'instant' ? 'instant' : 'cart';
  const productId = url.searchParams.get('productId');
  const quantityParam = Number.parseInt(url.searchParams.get('qty') ?? '1', 10);
  const quantity = Number.isNaN(quantityParam) ? 1 : Math.max(1, quantityParam);

  return { mode, productId, quantity };
}

export function getCheckoutLoginTarget(
  mode: 'cart' | 'instant',
  productId: string | null,
  quantity: number,
) {
  if (mode === 'instant' && productId) {
    return `/login?next=${encodeURIComponent(`/checkout?mode=instant&productId=${productId}&qty=${quantity}`)}`;
  }

  return '/login?next=%2Fcheckout';
}
