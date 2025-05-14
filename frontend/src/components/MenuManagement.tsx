import React, { useState, useEffect } from 'react';
import { Button, Modal, Input, Space, Tag, Spin, Table, Upload, message, Select, Popover, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Key } from 'antd/es/table/interface';
import { useGetMenu } from '../hooks/useGetMenu';
import { useSelectedSystemId } from '../hooks/useSelectedSystemId';
import type { MenuItem } from '../types';

interface MenuManagementProps {
  EditPermition?: boolean;
}

const initialItem: MenuItem = {
  id: 0,
  name: '',
  category: '',
  price: 0,
  cost: 0,
  is_available: true,
  description: '',
  image: null,
};

const MenuManagement: React.FC<MenuManagementProps> = ({ EditPermition }) => {
  const [selectedSystemId] = useSelectedSystemId();
  const { getMenu, createMenuItem, updateMenuItem, deleteMenuItem, getCategories, loading } = useGetMenu(Number(selectedSystemId));

  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialItem);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedItems, fetchedCategories] = await Promise.all([
          getMenu(),
          getCategories()
        ]);
        
        setItems((fetchedItems || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          price: typeof item.price === 'number' ? item.price : Number(item.price),
          cost: typeof item.cost === 'number' ? item.cost : Number(item.cost),
          is_available: item.is_available,
          description: item.description,
          image: item.image ?? null,
        })));

        if (fetchedCategories && Array.isArray(fetchedCategories)) {
          setCategories(fetchedCategories);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Failed to load menu data');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    console.log('Items updated:', items);
  }, [items]);

  const handleAddClick = React.useCallback(() => {
    setFormData({ ...initialItem, category: categories[0] || '' });
    setEditItem(null);
    setShowModal(true);
  }, [categories]);

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
    console.log('formData:', formData, 'categories:', categories);
    // Validation: name, category (non-empty and valid), price (>0), cost (>0 and < price)
    if (
      !formData.name ||
      typeof formData.category !== 'string' ||
      !formData.category.trim() ||
      !categories.some(cat => cat.toLowerCase() === formData.category.toLowerCase()) ||
      formData.price == null || isNaN(Number(formData.price)) || Number(formData.price) <= 0 ||
      formData.cost == null || isNaN(Number(formData.cost)) || Number(formData.cost) <= 0 ||
      Number(formData.cost) >= Number(formData.price)
    ) {
      alert('Please fill in all required fields: name, valid category, price (>0), and cost (>0 and < price).');
      return;
    }

    let resultItem;
    if (formData.image && (formData.image instanceof File || (typeof formData.image === 'object' && formData.image !== null && 'type' in formData.image))) {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('category', formData.category);
      fd.append('price', String(formData.price));
      fd.append('cost', String(formData.cost));
      fd.append('is_available', String(formData.is_available));
      fd.append('description', formData.description || '');
      fd.append('image', formData.image);
      if (editItem) {
        resultItem = await updateMenuItem(editItem.id, fd);
      } else {
        resultItem = await createMenuItem(fd);
      }
    } else {
      const updatedFormData = {
        ...formData,
        price: Number(formData.price),
        cost: Number(formData.cost),
        category: formData.category?.toLowerCase(),
      };
      if (typeof updatedFormData.image === 'string') {
        delete updatedFormData.image;
      }
      if (editItem) {
        resultItem = await updateMenuItem(editItem.id, updatedFormData);
      } else {
        resultItem = await createMenuItem({ ...updatedFormData, id: Date.now(), image: null });
      }
    }

    if (editItem) {
      setItems(items.map((item) => (
        item.id === editItem.id
          ? {
              id: editItem.id,
              name: formData.name,
              category: formData.category,
              price: Number(formData.price),
              cost: Number(formData.cost),
              is_available: formData.is_available,
              description: formData.description,
              image: formData.image,
            }
          : item
      )));
    } else if (resultItem && resultItem.id) {
      setItems([
        ...items,
        {
          id: resultItem.id,
          name: resultItem.name,
          category: resultItem.category,
          price: typeof resultItem.price === 'number' ? resultItem.price : Number(resultItem.price),
          cost: typeof resultItem.cost === 'number' ? resultItem.cost : Number(resultItem.cost),
          is_available: resultItem.is_available,
          description: resultItem.description,
          image: resultItem.image,
        },
      ]);
    }
    setShowModal(false);
  }, [editItem, formData, items]);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;

      if (type === 'file' && e.target instanceof HTMLInputElement && e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setFormData((prev) => ({ ...prev, image: file }));
        return;
      }
      if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
        setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        return;
      }
      setFormData((prev) => {
        if (name === 'price' || name === 'cost') {
          return { ...prev, [name]: value === '' ? '' : Number(value) };
        }
        return { ...prev, [name]: value };
      });
    },
    []
  );

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: 64,
      render: (image: string | null) =>
        image ? (
          <img src={image} alt="item" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
        ) : null,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: MenuItem, b: MenuItem) => a.name.localeCompare(b.name),
      filterSearch: true,
      render: (text: string) => (
        <Popover 
          content={text} 
          trigger="hover"
          placement="topLeft"
        >
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
      onFilter: (value: string | number | boolean, record: MenuItem) => record.category === value,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <Popover 
          content={text} 
          trigger="hover"
          placement="topLeft"
        >
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
      render: (price: number) => `${price} EGP`,
      sorter: (a: MenuItem, b: MenuItem) => a.price - b.price,
    },
    {
      title: 'Availability',
      dataIndex: 'is_available',
      key: 'is_available',
      render: (is_available: boolean) => (
        <Tag color={is_available ? 'green' : 'red'}>
          {is_available ? 'Available' : 'Not Available'}
        </Tag>
      ),
      filters: [
        { text: 'Available', value: true },
        { text: 'Not Available', value: false },
      ],
      onFilter: (value: boolean | Key, record: MenuItem) => typeof value === 'boolean' ? record.is_available === value : false,
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

  const filteredItems = selectedCategories.length > 0
    ? items.filter(item => selectedCategories.includes(item.category))
    : items;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Management Menu</h2>
        <Space>
          <Select
            mode="multiple"
            style={{ width: 300 }}
            placeholder="Select Categories"
            value={selectedCategories}
            onChange={setSelectedCategories}
            options={categories.map(cat => ({ label: cat, value: cat }))}
            loading={loading}
          />
          <Button type="primary" onClick={handleAddClick}>
            Add Item
          </Button>
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table<MenuItem>
          columns={columns}
          dataSource={filteredItems}
          rowKey="id"
          bordered
          size="middle"
        />
      )}

      <Modal
        title={editItem ? 'Edit Item' : 'Add Item'}
        open={showModal}
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
        <div style={{ padding: 0 }}>
  <div style={{ marginBottom: 16 }}>
    <label style={{ fontWeight: 500 }}>Name</label>
    <Input
      name="name"
      value={formData.name}
      onChange={handleChange}
      placeholder="Name"
      style={{ marginTop: 4 }}
    />
  </div>
  <div style={{ marginBottom: 16 }}>
    <label style={{ fontWeight: 500, display: 'block' }}>Image</label>
    <Upload
      name="image"
      listType="picture-card"
      showUploadList={false}
      accept="image/*"
      beforeUpload={file => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
          message.error('يرجى اختيار صورة فقط');
          return Upload.LIST_IGNORE;
        }
        setFormData(prev => ({ ...prev, image: file }));
        return false; // لا ترفع تلقائياً
      }}
    >
      {formData.image ? (
        <img
          src={typeof formData.image === 'object' && formData.image !== null && 'type' in formData.image
            ? URL.createObjectURL(formData.image as File)
            : (formData.image as string)}
          alt="preview"
          style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6 }}
        />
      ) : (
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>رفع صورة</div>
        </div>
      )}
    </Upload>
  </div>
  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
    <div style={{ flex: 1 }}>
      <label style={{ fontWeight: 500 }}>Category</label>
      <select
        name="category"
        value={formData.category}
        onChange={handleChange}
        style={{ width: '100%', marginTop: 4, height: 32, borderRadius: 4, border: '1px solid #d9d9d9' }}
      >
        {categories.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
    </div>
    <div style={{ flex: 1 }}>
      <label style={{ fontWeight: 500 }}>Price (EGP)</label>
      <Input
        name="price"
        type="number"
        value={formData.price}
        onChange={handleChange}
        placeholder="Price"
        style={{ marginTop: 4 }}
      />
    </div>
    <div style={{ flex: 1 }}>
      <label style={{ fontWeight: 500 }}>Cost</label>
      <Input
        name="cost"
        type="number"
        value={formData.cost}
        onChange={handleChange}
        placeholder="Cost"
        style={{ marginTop: 4 }}
      />
    </div>
  </div>
  <div style={{ marginBottom: 8 }}>
    <label style={{ fontWeight: 500 }}>
      <span>Available</span>
      <span style={{ marginLeft: 8 }}>
        <input
          type="checkbox"
          name="is_available"
          checked={formData.is_available}
          onChange={handleChange}
          style={{ verticalAlign: 'middle' }}
        />
      </span>
    </label>
  </div>
  <div style={{ marginBottom: 16 }}>
    <label style={{ fontWeight: 500 }}>Description</label>
    <Input.TextArea
      name="description"
      value={formData.description}
      onChange={handleChange}
      placeholder="Description"
      autoSize={{ minRows: 3, maxRows: 5 }}
      style={{ marginTop: 4 }}
    />
  </div>

</div>
      </Modal>
    </div>
  );
}

export default MenuManagement;
