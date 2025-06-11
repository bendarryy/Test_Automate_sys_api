import React, { useState } from 'react';
import { Layout, Row, Col, Typography, Button, Modal, message, ConfigProvider } from 'antd';
import { useGoodsReceiving } from './hooks/useGoodsReceiving';
import GoodsReceivingTable from './components/GoodsReceivingTable';
import GoodsReceivingForm from './components/GoodsReceivingForm';
import { useSelectedSystemId } from '../../../../shared/hooks/useSelectedSystemId';
import { createGoodsReceiving, updateGoodsReceiving, deleteGoodsReceiving } from './utils/api';
import { GoodsReceiving } from './types/purchase';

const { Title } = Typography;
const { Header, Content, Footer } = Layout;

const GoodsReceivingPage: React.FC = () => {
  const [systemId] = useSelectedSystemId();
  const { records, loading, error } = useGoodsReceiving(systemId || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editRecord, setEditRecord] = useState<GoodsReceiving | null>(null);

  const handleCreate = async (data: Partial<GoodsReceiving>) => {
    setFormLoading(true);
    try {
      await createGoodsReceiving(systemId || '', {
        ...data,
        received_date: data.received_date ,
        expiry_date: data.expiry_date ,
      });
      message.success('Goods receiving record saved');
      setModalOpen(false);
      setEditRecord(null);
      window.location.reload();
    } catch (e: any) {
      message.error(e.message || 'Error saving record');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (record: GoodsReceiving) => {
    setEditRecord(record);
    setModalOpen(true);
  };

  const handleDelete = async (record: GoodsReceiving) => {
    setFormLoading(true);
    try {
      await deleteGoodsReceiving(systemId || '', record.id);
      message.success('Record deleted');
      window.location.reload();
    } catch (e: any) {
      message.error(e.message || 'Error deleting record');
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
          <Title level={2} style={{ margin: 0 }}>Goods Receiving</Title>
        </Header>
        <Content style={{ padding: 24 }}>
          <Row justify="end" style={{ marginBottom: 16 }}>
            <Col>
              <Button type="primary" onClick={() => { setModalOpen(true); setEditRecord(null); }}>+ New Goods Receiving</Button>
            </Col>
          </Row>
          <GoodsReceivingTable
            records={records}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <Modal
            open={modalOpen}
            title={editRecord ? 'Edit Goods Receiving' : 'New Goods Receiving'}
            onCancel={() => { setModalOpen(false); setEditRecord(null); }}
            footer={null}
            destroyOnClose
          >
            <GoodsReceivingForm
              initial={editRecord || {}}
              onSubmit={handleCreate}
              onCancel={() => { setModalOpen(false); setEditRecord(null); }}
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

export default GoodsReceivingPage;
