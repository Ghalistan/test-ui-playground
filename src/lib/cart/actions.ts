import { apiFetch } from '../api/client';
import { refreshCartCount, showToast } from '../stores/app';

export async function addToCart(productId: string, productName: string) {
  await apiFetch('/api/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity: 1 }),
  });

  await refreshCartCount();
  showToast(`${productName} added to cart.`);
}
