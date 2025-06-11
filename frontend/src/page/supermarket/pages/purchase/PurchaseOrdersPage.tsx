import React, { useState } from 'react';
import { Layout, Row, Col, Typography, Button, Modal, message, ConfigProvider, theme } from 'antd';
import { usePurchaseOrders } from './hooks/usePurchaseOrders';
import PurchaseOrderTable from './components/PurchaseOrderTable';
import PurchaseOrderForm from './components/PurchaseOrderForm';
import { useSelectedSystemId } from 'shared/hooks/useSelectedSystemId';
import { createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } from './utils/api';
import { PurchaseOrder } from './types/purchase';

const { Title } = Typography;
const { Header, Content, Footer } = Layout;

const PurchaseOrdersPage: React.FC = () => {
  const [systemId] = useSelectedSystemId();
  const { orders, loading, error } = usePurchaseOrders(systemId || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editOrder, setEditOrder] = useState<PurchaseOrder | null>(null);

  const handleCreate = async (data: Partial<PurchaseOrder>) => {
    setFormLoading(true);
    try {
      await createPurchaseOrder(systemId || '', {
        ...data,
        order_date: data.order_date,
        expected_delivery_date: data.expected_delivery_date,
      });
      message.success('Purchase order saved');
      setModalOpen(false);
      setEditOrder(null);
      window.location.reload();
    } catch (e: any) {
      message.error(e.message || 'Error saving order');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (order: PurchaseOrder) => {
    setEditOrder(order);
    setModalOpen(true);
  };

  const handleDelete = async (order: PurchaseOrder) => {
    setFormLoading(true);
    try {
      await deletePurchaseOrder(systemId || '', order.id);
      message.success('Order deleted');
      window.location.reload();
    } catch (e: any) {
      message.error(e.message || 'Error deleting order');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
          fontSize: 16,
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#fff', borderBottom: '1px solid #eee' }}>
          <Title level={2} style={{ margin: 0 }}>Purchase Orders</Title>
        </Header>
        <Content style={{ padding: 24 }}>
          <Row justify="end" style={{ marginBottom: 16 }}>
            <Col>
              <Button type="primary" onClick={() => { setModalOpen(true); setEditOrder(null); }}>+ New Purchase Order</Button>
            </Col>
          </Row>
          <PurchaseOrderTable
            orders={orders}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <Modal
            open={modalOpen}
            title={editOrder ? 'Edit Purchase Order' : 'New Purchase Order'}
            onCancel={() => { setModalOpen(false); setEditOrder(null); }}
            footer={null}
            destroyOnClose
          >
            <PurchaseOrderForm
              initial={editOrder || {}}
              onSubmit={handleCreate}
              onCancel={() => { setModalOpen(false); setEditOrder(null); }}
              loading={formLoading}
            />
          </Modal>
        </Content>
        <Footer style={{ textAlign: 'center', background: '#fafafa' }}>
          <Typography.Text type="secondary">Supermarket System © {new Date().getFullYear()}</Typography.Text>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default PurchaseOrdersPage;
