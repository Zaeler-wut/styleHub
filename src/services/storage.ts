import { type Product } from "../types/product";

const KEY = "products_v1";

export function loadProducts(fallback: Product[] = []): Product[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : fallback;
  } catch {
    return fallback;
  }
}

export function saveProducts(items: Product[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}