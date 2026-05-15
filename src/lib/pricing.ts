export function parseOptionalPrice(value: string | null) {
  if (!value) {
    return null;
  }

  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export function formatPriceInput(value: number | null) {
  if (value === null || value <= 0) {
    return '';
  }

  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function sanitizePriceInput(value: string) {
  const digitsOnly = value.replace(/\D/g, '');
  const normalizedDigits = digitsOnly.replace(/^0+(?=\d)/, '');

  if (!normalizedDigits) {
    return '';
  }

  return normalizedDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parsePositiveInteger(value: string) {
  const digitsOnly = value.replace(/\D/g, '');

  if (!digitsOnly) {
    return null;
  }

  const parsedValue = Number.parseInt(digitsOnly, 10);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
}
