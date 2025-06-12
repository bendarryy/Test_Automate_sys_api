import React, { useState, useEffect } from 'react';
import { useApi } from 'shared/hooks/useApi';
import { Button, Modal, Input, Form, Card, Typography, message, Space } from 'antd';
import { PlusOutlined, PhoneOutlined, MailOutlined, EditOutlined, DeleteOutlined, ShopOutlined } from '@ant-design/icons';
import Header from 'shared/componanets/Header';
import { useSelectedSystemId } from 'shared/hooks/useSelectedSystemId';

interface Supplier {
  id: number;
  name: string;
  phone: string;
  email: string | null;
}

interface SupplierFormData {
  name: string;
  phone: string;
  email: string;
}

const SupplierManagement: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { callApi } = useApi<Supplier[]>();
  const [systemId] = useSelectedSystemId();

  const fetchSuppliers = React.useCallback(async () => {
    try {
      const response = await callApi('get', `/supermarket/${systemId}/suppliers/`);
      setSuppliers(response ?? []);
    } catch  {
      setError('Failed to fetch suppliers');
    }
  }, [setError, systemId]);

  useEffect(() => {
    fetchSuppliers();
  }, []);
  
  // Display success/error messages
  useEffect(() => {
    if (error) message.error(error);
  }, [error]);
  
  useEffect(() => {
    if (success) message.success(success);
  }, [success]);

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: SupplierFormData) => {
    setError(null);
    setSuccess(null);
    try {
      if (editingSupplier) {
        await callApi('patch', `supermarket/${systemId}/suppliers/${editingSupplier.id}/`, values);
        setSuccess('Supplier updated successfully');
      } else {
        await callApi('post', `supermarket/${systemId}/suppliers/`, values);
        setSuccess('Supplier added successfully');
      }
      setIsModalOpen(false);
      fetchSuppliers();
      resetForm();
    } catch  {
      setError('Operation failed. Please try again.');
    }
  };

  const handleDelete = async (supplierId: number) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await callApi('delete', `supermarket/${systemId}/suppliers/${supplierId}/`);
        setSuccess('Supplier deleted successfully');
        fetchSuppliers();
      } catch  {
        setError('Failed to delete supplier');
      }
    }
  };

  const resetForm = () => {
    setEditingSupplier(null);
  };

  return (
    <div style={{ padding: 24 }}>
      <Header
        title="Supplier Management"
        breadcrumbs={[
          { title: 'Supermarket', path: '/supermarket' },
          { title: 'Suppliers' }
        ]}
        actions={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            Add Supplier
          </Button>
        }
      />

      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {suppliers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>
            <Typography.Title level={4}>No suppliers found</Typography.Title>
            <Typography.Text>Click the "Add Supplier" button to add your first supplier</Typography.Text>
          </div>
        ) : suppliers.map((supplier) => (
          <Card 
            key={supplier.id || supplier.name + supplier.phone}
            title={
              <Space>
                <ShopOutlined /> 
                <span>{supplier.name}</span>
              </Space>
            }
            actions={[
              <Button 
                icon={<EditOutlined />} 
                type="link"
                onClick={() => handleEdit(supplier)}
              >
                Edit
              </Button>,
              <Button 
                icon={<DeleteOutlined />} 
                type="link" 
                danger
                onClick={() => handleDelete(supplier.id)}
              >
                Delete
              </Button>
            ]}
          >
            {supplier.phone && <p><PhoneOutlined /> {supplier.phone}</p>}
            {supplier.email && <p><MailOutlined /> {supplier.email}</p>}
          </Card>
        ))}
      </div>

      <Modal
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item 
            label="Name"
            name="name"
            rules={[{ required: !editingSupplier, message: 'Please enter supplier name' }]}
          >
            <Input
              placeholder="Enter supplier name"
            />
          </Form.Item>
          <Form.Item 
            label="Phone"
            name="phone"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!editingSupplier && !value && !getFieldValue('email')) {
                    return Promise.reject(new Error('Please enter either phone or email'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input
              placeholder="Enter phone number"
              prefix={<PhoneOutlined />}
            />
          </Form.Item>
          <Form.Item 
            label="Email"
            name="email"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!editingSupplier && !value && !getFieldValue('phone')) {
                    return Promise.reject(new Error('Please enter either phone or email'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input
              type="email"
              placeholder="Enter email address"
              prefix={<MailOutlined />}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button 
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="primary"
                htmlType="submit"
              >
                {editingSupplier ? 'Update' : 'Add'} Supplier
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SupplierManagement;