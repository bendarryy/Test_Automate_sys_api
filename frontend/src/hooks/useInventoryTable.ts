import { useState } from 'react';
import { FormInstance } from 'antd';
import dayjs from 'dayjs';
import { Product } from '../pages/supermarket/InventoryManagementPage';

export const useInventoryTable = (form?: FormInstance) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = (record: Product) => {
    if (form) {
      form.setFieldsValue({
        name: record.name,
        price: record.price,
        stock_quantity: record.stock_quantity,
        expiry_date: record.expiry_date ? dayjs(record.expiry_date) : undefined
      });
    }
    setEditingId(record.id);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  return {
    editingId,
    handleEdit,
    handleCancel
  };
};
