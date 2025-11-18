export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  storeLink?: string;
  description?: string;
  authentic?: boolean;
  images: string[];
  isFavorite?: boolean;
}
