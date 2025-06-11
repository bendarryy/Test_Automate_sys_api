import React from 'react';
import { Table, Button, Space, Typography, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { GoodsReceiving } from '../types/purchase';

interface GoodsReceivingTableProps {
  records: GoodsReceiving[];
  loading: boolean;
  error: string | null;
  onEdit?: (record: GoodsReceiving) => void;
  onDelete?: (record: GoodsReceiving) => void;
}

const { Text } = Typography;

const GoodsReceivingTable: React.FC<GoodsReceivingTableProps> = ({ records, loading, error, onEdit, onDelete }) => {
  const columns: ColumnsType<GoodsReceiving> = [
    { title: 'ID', dataIndex: 'id', sorter: (a, b) => a.id - b.id, width: 70 },
    { title: 'Purchase Order', dataIndex: 'purchase_order_id', width: 120 },
    { title: 'Received Qty', dataIndex: 'received_quantity', width: 120 },
    { title: 'Received Date', dataIndex: 'received_date', width: 120 },
    { title: 'Expiry Date', dataIndex: 'expiry_date', width: 120 },
    { title: 'Location', dataIndex: 'location', width: 120 },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          {onEdit && <Button size="small" onClick={() => onEdit(record)}>Edit</Button>}
          {onDelete && (
            <Popconfirm title="Delete this record?" onConfirm={() => onDelete(record)} okText="Yes" cancelText="No">
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
      dataSource={records}
      loading={loading}
      pagination={{ pageSize: 10 }}
      scroll={{ x: 'max-content' }}
      bordered
      size="middle"
    />
  );
};

export default GoodsReceivingTable;
