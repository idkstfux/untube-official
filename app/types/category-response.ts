// app/types/category-response.ts
import { Video } from './video';

export interface FilterOption {
  label: string;
  url: string;
  isActive: boolean;
  slug: string; // misal: 'latest', 'most-viewed'
}

export interface CategoryResponse {
  categoryName: string;
  videos: Video[];
  currentPage: number;
  totalPages: number;
  nextPageUrl: string | null;
  prevPageUrl: string | null;
  filters: FilterOption[]; // Tambahan untuk dropdown
}