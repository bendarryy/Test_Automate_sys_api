import React, { useMemo } from 'react';
import { Table, Input, Button, Progress, Space, Tag } from 'antd';
import { SearchOutlined, EditOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { InventoryItem } from '../types/inventory';
import { computeStatusAndAvailability } from '../utils/inventoryUtils';

interface InventoryTableProps {
  inventory: InventoryItem[];
  loading: boolean;
  editingKey: string | null;
  editingData: InventoryItem | null;
  isEditing: (record: InventoryItem) => boolean;
  edit: (record: InventoryItem) => void;
  cancel: () => void;
  save: (id: string) => void;
  handleDelete: (id: string) => void;
  setEditingData: React.Dispatch<React.SetStateAction<InventoryItem | null>>;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  inventory,
  loading,
  editingKey,
  editingData,
  isEditing,
  edit,
  cancel,
  save,
  handleDelete,
  setEditingData,
}) => {
  const columns: ColumnsType<InventoryItem> = useMemo(() => [
    {
      title: 'Item Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: InventoryItem) => {
        const editable = isEditing(record);
        return editable ? (
          <Input
            defaultValue={text}
            onChange={e => {
              setEditingData(prev => prev ? { ...prev, name: e.target.value } : null);
            }}
          />
        ) : (
          <span>{text}</span>
        );
      },
      sorter: (a, b) => a.name.localeCompare(b.name),
      filterSearch: true,
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) =>
        record.name.toString().toLowerCase().includes((value as string).toLowerCase()),
    },
    {
      title: 'Current Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number | null, record: InventoryItem) => {
        const editable = isEditing(record);
        return editable ? (
          <Input
            type="number"
            defaultValue={quantity ?? ''}
            onChange={e => {
              setEditingData(prev => prev ? { 
                ...prev, 
                quantity: e.target.value === '' ? null : Number(e.target.value) 
              } : null);
            }}
          />
        ) : (
          <span>{quantity}</span>
        );
      },
      sorter: (a, b) => (a.quantity || 0) - (b.quantity || 0),
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      render: (text: string, record: InventoryItem) => {
        const editable = isEditing(record);
        return editable ? (
          <Input
            defaultValue={text}
            onChange={e => {
              setEditingData(prev => prev ? { ...prev, unit: e.target.value } : null);
            }}
          />
        ) : (
          <span>{text}</span>
        );
      },
      filters: Array.from(new Set(inventory?.map(item => item.unit) || [])).map(unit => ({
        text: unit,
        value: unit
      })),
      onFilter: (value, record) => record.unit === value,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const { status } = computeStatusAndAvailability(record);
        return (
          <Tag color={status === 'LOW' ? 'error' : 'success'}>
            {status}
          </Tag>
        );
      },
      filters: [
        { text: 'Sufficient', value: 'Sufficient' },
        { text: 'LOW', value: 'LOW' }
      ],
      onFilter: (value, record) => {
        const { status } = computeStatusAndAvailability(record);
        return status === value;
      }
    },
    {
      title: 'Availability',
      key: 'availability',
      render: (_, record) => {
        const { availability, status } = computeStatusAndAvailability(record);
        return (
          <Progress
            percent={availability}
            status={status === 'LOW' ? 'exception' : 'success'}
            size="small"
            format={percent => `${percent}%`}
          />
        );
      },
      sorter: (a, b) => {
        const availabilityA = computeStatusAndAvailability(a).availability;
        const availabilityB = computeStatusAndAvailability(b).availability;
        return availabilityA - availabilityB;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<SaveOutlined />}
              onClick={() => save(String(record.id))}
            >
              Save
            </Button>
            <Button
              size="small"
              onClick={cancel}
            >
              Cancel
            </Button>
          </Space>
        ) : (
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => edit(record)}
              disabled={editingKey !== null}
            >
              Edit
            </Button>
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(String(record.id))}
              disabled={editingKey !== null}
            >
              Delete
            </Button>
          </Space>
        );
      }
    }
  ], [editingKey, editingData, inventory]);

  const tableData = useMemo(() => {
    if (!inventory) return [];
    return inventory.map(item => ({
      ...item,
      key: item.id
    }));
  }, [inventory]);

  return (
    <Table
      columns={columns}
      dataSource={tableData}
      loading={loading}
      rowKey="id"
      pagination={{ pageSize: 10 }}
      scroll={{ x: 'max-content' }}
    />
  );
};

export default InventoryTable;
