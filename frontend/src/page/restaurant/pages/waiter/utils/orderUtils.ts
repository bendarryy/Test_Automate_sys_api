import { Order } from '../types/waiterOrder';

export function getReadyOrders(orders: Order[]): Order[] {
  return orders
    .filter(o => o.status === 'ready')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

export function getServedOrders(orders: Order[]): Order[] {
  return orders
    .filter(o => o.status === 'served')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}
