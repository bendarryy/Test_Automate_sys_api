import { useApi } from 'shared/hooks/useApi';

export function useProductStock(systemId: string) {
  const { loading, error, callApi } = useApi();

  const updateStock = async (productId: number, stock_quantity: number) => {
    await callApi('patch', `/supermarket/${systemId}/products/${productId}/stock/`, { stock_quantity });
  };

  return { updateStock, loading, error };
}
