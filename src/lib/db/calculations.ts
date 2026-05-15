export function clampQuantity(
  added: number,
  existingQty: number,
  stock: number,
): number {
  return Math.min(existingQty + added, stock);
}

export function mergeGuestQuantity(
  guestQty: number,
  existingQty: number,
  stock: number,
): number {
  return Math.min(existingQty + guestQty, stock);
}

export function capQuantity(quantity: number, stock: number): number {
  return Math.min(quantity, stock);
}

export function calculateSubtotal(
  items: Array<{ price: number; quantity: number }>,
): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calculateItemCount(items: Array<{ quantity: number }>): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
