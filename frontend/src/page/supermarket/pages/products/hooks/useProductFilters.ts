import { useState } from 'react';
import { ProductFilter } from './useProducts';

export function useProductFilters() {
  const [filter, setFilter] = useState<ProductFilter>('all');
  return { filter, setFilter };
}
