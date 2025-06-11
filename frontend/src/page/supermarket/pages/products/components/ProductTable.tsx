import React, { useState } from 'react';
// antd components
import { Table, Button, Tag, Input, Space, Tooltip } from 'antd'; // Added Tooltip
// antd icons
import { ExclamationCircleOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons'; // Added EditOutlined, EyeOutlined, DeleteOutlined
import type { ColumnsType } from 'antd/es/table';
import type { Product } from '../types/product';

interface ProductTableProps {
  products: Product[];
  onEditStock: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onDeleteProduct: (productId: number) => void; // Add this line
}

const LOW_STOCK_THRESHOLD = 10;
const EXPIRY_SOON_DAYS = 14;

function isLowStock(product: Product) {
  return product.stock_quantity < LOW_STOCK_THRESHOLD;
}

function isExpiringSoon(product: Product) {
  const expiry = new Date(product.expiry_date);
  const now = new Date();
  const diff = (expiry.getTime() - now.getTime()) / (1000 * 3600 * 24);
  return diff < EXPIRY_SOON_DAYS;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, onEditStock, onViewDetails, onDeleteProduct }) => {
  const [search, setSearch] = useState('');

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const columns: ColumnsType<Product> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {isLowStock(record) && <Tag color="red">Low</Tag>}
          {isExpiringSoon(record) && <Tag color="orange">Expiring</Tag>}
          {text}
        </Space>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <span>${price}</span>,
    },
    {
      title: 'Stock',
      dataIndex: 'stock_quantity',
      key: 'stock_quantity',
      render: (stock, record) => (
        <span>
          {stock} {isLowStock(record) && <ExclamationCircleOutlined style={{ color: 'red' }} />}
        </span>
      ),
    },
    {
      title: 'Expiry',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      render: (date, record) => (
        <span>
          {date} {isExpiringSoon(record) && <ExclamationCircleOutlined style={{ color: 'orange' }} />}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Stock">
            <Button type="link" icon={<EditOutlined />} onClick={() => onEditStock(record)} />
          </Tooltip>
          <Tooltip title="View Details">
            <Button type="link" icon={<EyeOutlined />} onClick={() => onViewDetails(record)} />
          </Tooltip>
          <Tooltip title="Delete Product">
            <Button type="link" danger icon={<DeleteOutlined />} onClick={() => onDeleteProduct(record.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Input.Search
        placeholder="Search product name"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 16, maxWidth: 300 }}
        allowClear
      />
      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        bordered
        size="middle"
      />
    </div>
  );
};

export default ProductTable;
