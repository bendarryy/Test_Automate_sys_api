import React from 'react';
import { Table, Button, Space, Typography, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PurchaseOrder } from '../types/purchase';

interface PurchaseOrderTableProps {
  orders: PurchaseOrder[];
  loading: boolean;
  error: string | null;
  onEdit?: (order: PurchaseOrder) => void;
  onDelete?: (order: PurchaseOrder) => void;
}

const { Text } = Typography;

const PurchaseOrderTable: React.FC<PurchaseOrderTableProps> = ({ orders, loading, error, onEdit, onDelete }) => {
  const columns: ColumnsType<PurchaseOrder> = [
    { title: 'ID', dataIndex: 'id', sorter: (a, b) => a.id - b.id, width: 70 },
    { title: 'Supplier', dataIndex: 'supplier_id', width: 100 },
    { title: 'Product', dataIndex: 'product_id', width: 100 },
    { title: 'Quantity', dataIndex: 'quantity', width: 100 },
    { title: 'Cost', dataIndex: 'cost', width: 100 },
    { title: 'Order Date', dataIndex: 'order_date', width: 120 },
    { title: 'Expected Delivery', dataIndex: 'expected_delivery_date', width: 140 },
    { title: 'Status', dataIndex: 'status', width: 100, render: (status: string) => <Text type={status === 'pending' ? 'warning' : status === 'received' ? 'success' : undefined}>{status}</Text> },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          {onEdit && <Button size="small" onClick={() => onEdit(record)}>Edit</Button>}
          {onDelete && (
            <Popconfirm title="Delete this order?" onConfirm={() => onDelete(record)} okText="Yes" cancelText="No">
              <Button size="small" danger>Delete</Button>
            </Popconfirm>
          )}
        </Space>
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
      scroll={{ x: 'max-content' }}
      bordered
      size="middle"
    />
  );
};

export default PurchaseOrderTable;
