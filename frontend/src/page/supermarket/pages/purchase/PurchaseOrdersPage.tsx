import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, message, Row, Col, Typography, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PurchaseOrdersTable } from './components/PurchaseOrdersTable';
import { PurchaseOrderForm } from './components/PurchaseOrderForm';
import { usePurchaseOrders } from './hooks/usePurchaseOrders';
import { PurchaseOrder } from './types/PurchaseOrder';
import { useSelectedSystemId } from '../../../../shared/hooks/useSelectedSystemId';
import { useSuppliers } from './hooks/useSuppliers';
import { useProducts } from './hooks/useProducts';

export const PurchaseOrdersPage: React.FC = () => {
  const [systemId] = useSelectedSystemId(); 
  const {
    data: orders = [],
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    clearCache,
  } = usePurchaseOrders(systemId);

  // Fetch suppliers and products from API
  const { data: suppliers = [], fetchSuppliers } = useSuppliers(systemId);
  const { data: products = [], fetchProducts } = useProducts(systemId);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
    fetchProducts();
    // eslint-disable-next-line
  }, [systemId]);

  const handleCreate = () => {
    setEditingOrder(null);
    setModalVisible(true);
  };

  const handleEdit = (order: PurchaseOrder) => {
    setEditingOrder(order);
    setModalVisible(true);
  };

  const handleDelete = async (order: PurchaseOrder) => {
    Modal.confirm({
      title: 'Delete Purchase Order',
      content: 'Are you sure you want to delete this order?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setSubmitting(true);
          await deleteOrder(order.id);
          message.success('Order deleted');
          fetchOrders();
        } catch {
          message.error('Failed to delete order');
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const handleFormSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      if (editingOrder) {
        await updateOrder(editingOrder.id, values);
        message.success('Order updated');
      } else {
        await createOrder(values);
        message.success('Order created');
      }
      setModalVisible(false);
      fetchOrders();
    } catch {
      message.error('Failed to save order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card style={{ margin: 24, borderRadius: 12, boxShadow: '0 2px 8px #f0f1f2' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Purchase Orders
          </Typography.Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} aria-label="Add Purchase Order">
            New Order
          </Button>
        </Col>
      </Row>
      <Space direction="vertical" style={{ width: '100%' }}>
        <PurchaseOrdersTable
          orders={orders || []}
          loading={loading || submitting}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {error && <Typography.Text type="danger">{error}</Typography.Text>}
      </Space>
      <Modal
        open={modalVisible}
        title={editingOrder ? 'Edit Purchase Order' : 'Create Purchase Order'}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
        aria-modal="true"
      >
        <PurchaseOrderForm
          initialValues={editingOrder || undefined}
          onSubmit={handleFormSubmit}
          submitting={submitting}
          suppliers={suppliers}
          products={products}
        />
      </Modal>
    </Card>
  );
};

export default PurchaseOrdersPage;
