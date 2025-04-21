import { useState, useEffect, useCallback } from "react";
import { useApi } from "./useApi";

interface OrderItem {
  id: number;
  menu_item: number;
  menu_item_name: string;
  quantity: number;
}

interface Order {
  id: number;
  system: number;
  customer_name: string;
  table_number: string;
  waiter?: number | null;
  total_price: string;
  status: string;
  order_items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export const useOrders = (systemId: number) => {
  const { callApi, loading, error } = useApi();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("");

  // Fetch all orders
  const fetchOrders = useCallback(async () => {
    const response = await callApi("get", `/restaurant/${systemId}/orders/`);
    if (response) {
      setOrders(response);
      setFilteredOrders(response);
    }
  }, [systemId, callApi]);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders
  const handleFilter = (status: string) => {
    setFilter(status);
    if (status) {
      setFilteredOrders(orders.filter((order) => order.status === status));
    } else {
      setFilteredOrders(orders);
    }
  };

  // Sort orders (by date or price)
  const sortOrders = (key: keyof Order, order: "asc" | "desc") => {
    const sortedOrders = [...filteredOrders].sort((a, b) => {
      if (key === "created_at" || key === "total_price") {
        return order === "asc"
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      }
      return 0;
    });
    setFilteredOrders(sortedOrders);
  };

  // Update order status
  const updateOrderStatus = async (orderId: number, status: string) => {
    const response = await callApi("patch", `/restaurant/${systemId}/orders/${orderId}/`, { status });
    if (response) {
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status } : order))
      );
      setFilteredOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status } : order))
      );
    }
  };

  // Delete order
  const deleteOrder = async (orderId: number) => {
    const response = await callApi("delete", `/restaurant/${systemId}/orders/${orderId}/`);
    if (response) {
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      setFilteredOrders((prev) => prev.filter((order) => order.id !== orderId));
    }
  };

  return {
    orders: filteredOrders,
    loading,
    error,
    fetchOrders,
    handleFilter,
    sortOrders,
    updateOrderStatus,
    deleteOrder,
    filter,
  };
};
