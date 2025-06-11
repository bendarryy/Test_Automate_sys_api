import { useApi } from '../../../../../shared/hooks/useApi';

export function useDeleteProduct(systemId: string) {
  const { loading, error, callApi } = useApi();

  const deleteProduct = async (productId: number) => {
    await callApi('delete', `/supermarket/${systemId}/products/${productId}/`);
  };

  return { deleteProduct, loading, error };
}
