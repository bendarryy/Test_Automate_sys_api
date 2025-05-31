// InventoryManagementPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Table, Input, Button, Modal, Form, Progress, Space, Tag } from 'antd';
import Header from '../../components/Header';
import { SearchOutlined, PlusCircleOutlined, EditOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from '../../styles/InventoryManagementPage.module.css';
import { useInventory, InventoryItem } from '../../hooks/useInventory';
import { useSelectedSystemId } from '../../hooks/useSelectedSystemId';
import type { ColumnsType } from 'antd/es/table';

// Helper to calculate status and availability
function computeStatusAndAvailability(item: InventoryItem) {
  let status: 'Sufficient' | 'LOW' = 'Sufficient';
  let availability = 100;
  if (item.min_threshold !== null && item.quantity !== null) {
    if (item.quantity <= item.min_threshold) status = 'LOW';
    availability = item.min_threshold > 0 ? Math.round((item.quantity / item.min_threshold) * 100) : 100;
    if (availability > 100) availability = 100;
    if (availability < 0) availability = 0;
  }
  return { status, availability };
}

const InventoryManagementPage: React.FC = () => {
  const [selectedSystemId] = useSelectedSystemId();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id'>>({
    name: '',
    quantity: null,
    unit: '',
    min_threshold: null,
  });
  const { inventory, loading, error, fetchInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useInventory();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (selectedSystemId) {
      fetchInventory(selectedSystemId);
    }
  }, [selectedSystemId]);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleAddNewIngredient = async () => {
    if (!newItem.name || newItem.quantity === null || !newItem.unit || !selectedSystemId) return;
    await addInventoryItem(selectedSystemId, newItem);
    fetchInventory(selectedSystemId);
    setNewItem({ name: '', quantity: null, unit: '', min_threshold: null });
    handleCloseModal();
  };

  const isEditing = (record: InventoryItem) => String(record.id) === editingKey;

  const edit = (record: InventoryItem) => {
    setEditingKey(String(record.id));
    setEditingData({ ...record });
  };

  const cancel = () => {
    setEditingKey(null);
    setEditingData(null);
  };

  const save = async (id: string) => {
    try {
      if (!editingData || !selectedSystemId) return;
      await updateInventoryItem(selectedSystemId, id, editingData);
      setEditingKey(null);
      setEditingData(null);
      
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    } finally {
      if (selectedSystemId) {
        fetchInventory(selectedSystemId);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!selectedSystemId) return;
    try {
      await deleteInventoryItem(selectedSystemId, id);
      fetchInventory(selectedSystemId);
    } catch (err) {
      console.log('Delete Failed:', err);
    }
  };

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
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search name"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm({ closeDropdown: true })}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
            prefix={<SearchOutlined />}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm({ closeDropdown: true })}
              size="small"
            >
              Search
            </Button>
            <Button
              onClick={() => {
                clearFilters?.();
                confirm({ closeDropdown: true });
              }}
              size="small"
            >
              Reset
            </Button>
          </Space>
        </div>
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
  ], [editingKey, editingData]);

  const tableData = useMemo(() => {
    if (!inventory) return [];
    return inventory.map(item => ({
      ...item,
      key: item.id
    }));
  }, [inventory]);

  return (
    <div className={`container py-4 ${styles.customContainer}`}>
      <Header 
        title="Stock Management"
        breadcrumbs={[
          { title: 'Restaurant', path: '/restaurant' },
          { title: 'Inventory' }
        ]}
        actions={
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={handleOpenModal}
            size="large"
          >
            Add New Ingredient
          </Button>
        }
      />
      {error && <div className="alert alert-danger">{error}</div>}

      <Table
        columns={columns}
        dataSource={tableData}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />

      <Modal
        title="Add New Ingredient"
        open={showModal}
        onCancel={handleCloseModal}
        footer={[
          <Button key="cancel" onClick={handleCloseModal}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleAddNewIngredient}
            loading={loading}
          >
            Add Ingredient
          </Button>
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Item Name" required>
            <Input
              value={newItem.name}
              onChange={e => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="Enter item name"
            />
          </Form.Item>
          <Form.Item label="Quantity" required>
            <Input
              type="number"
              value={newItem.quantity ?? ''}
              onChange={e => setNewItem({ ...newItem, quantity: e.target.value === '' ? null : Number(e.target.value) })}
              placeholder="Enter quantity"
            />
          </Form.Item>
          <Form.Item label="Unit" required>
            <Input
              value={newItem.unit}
              onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
              placeholder="Enter unit (e.g. kg, liter)"
            />
          </Form.Item>
          <Form.Item label="Min Threshold">
            <Input
              type="number"
              value={newItem.min_threshold ?? ''}
              onChange={e => setNewItem({ ...newItem, min_threshold: e.target.value === '' ? null : Number(e.target.value) })}
              placeholder="Enter minimum threshold"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryManagementPage;