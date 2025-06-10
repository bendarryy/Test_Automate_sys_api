import { useCallback, useMemo } from 'react';
import { useApi } from '../../../../../shared/hooks/useApi';

export interface InventoryItem {
  id: number;
  name: string;
  quantity: number | null;
  unit: string;
  min_threshold: number | null;
}

interface UseInventoryReturn {
  inventory: InventoryItem[] | null;
  loading: boolean;
  error: string | null;
  fetchInventory: (systemId: string) => Promise<InventoryItem[]>;
  addInventoryItem: (systemId: string, item: Omit<InventoryItem, 'id'>) => Promise<InventoryItem>;
  getInventoryItem: (systemId: string, itemId: string | number) => Promise<InventoryItem>;
  updateInventoryItem: (systemId: string, itemId: string | number, item: Partial<InventoryItem>) => Promise<InventoryItem>;
  deleteInventoryItem: (systemId: string, itemId: string | number) => Promise<void>;
}

export const useInventory = (): UseInventoryReturn => {
  const { data, loading, error, callApi, clearCache } = useApi<InventoryItem[] | InventoryItem | null>();

  const fetchInventory = useCallback(async (systemId: string) => {
    try {
      const result = await callApi('get', `/restaurant/${systemId}/inventory/`);
      return result as InventoryItem[];
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  }, [callApi]);

  const addInventoryItem = useCallback(async (systemId: string, item: Omit<InventoryItem, 'id'>) => {
    try {
      const result = await callApi('post', `/restaurant/${systemId}/inventory/`, item);
      // Clear inventory cache after adding new item
      clearCache(`/restaurant/${systemId}/inventory/`);
      return result as InventoryItem;
    } catch (error) {
      console.error('Error adding inventory item:', error);
      throw error;
    }
  }, [callApi, clearCache]);

  const getInventoryItem = useCallback(async (systemId: string, itemId: string | number) => {
    try {
      const result = await callApi('get', `/restaurant/${systemId}/inventory/${itemId}/`);
      return result as InventoryItem;
    } catch (error) {
      console.error('Error getting inventory item:', error);
      throw error;
    }
  }, [callApi]);

  const updateInventoryItem = useCallback(async (systemId: string, itemId: string | number, item: Partial<InventoryItem>) => {
    try {
      const result = await callApi('patch', `/restaurant/${systemId}/inventory/${itemId}/`, item);
      // Clear both item and list caches
      clearCache(`/restaurant/${systemId}/inventory/${itemId}/`);
      clearCache(`/restaurant/${systemId}/inventory/`);
      return result as InventoryItem;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  }, [callApi, clearCache]);

  const deleteInventoryItem = useCallback(async (systemId: string, itemId: string | number) => {
    try {
      await callApi('delete', `/restaurant/${systemId}/inventory/${itemId}/`);
      // Clear both item and list caches
      clearCache(`/restaurant/${systemId}/inventory/${itemId}/`);
      clearCache(`/restaurant/${systemId}/inventory/`);
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  }, [callApi, clearCache]);

  return useMemo(() => ({
    inventory: Array.isArray(data) ? (data as InventoryItem[]) : null,
    loading,
    error,
    fetchInventory,
    addInventoryItem,
    getInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
  }), [
    data,
    loading,
    error,
    fetchInventory,
    addInventoryItem,
    getInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
  ]);
};
