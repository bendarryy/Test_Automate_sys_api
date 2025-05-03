// useSupermarketInventory.ts
import { useApi } from './useApi';
import { Product } from '../types';

export const useSupermarketInventory = (systemId: string) => {
  const api = useApi<Product[] | Product>();

  const getProducts = () => {
    return api.callApi('get', `/supermarket/${systemId}/products/`);
  };

  const createProduct = (productData: Omit<Product, 'id'>) => {
    return api.callApi('post', `/supermarket/${systemId}/products/`, productData);
  };

  const getExpiringSoonProducts = () => {
    return api.callApi('get', `/supermarket/${systemId}/products/expiring-soon/`);
  };

  const getLowStockProducts = () => {
    return api.callApi('get', `/supermarket/${systemId}/products/low-stock/`);
  };

  const getStockHistory = () => {
    return api.callApi('get', `/supermarket/${systemId}/products/stock-history/`);
  };

  const getProductById = (id: string) => {
    return api.callApi('get', `/supermarket/${systemId}/products/${id}/`);
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    return api.callApi('put', `/supermarket/${systemId}/products/${id}/`, productData);
  };

  const patchProduct = (id: string, productData: Partial<Product>) => {
    return api.callApi('patch', `/supermarket/${systemId}/products/${id}/`, productData);
  };

  const deleteProduct = (id: string) => {
    return api.callApi('delete', `/supermarket/${systemId}/products/${id}/`);
  };

  return {
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
  };
};
