import { useState } from 'react';
import { Form } from 'antd';
import dayjs from 'dayjs';
import { Product } from '../pages/supermarket/InventoryManagementPage';

export const useInventoryTable = () => {
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = (record: Product) => {
    form.setFieldsValue({
      name: record.name,
      price: record.price,
      stock_quantity: record.stock_quantity,
      expiry_date: dayjs(record.expiry_date)
    });
    setEditingId(record.id);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  return {
    form,
    editingId,
    handleEdit,
    handleCancel
  };
};
