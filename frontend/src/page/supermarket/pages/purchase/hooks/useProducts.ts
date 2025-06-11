import { useCallback } from 'react';
import { useApi } from '../../../../../../shared/hooks/useApi';

export interface Product {
  id: number;
  name: string;
}

export const useProducts = (systemId: string) => {
  const { data, loading, error, callApi } = useApi<Product[]>();

  const fetchProducts = useCallback(() => {
    return callApi('get', `/supermarket/${systemId}/products/`);
  }, [callApi, systemId]);

  return { data, loading, error, fetchProducts };
};
