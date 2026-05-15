import { formatPriceInput, parseOptionalPrice } from './pricing';

export interface SearchParams {
  query: string;
  minPrice: number | null;
  maxPrice: number | null;
}

export function readSearchParams(): SearchParams {
  if (typeof window === 'undefined') {
    return { query: '', minPrice: null, maxPrice: null };
  }

  const url = new URL(window.location.href);
  return {
    query: url.searchParams.get('q') ?? '',
    minPrice: parseOptionalPrice(url.searchParams.get('minPrice')),
    maxPrice: parseOptionalPrice(url.searchParams.get('maxPrice')),
  };
}

export function syncSearchParamsToUrl(
  query: string,
  minPrice: number | null,
  maxPrice: number | null,
) {
  if (typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);

  if (query.trim()) {
    url.searchParams.set('q', query.trim());
  } else {
    url.searchParams.delete('q');
  }

  if (minPrice !== null) {
    url.searchParams.set('minPrice', String(minPrice));
  } else {
    url.searchParams.delete('minPrice');
  }

  if (maxPrice !== null) {
    url.searchParams.set('maxPrice', String(maxPrice));
  } else {
    url.searchParams.delete('maxPrice');
  }

  const nextSearch = url.searchParams.toString();
  const nextUrl = `${url.pathname}${nextSearch ? `?${nextSearch}` : ''}${url.hash}`;

  window.history.replaceState(window.history.state, '', nextUrl);
}

export function getSearchInputsFromParams(params: SearchParams) {
  return {
    query: params.query,
    minPriceInput: formatPriceInput(params.minPrice),
    maxPriceInput: formatPriceInput(params.maxPrice),
    committedMinPrice: params.minPrice,
    committedMaxPrice: params.maxPrice,
  };
}
