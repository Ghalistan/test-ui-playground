import type { Product, ProductListResponse } from '../types';
import { db } from './app-db';
import { matchesProductSearch } from './seed';

export async function listProducts(
  search = '',
  offset = 0,
  limit = 8,
  minPrice?: number | null,
  maxPrice?: number | null,
): Promise<ProductListResponse> {
  const products = await db.products.toArray();

  const safeOffset = Number.isFinite(offset)
    ? Math.max(0, Math.floor(offset))
    : 0;
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.floor(limit)) : 8;
  const safeMinPrice =
    typeof minPrice === 'number' && Number.isFinite(minPrice)
      ? Math.max(0, Math.floor(minPrice))
      : null;
  const safeMaxPrice =
    typeof maxPrice === 'number' && Number.isFinite(maxPrice)
      ? Math.max(0, Math.floor(maxPrice))
      : null;

  const searchMatchingProducts = products
    .filter((product) => matchesProductSearch(product, search))
    .sort((left, right) => {
      if (left.featured !== right.featured) {
        return Number(right.featured) - Number(left.featured);
      }

      return left.name.localeCompare(right.name);
    });

  const availableMinPrice = searchMatchingProducts.length
    ? searchMatchingProducts.reduce(
        (lowestPrice, product) => Math.min(lowestPrice, product.price),
        Number.POSITIVE_INFINITY,
      )
    : null;
  const availableMaxPrice = searchMatchingProducts.length
    ? searchMatchingProducts.reduce(
        (highestPrice, product) => Math.max(highestPrice, product.price),
        0,
      )
    : null;

  let normalizedMinPrice = safeMinPrice;
  let normalizedMaxPrice = safeMaxPrice;

  if (
    normalizedMinPrice !== null &&
    normalizedMaxPrice !== null &&
    normalizedMinPrice > normalizedMaxPrice
  ) {
    [normalizedMinPrice, normalizedMaxPrice] = [
      normalizedMaxPrice,
      normalizedMinPrice,
    ];
  }

  const matchingProducts = searchMatchingProducts.filter((product) => {
    if (normalizedMinPrice !== null && product.price < normalizedMinPrice) {
      return false;
    }

    if (normalizedMaxPrice !== null && product.price > normalizedMaxPrice) {
      return false;
    }

    return true;
  });

  const items = matchingProducts.slice(safeOffset, safeOffset + safeLimit);

  return {
    items,
    total: matchingProducts.length,
    offset: safeOffset,
    limit: safeLimit,
    hasMore: safeOffset + items.length < matchingProducts.length,
    availableMinPrice,
    availableMaxPrice,
  };
}

export async function getProductById(productId: string): Promise<Product> {
  const product = await db.products.get(productId);

  if (!product) {
    throw new Error('Product not found.');
  }

  return product;
}
