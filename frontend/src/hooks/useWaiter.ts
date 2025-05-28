import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApi } from './useApi';

// Types for order and table, matching the API
export interface WaiterOrderItem {
  id: number;
  menu_item: number;
  menu_item_name: string;
  quantity: number;
}

export interface WaiterOrder {
  id: number;
  system: number;
  customer_name: string;
  table_number: string;
  waiter: number | null;
  total_price: string;
  profit: number;
  status: string;
  order_type: string;
  order_items: WaiterOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface WaiterTableStatus {
  status: string;
  current_order?: {
    id: number;
    customer_name: string;
    status: string;
  };
}
export type WaiterTablesMap = Record<string, WaiterTableStatus>;

export function useWaiter(systemId: string | number) {
  const { callApi } = useApi();

  // Orders state
  const [orders, setOrders] = useState<WaiterOrder[]>([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Tables state
  const [tables, setTables] = useState<WaiterTablesMap>({});
  const [tablesLoading, setTablesLoading] = useState(false);
  const [tablesError, setTablesError] = useState<string | null>(null);

  // Fetch all orders
  const fetchOrders = useCallback(async () => {
    setOrderLoading(true);
    setOrderError(null);
    try {
      const data = await callApi('get', `/restaurant/${systemId}/waiter/orders/`);
      setOrders(data || []);
      throw new Error('Failed to fetch orders');
    } catch (err) {
      setOrderError(err as string);
      setOrders([]);
    } finally {
      setOrderLoading(false);
    }
  }, [ systemId]);

  // Fetch all tables
  const fetchTables = useCallback(async () => {
    setTablesLoading(true);
    setTablesError(null);
    try {
      const data = await callApi('get', `/restaurant/${systemId}/waiter/orders/tables/`);
      setTables(data || {});
    } catch (err) {
      setTablesError(err as string);
      setTables({});
    } finally {
      setTablesLoading(false);
    }
  }, [ systemId]);

  // Fetch a single order instance
  const fetchOrder = useCallback(async (orderId: number | string) => {
    return callApi('get', `/restaurant/${systemId}/waiter/orders/${orderId}/`);
  }, [ systemId]);

  // Patch order status
  const patchOrderStatus = useCallback(
    async (orderId: number | string, status: string) => {
      const updated = await callApi('patch', `/restaurant/${systemId}/waiter/orders/${orderId}/`, { status });
      // Optionally update orders in state if present
      setOrders(prev => prev.map(o => (o.id === Number(orderId) ? { ...o, ...updated } : o)));
      return updated;
    },
    [callApi, systemId]
  );

  // Initial fetch
  useEffect(() => {
    fetchOrders();
    fetchTables();
    // Only on mount or systemId change
  }, [fetchOrders, fetchTables]);

  return useMemo(() => ({
    orders,
    tables,
    orderLoading,
    tablesLoading,
    orderError,
    tablesError,
    fetchOrders,
    fetchTables,
    fetchOrder,
    patchOrderStatus,
  }), [orders, tables, orderLoading, tablesLoading, orderError, tablesError, fetchOrders, fetchTables, fetchOrder, patchOrderStatus]);
}
