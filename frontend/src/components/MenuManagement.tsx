import React, { useState, useEffect } from 'react';
import { Button, Modal, Tabs, Input, Space, Tag, Spin, Table } from 'antd';
import { Key } from 'antd/es/table/interface';
import { useGetMenu } from '../hooks/useGetMenu';
import { useSelectedSystemId } from '../hooks/useSelectedSystemId';
import type { MenuItem } from '../types';

const categories = ['Food', 'Drink', 'Soups', 'Dessert'];

const initialItem: MenuItem = {
  id: 0,
  name: '',
  category: 'Food',
  price: 0,
  available: true,
  description: '',
  specialOffer: false,
};

const MenuManagement = () => {

  const [selectedSystemId] = useSelectedSystemId();
  const { getMenu, createMenuItem, updateMenuItem, deleteMenuItem, loading } = useGetMenu(Number(selectedSystemId));

  const [items, setItems] = useState<MenuItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialItem);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [activeTab, setActiveTab] = useState('Food');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const fetchedItems = await getMenu();
        setItems(fetchedItems || []);
        console.log('Fetched items:', items);
      } catch (error) {
        console.error('Error fetching menu:', error);
      }
    };
    fetchMenu();
  }, []);

  useEffect(() => {
    console.log('Items updated:', items);
  }, [items]);

  const handleAddClick = React.useCallback(() => {
    setFormData(initialItem);
    setEditItem(null);
    setShowModal(true);
  }, []);

  const handleEditClick = React.useCallback((item: MenuItem) => {
    setFormData({ ...item });
    setEditItem(item);
    setShowModal(true);
  }, []);

  const handleDeleteClick = React.useCallback(async (item: MenuItem) => {
    await deleteMenuItem(item.id);
    setItems(items.filter((i) => i.id !== item.id));
  }, []);

  const handleSave = React.useCallback(async () => {
    if (!formData.name || !formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      alert('Please fill in all fields correctly.');
      return;
    }
  
    const updatedFormData = {
      ...formData,
      price: Number(formData.price),
      category: formData.category?.toLowerCase(), // Convert category to lowercase
    };

    if (editItem) {
      await updateMenuItem(editItem.id, updatedFormData);
      setItems(items.map((item) => (
        item.id === editItem.id
          ? {
              id: editItem.id,
              name: updatedFormData.name,
              category: updatedFormData.category,
              price: Number(updatedFormData.price),
              available: updatedFormData.available,
              description: updatedFormData.description,
              specialOffer: updatedFormData.specialOffer,
            }
          : item
      )));
    } else {
      const newItem = await createMenuItem({ ...updatedFormData, id: Date.now() });
      // Ensure newItem has all MenuItem properties and correct types
      if (
        newItem &&
        typeof newItem.id === 'number' &&
        typeof newItem.name === 'string' &&
        typeof newItem.category === 'string' &&
        typeof newItem.price === 'number' &&
        typeof newItem.available === 'boolean' &&
        typeof newItem.description === 'string' &&
        typeof newItem.specialOffer === 'boolean'
      ) {
        setItems([
          ...items,
          {
            id: newItem.id,
            name: newItem.name,
            category: newItem.category,
            price: newItem.price,
            available: newItem.available,
            description: newItem.description,
            specialOffer: newItem.specialOffer,
          },
        ]);
      }
    }
    setShowModal(false);
  }, []);

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value });
  }, []);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: MenuItem, b: MenuItem) => a.name.localeCompare(b.name),
      filterSearch: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `${price} EGP`,
      sorter: (a: MenuItem, b: MenuItem) => a.price - b.price,
    },
    {
      title: 'Availability',
      dataIndex: 'available',
      key: 'available',
      render: (available: boolean) => (
        <Tag color={available ? 'green' : 'red'}>
          {available ? 'Available' : 'Not Available'}
        </Tag>
      ),
      filters: [
        { text: 'Available', value: true },
        { text: 'Not Available', value: false },
      ],
      onFilter: (value: boolean | Key, record: MenuItem) => typeof value === 'boolean' ? record.available === value : false,
    },
    {
      title: 'Special Offer',
      dataIndex: 'specialOffer',
      key: 'specialOffer',
      render: (specialOffer: boolean) => (
        <Tag color={specialOffer ? 'gold' : 'default'}>
          {specialOffer ? 'Yes' : 'No'}
        </Tag>
      ),
      filters: [
        { text: 'Yes', value: true },
        { text: 'No', value: false },
      ],
      onFilter: (value: boolean | Key, record: MenuItem) => typeof value === 'boolean' ? record.specialOffer === value : false,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: Text, record: MenuItem) => (
        <Space>
          <Button type="primary" onClick={() => handleEditClick(record)}>
            Edit
          </Button>
          <Button danger onClick={() => handleDeleteClick(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Management Menu</h2>
      <Button type="primary" onClick={handleAddClick} style={{ marginBottom: 16 }}>
        Add Item
      </Button>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Tabs activeKey={activeTab} onChange={(k) => setActiveTab(k || 'Food')}>
          {categories.map((cat) => {
            const categoryItems = items.filter(item => 
              item.category?.toLowerCase() === cat?.toLowerCase()
            );
            return (
              <Tabs.TabPane tab={cat} key={cat}>
                <Table<MenuItem>
                  columns={columns}
                  dataSource={categoryItems}
                  rowKey="id"
                  bordered
                  size="middle"
                />
              </Tabs.TabPane>
            );
          })}
        </Tabs>
      )}

      <Modal
        title={editItem ? 'Edit Item' : 'Add Item'}
        visible={showModal}
        onCancel={() => setShowModal(false)}
        footer={[
          <Button key="back" onClick={() => setShowModal(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleSave}>
            Save
          </Button>,
        ]}
      >
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <Input
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Category"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <Input
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              placeholder="Price"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <Input
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <Input
              name="available"
              type="checkbox"
              checked={formData.available}
              onChange={handleChange}
              placeholder="Available"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <Input
              name="specialOffer"
              type="checkbox"
              checked={formData.specialOffer}
              onChange={handleChange}
              placeholder="Special Offer"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MenuManagement;