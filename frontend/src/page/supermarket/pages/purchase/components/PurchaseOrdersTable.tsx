import React from 'react';
import { Table, Tag } from 'antd';
import { PurchaseOrder } from '../types/PurchaseOrder';
import { formatOrderStatus, formatDate } from '../utils/formatters';

interface PurchaseOrdersTableProps {
  orders: PurchaseOrder[];
  loading: boolean;
  onEdit: (order: PurchaseOrder) => void;
  onDelete: (order: PurchaseOrder) => void;
}

export const PurchaseOrdersTable: React.FC<PurchaseOrdersTableProps> = ({ orders, loading, onEdit, onDelete }) => {
  const columns = [
    {
      title: 'Supplier',
      dataIndex: 'supplier_name',
      key: 'supplier_name',
    },
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Cost',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost: string) => `£${cost}`,
    },
    {
      title: 'Order Date',
      dataIndex: 'order_date',
      key: 'order_date',
      render: formatDate,
    },
    {
      title: 'Expected Delivery',
      dataIndex: 'expected_delivery_date',
      key: 'expected_delivery_date',
      render: formatDate,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: PurchaseOrder['status']) => (
        <Tag color={status === 'completed' ? 'green' : 'orange'}>{formatOrderStatus(status)}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: PurchaseOrder) => (
        <>
          <a onClick={() => onEdit(record)} style={{ marginRight: 8 }}>Edit</a>
          <a onClick={() => onDelete(record)} style={{ color: 'red' }}>Delete</a>
        </>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={orders}
      loading={loading}
      pagination={{ pageSize: 10 }}
      bordered
      size="middle"
      scroll={{ x: 'max-content' }}
      aria-label="Purchase Orders Table"
    />
  );
};
