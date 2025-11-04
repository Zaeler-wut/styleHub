import { type Category } from "../types/category";

const KEY = "categories_v1";

export function loadCategories(fallback: Category[] = []): Category[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : fallback;
  } catch {
    return fallback;
  }
}

export function saveCategories(items: Category[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}
