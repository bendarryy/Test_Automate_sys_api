import { PurchaseOrder } from '../types/PurchaseOrder';

export const formatOrderStatus = (status: PurchaseOrder['status']) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
};

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};
