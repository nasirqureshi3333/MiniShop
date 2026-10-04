export type Language = "en" | "ar";

export type SortOrder = "asc" | "desc";

export interface Category {
  slug: string;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  stock: number;
  in_stock: boolean;
}

export interface ListResponse<T> {
  total: number;
  items: T[];
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOrder;
}

export interface ApiErrorDetail {
  field: string | null;
  location: string | null;
  message: string;
  type: string | null;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details: ApiErrorDetail[];
  };
}
