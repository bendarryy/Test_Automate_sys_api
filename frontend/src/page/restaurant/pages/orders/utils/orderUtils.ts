import { OrderStatus } from '../types/order';

export const statusColors: Record<OrderStatus, string> = {
  pending: 'orange',
  preparing: 'blue',
  ready: 'green',
  completed: 'purple',
  canceled: 'red',
  served: 'cyan',
  out_for_delivery: 'geekblue'
};

export function formatOrderDate(date: string) {
  return new Date(date).toLocaleString();
}
