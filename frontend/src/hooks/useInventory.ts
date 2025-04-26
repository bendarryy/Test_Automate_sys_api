import { useCallback } from 'react';
import { useApi } from './useApi';

export interface InventoryItem {
  id?: number;
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
}

export const useInventory = (): UseInventoryReturn => {
  const { data, loading, error, callApi } = useApi<InventoryItem[] | InventoryItem | null>();

  const fetchInventory = useCallback(async (systemId: string) => {
    const result = await callApi('get', `/restaurant/${systemId}/inventory/`);
    return result as InventoryItem[];
  }, [callApi]);

  const addInventoryItem = useCallback(async (systemId: string, item: Omit<InventoryItem, 'id'>) => {
    const result = await callApi('post', `/restaurant/${systemId}/inventory/`, { data: item });
    return result as InventoryItem;
  }, [callApi]);

  return {
    inventory: Array.isArray(data) ? (data as InventoryItem[]) : null,
    loading,
    error,
    fetchInventory,
    addInventoryItem,
  };
};
