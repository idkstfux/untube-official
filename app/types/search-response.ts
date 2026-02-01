// app/types/search-response.ts
import { Video } from './video';

export interface SearchFilterOption {
  label: string;
  value: string; // misal: 'latest', 'most-viewed'
  isActive: boolean;
}

export interface SearchResponse {
  searchQuery: string;
  videos: Video[];
  currentPage: number;
  totalPages: number;
  nextPageUrl: string | null;
  prevPageUrl: string | null;
  filters: SearchFilterOption[];
}