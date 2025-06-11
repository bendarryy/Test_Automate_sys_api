import { useCallback } from 'react';
import { useApi } from '../../../../../../shared/hooks/useApi';

export interface Supplier {
  id: number;
  name: string;
}

export const useSuppliers = (systemId: string) => {
  const { data, loading, error, callApi } = useApi<Supplier[]>();

  const fetchSuppliers = useCallback(() => {
    return callApi('get', `/supermarket/${systemId}/suppliers/`);
  }, [callApi, systemId]);

  return { data, loading, error, fetchSuppliers };
};
