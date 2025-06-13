import React from 'react';
import { Table, Button, Space, Tag, Popover, Typography, Spin, Skeleton } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { MenuItem } from '../types/menu';

interface MenuTableProps {
  items: MenuItem[];
  categories: string[];
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  loading: boolean;
  itemLoadingId?: number | null;
}

// Skeleton row generator
const getSkeletonRows = (rowCount: number): any[] => {
  return Array.from({ length: rowCount }).map((_, idx) => ({
    id: `skeleton-${idx}`,
    image: null,
    name: '',
    category: '',
    description: '',
    price: '',
    is_available: true,
    actions: '',
  }));
};

const MenuTable: React.FC<MenuTableProps> = ({ items, categories, onEdit, onDelete, loading, itemLoadingId }) => {
  const columns: ColumnsType<MenuItem> = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: 64,
      render: (image: string | null, record: any) =>
        loading && record.id?.toString().startsWith('skeleton') ? (
          <Skeleton.Avatar active size={48} shape="square" style={{ borderRadius: 6 }} />
        ) : image ? (
          <img src={typeof image === 'string' ? image : URL.createObjectURL(image as File)} alt="item" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
        ) : null,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: MenuItem, b: MenuItem) => a.name.localeCompare(b.name),
      filterSearch: true,
      render: (text: string, record: any) =>
        loading && record.id?.toString().startsWith('skeleton') ? (
          <Skeleton.Input active size="small" style={{ width: 120 }} />
        ) : (
          <Popover content={text} trigger="hover" placement="topLeft">
            <Typography.Text ellipsis style={{ maxWidth: 200 }}>
              {text}
            </Typography.Text>
          </Popover>
        ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: categories.map(cat => ({ text: cat, value: cat })),
      onFilter: (value, record: MenuItem) => record.category === value,
      render: (text: string, record: any) =>
        loading && record.id?.toString().startsWith('skeleton') ? (
          <Skeleton.Input active size="small" style={{ width: 80 }} />
        ) : text,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string, record: any) =>
        loading && record.id?.toString().startsWith('skeleton') ? (
          <Skeleton.Input active size="small" style={{ width: 160 }} />
        ) : (
          <Popover content={text} trigger="hover" placement="topLeft">
            <Typography.Text ellipsis style={{ maxWidth: 200 }}>
              {text}
            </Typography.Text>
          </Popover>
        ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number, record: any) =>
        loading && record.id?.toString().startsWith('skeleton') ? (
          <Skeleton.Input active size="small" style={{ width: 60 }} />
        ) : `${price} EGP`,
      sorter: (a: MenuItem, b: MenuItem) => a.price - b.price,
    },
    {
      title: 'Availability',
      dataIndex: 'is_available',
      key: 'is_available',
      render: (is_available: boolean, record: any) =>
        loading && record.id?.toString().startsWith('skeleton') ? (
          <Skeleton.Button active size="small" style={{ width: 80 }} />
        ) : (
          <Tag color={is_available ? 'green' : 'red'}>
            {is_available ? 'Available' : 'Not Available'}
          </Tag>
        ),
      filters: [
        { text: 'Available', value: true },
        { text: 'Not Available', value: false },
      ],
      onFilter: (value, record: MenuItem) =>
        typeof value === 'boolean' ? record.is_available === value : false,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: string, record: any) =>
        loading && record.id?.toString().startsWith('skeleton') ? (
          <Space>
            <Skeleton.Button active size="small" style={{ width: 50 }} />
            <Skeleton.Button active size="small" style={{ width: 60 }} />
          </Space>
        ) : (
          <Space>
            <Button
              type="primary"
              onClick={() => onEdit(record)}
              loading={itemLoadingId === record.id}
              disabled={itemLoadingId === record.id}
            >
              Edit
            </Button>
            <Button
              danger
              onClick={() => onDelete(record)}
              loading={itemLoadingId === record.id}
              disabled={itemLoadingId === record.id}
            >
              Delete
            </Button>
          </Space>
        ),
    },
  ];

  // Skeleton Table
  if (loading) {
    return (
      <Table
        columns={columns}
        dataSource={getSkeletonRows(8)}
        rowKey="id"
        bordered
        size="middle"
        pagination={false}
      />
    );
  }

  // فقط بعد انتهاء الـ loading اعرض الجدول (سيظهر No Data فقط إذا لم توجد بيانات بعد التحميل)
  return (
    <Table<MenuItem>
      columns={columns}
      dataSource={items}
      rowKey="id"
      bordered
      size="middle"
      loading={false}
    />
  );
};

export default MenuTable;