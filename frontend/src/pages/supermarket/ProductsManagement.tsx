import React, { useState, useEffect, useCallback } from 'react';
import { 
  Button, 
  Table, 
  Space, 
  Modal, 
  message, 
  Input, 
  InputNumber, 
  DatePicker 
} from 'antd';
import dayjs from 'dayjs';
import Header from '../../components/Header';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelectedSystemId } from '../../hooks/useSelectedSystemId';
import { useApi } from '../../hooks/useApi';

interface Product {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
  expiry_date: string;
}

const initialProduct: Omit<Product, 'id'> = {
  name: '',
  price: 0,
  stock_quantity: 0,
  expiry_date: ''
};

const ProductsManagement: React.FC = () => {
  const [selectedSystemId] = useSelectedSystemId();
  const api = useApi();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(initialProduct);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.callApi('get', `/supermarket/${selectedSystemId}/products/`);
      const productsData = Array.isArray(response) ? response : response?.data || [];
      const parsedProducts = productsData.map((product: {price: string; stock_quantity: string | number}) => ({
        ...product,
        price: parseFloat(product.price),
        stock_quantity: parseInt(String(product.stock_quantity))
      }));
      setProducts(parsedProducts);
    } catch {
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [selectedSystemId, api]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddClick = useCallback(() => {
    setFormData(initialProduct);
    setEditProduct(null);
    setShowModal(true);
  }, []);

  const handleEditClick = useCallback((product: Product) => {
    setFormData({ 
      ...product,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price
    });
    setEditProduct(product);
    setShowModal(true);
  }, []);

  const handleDeleteClick = useCallback(async (product: Product) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: `Are you sure you want to delete ${product.name}?`,
      onOk: async () => {
        try {
          setLoading(true);
          await api.callApi('delete', `/supermarket/${selectedSystemId}/products/${product.id}/`);
          message.success('Product deleted successfully');
          await fetchProducts();
        } catch (error: unknown) {
          message.error(`Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
          setLoading(false);
        }
      },
    });
  }, [selectedSystemId, api, fetchProducts]);

  const handleSave = useCallback(async () => {
    try {
      setLoading(true);
      if (editProduct) {
        await api.callApi('put', `/supermarket/${selectedSystemId}/products/${editProduct.id}/`, formData);
        message.success('Product updated successfully');
      } else {
        await api.callApi('post', `/supermarket/${selectedSystemId}/products/`, formData);
        message.success('Product added successfully');
      }
      await fetchProducts();
      setShowModal(false);
    } catch (error: unknown) {
      message.error(`Failed to save product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [formData, editProduct, selectedSystemId, api, fetchProducts]);

  const columns: ColumnsType<Product> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      filterSearch: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search name"
            value={selectedKeys[0] as string}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
        </div>
      ),
      onFilter: (value, record) =>
        record.name.toLowerCase().includes(String(value).toLowerCase()),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (value: number) => `$${value.toFixed(2)}`,
      sorter: (a, b) => a.price - b.price,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => {
        const handleFilter = () => confirm();
        
        return (
          <div style={{ padding: 8 }}>
            <InputNumber
              placeholder="Min price"
              value={selectedKeys[0] as number | undefined}
              onChange={(value) => setSelectedKeys(value ? [value] : [])}
              style={{ marginBottom: 8, display: 'block' }}
            />
            <InputNumber
              placeholder="Max price"
              value={selectedKeys[1] as number | undefined}
              onChange={(value) => setSelectedKeys([selectedKeys[0] as number, value as number])}
              style={{ display: 'block' }}
            />
            <Button type="primary" onClick={handleFilter} size="small">
              Filter
            </Button>
          </div>
        );
      },
      onFilter: (value: unknown, record) => {
        if (!Array.isArray(value) || value.length !== 2 || typeof value[0] !== 'number' || typeof value[1] !== 'number') {
          return true;
        }
        const [min, max] = value;
        return (!min || record.price >= min) && (!max || record.price <= max);
      },
    },
    {
      title: 'Stock',
      dataIndex: 'stock_quantity',
      key: 'stock',
      sorter: (a, b) => a.stock_quantity - b.stock_quantity,
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      sorter: (a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime(),
      render: (date: string) => new Date(date).toLocaleDateString(),
      filterDropdown: ({ setSelectedKeys, confirm }) => {
        const handleFilter = () => confirm();
        
        return (
          <div style={{ padding: 8 }}>
            <DatePicker.RangePicker
              onChange={(dates) => {
                if (dates) {
                  setSelectedKeys(dates.map(d => d?.toISOString() || ''));
                }
              }}
              style={{ display: 'block', marginBottom: 8 }}
            />
            <Button type="primary" onClick={handleFilter} size="small">
              Filter
            </Button>
          </div>
        );
      },
      onFilter: (value, record) => {
        if (!Array.isArray(value) || value.length !== 2) return false;
        const start = typeof value[0] === 'string' ? value[0] : null;
        const end = typeof value[1] === 'string' ? value[1] : null;
        const recordDate = new Date(record.expiry_date).getTime();
        return (!start || recordDate >= new Date(start).getTime()) && 
               (!end || recordDate <= new Date(end).getTime());
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: Product) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditClick(record)} />
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDeleteClick(record)} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 24 }}>
      <Header 
        title="Products Management"
        breadcrumbs={[
          { title: 'Supermarket', path: '/supermarket' },
          { title: 'Products' }
        ]}
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddClick}>
            Add Product
          </Button>
        }
      />

      {loading ? (
        <div>Loading products...</div>
      ) : products.length === 0 ? (
        <div>No products found</div>
      ) : (
        <Table 
          columns={columns} 
          dataSource={products} 
          rowKey="id" 
          loading={loading}
          bordered
        />
      )}

      <Modal
        title={editProduct ? 'Edit Product' : 'Add Product'}
        open={showModal}
        onOk={handleSave}
        onCancel={() => setShowModal(false)}
      >
        <Input
          placeholder="Product Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          style={{ marginBottom: 16 }}
        />
        <InputNumber
          placeholder="Price"
          value={formData.price}
          onChange={(value) => setFormData({...formData, price: value || 0})}
          min={0}
          step={0.01}
          style={{ width: '100%', marginBottom: 16 }}
        />
        <InputNumber
          placeholder="Stock Quantity"
          value={formData.stock_quantity}
          onChange={(value) => setFormData({...formData, stock_quantity: value || 0})}
          min={0}
          style={{ width: '100%', marginBottom: 16 }}
        />
        <DatePicker
          placeholder="Expiry Date"
          value={formData.expiry_date ? dayjs(formData.expiry_date) : null}
          onChange={(date) => setFormData({...formData, expiry_date: date?.format('YYYY-MM-DD')})}
          style={{ width: '100%', marginBottom: 16 }}
        />
      </Modal>
    </div>
  );
};

export default ProductsManagement;
