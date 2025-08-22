// Re-export types from store for consistency
export type { ModelData, ModelFilters, ModelSorting } from '~/stores/models-store';

export interface ModelRegistryProps {
  onModelSelect?: (modelId: string) => void;
  selectedModelId?: string;
  searchQuery?: string;
  typeFilter?: string;
  className?: string;
  externalPagination?: boolean;
  onPaginationChange?: (pagination: { page: number; total: number; totalPages: number }) => void;
}

export interface ModelPaletteProps {
  className?: string;
  variant?: 'minimal' | 'expanded';
  onModelSelect?: (modelId: string) => void;
  selectedModelId?: string;
}

export interface ModelTableColumn {
  key: string;
  label: string;
  sortable: boolean;
}
