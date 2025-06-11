import { useEffect } from 'react';
import { Product } from '../types/product';
import { useApi } from 'shared/hooks/useApi';

export type ProductFilter = 'all' | 'low-stock' | 'expiring-soon' | 'expired';

export function useProducts(systemId: string, filter: ProductFilter = 'all') {
  const { data, loading, error, callApi } = useApi<Product[]>();

  useEffect(() => {
    let url = `/supermarket/${systemId}/products/`;
    if (filter === 'low-stock') url += 'low-stock/';
    else if (filter === 'expiring-soon') url += 'expiring-soon/';
    else if (filter === 'expired') url += 'expired/';
    callApi('get', url);
    // eslint-disable-next-line
  }, [systemId, filter]);

  return { products: data || [], loading, error };
}
