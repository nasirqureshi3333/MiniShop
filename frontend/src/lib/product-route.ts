export const PRODUCT_PATH = "/product";

export function productHref(productId: number): string {
  return `${PRODUCT_PATH}?id=${productId}`;
}

export function parseProductId(value: string | null): number | null {
  if (value === null || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}
