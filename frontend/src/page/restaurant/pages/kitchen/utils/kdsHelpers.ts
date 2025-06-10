import { KitchenOrder } from '../types/kitchenOrder';

export function sortOrders(orders: KitchenOrder[]): KitchenOrder[] {
  return [...orders].sort((a, b) => {
    if (a.status === b.status) {
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    }
    return a.status === 'pending' ? -1 : 1;
  });
}

export function filterOrders(
  orders: KitchenOrder[],
  searchText: string,
  statusFilter: string[],
  tableFilter: string
): KitchenOrder[] {
  return orders.filter(order => {
    const matchesSearch = searchText === '' ||
      order.customer_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      order.table_number?.toLowerCase().includes(searchText.toLowerCase()) ||
      order.id.toString().includes(searchText);

    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(order.status);
    const matchesTable = tableFilter === '' || order.table_number === tableFilter;

    return matchesSearch && matchesStatus && matchesTable;
  });
}

export function getOrderStats(orders: KitchenOrder[]) {
  return {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length
  };
}

export function getUniqueTables(orders: KitchenOrder[]) {
  return [...new Set(orders.map(order => order.table_number))].filter(Boolean) as string[];
}
