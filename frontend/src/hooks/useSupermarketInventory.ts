// useSupermarketInventory.ts
import { useCallback, useMemo } from 'react';
import { useApi } from './useApi';

interface Product {
    id: number;
    name: string;
    price: number;
    stock_quantity: number;
    expiry_date: string;
}

export const useSupermarketInventory = (systemId: string) => {
  const api = useApi<Product[] | Product>();

  const getProducts = useCallback(async () => {
    try {
      return await api.callApi('get', `/supermarket/${systemId}/products/`);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }, [systemId, api]);

  const createProduct = useCallback(async (productData: Omit<Product, 'id'>) => {
    try {
      const result = await api.callApi('post', `/supermarket/${systemId}/products/`, productData);
      api.clearCache(`/supermarket/${systemId}/products/`);
      return result;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }, [systemId, api]);

  const getExpiringSoonProducts = useCallback(async () => {
    try {
      return await api.callApi('get', `/supermarket/${systemId}/products/expiring-soon/`);
    } catch (error) {
      console.error('Error fetching expiring soon products:', error);
      throw error;
    }
  }, [systemId, api]);

  const getLowStockProducts = useCallback(async () => {
    try {
      return await api.callApi('get', `/supermarket/${systemId}/products/low-stock/`);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  }, [systemId, api]);

  const getStockHistory = useCallback(async () => {
    try {
      return await api.callApi('get', `/supermarket/${systemId}/products/stock-history/`);
    } catch (error) {
      console.error('Error fetching stock history:', error);
      throw error;
    }
  }, [systemId, api]);

  const getProductById = useCallback(async (id: string) => {
    try {
      return await api.callApi('get', `/supermarket/${systemId}/products/${id}/`);
    } catch (error) {
      console.error('Error fetching product by id:', error);
      throw error;
    }
  }, [systemId, api]);

  const updateProduct = useCallback(async (id: string, productData: Partial<Product>) => {
    try {
      const result = await api.callApi('put', `/supermarket/${systemId}/products/${id}/`, productData);
      api.clearCache(`/supermarket/${systemId}/products/${id}/`);
      api.clearCache(`/supermarket/${systemId}/products/`);
      return result;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }, [systemId, api]);

  const patchProduct = useCallback(async (id: string, productData: Partial<Product>) => {
    try {
      const result = await api.callApi('patch', `/supermarket/${systemId}/products/${id}/`, productData);
      api.clearCache(`/supermarket/${systemId}/products/${id}/`);
      api.clearCache(`/supermarket/${systemId}/products/`);
      return result;
    } catch (error) {
      console.error('Error patching product:', error);
      throw error;
    }
  }, [systemId, api]);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await api.callApi('delete', `/supermarket/${systemId}/products/${id}/`);
      api.clearCache(`/supermarket/${systemId}/products/${id}/`);
      api.clearCache(`/supermarket/${systemId}/products/`);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }, [systemId, api]);

  return useMemo(() => ({
    ...api,
    getProducts,
    createProduct,
    getExpiringSoonProducts,
    getLowStockProducts,
    getStockHistory,
    getProductById,
    updateProduct,
    patchProduct,
    deleteProduct,
  }), [
    api,
    getProducts,
    createProduct,
    getExpiringSoonProducts,
    getLowStockProducts,
    getStockHistory,
    getProductById,
    updateProduct,
    patchProduct,
    deleteProduct,
  ]);
};
