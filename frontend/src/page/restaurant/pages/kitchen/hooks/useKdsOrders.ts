import { useCallback, useState, useEffect } from 'react';
import { useApi } from 'shared/hooks/useApi';
import { KitchenOrder } from '../types/kitchenOrder';
import { sortOrders } from '../utils/kdsHelpers';

export function useKdsOrders(systemId: string) {
  const { loading, error, callApi, clearCache } = useApi<KitchenOrder[]>();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    if (systemId) {
      try {
        clearCache(`/restaurant/${systemId}/kitchen/orders/`);
        const data = await callApi('get', `/restaurant/${systemId}/kitchen/orders/`);
        if (data) {
          const filteredData = data.filter(order =>
            order.status === 'pending' || order.status === 'preparing'
          ) as KitchenOrder[];
          setOrders(sortOrders(filteredData));
        }
      } catch (error) {
        // handle error
        console.error('Failed to fetch orders:', error);
        setOrders([]);
      }
    }
  }, [systemId, callApi, clearCache]);

  // Fetch orders automatically on mount and when systemId changes
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (id: number, newStatus: 'preparing' | 'ready') => {
    if (!systemId) return;
    setUpdating(id);
    try {
      await callApi('patch', `/restaurant/${systemId}/kitchen/orders/${id}/`, { status: newStatus });
      setOrders(prevOrders => {
        const updatedOrders = prevOrders
          .map(order => order.id === id ? { ...order, status: newStatus } : order)
          .filter(order => order.status === 'pending' || order.status === 'preparing');
        return sortOrders(updatedOrders);
      });
    } catch (error) {
      // handle error
        console.error(`Failed to update order ${id} status:`, error);
    } finally {
      setUpdating(null);
    }
  };

  return { orders, loading, error, updating, fetchOrders, handleStatusUpdate };
}
