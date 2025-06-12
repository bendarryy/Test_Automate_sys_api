import React from 'react';
import { Space, Statistic, Tooltip, Button, Spin, Alert } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import Header from 'shared/componanets/Header';
import { useDeliveryDisplay } from './hooks/useDeliveryDisplay';
import ReadyOrdersSection from './components/ReadyOrdersSection';
import OutForDeliverySection from './components/OutForDeliverySection';
import styles from './deliverydisplay.module.css';

const DeliveryDisplay: React.FC = () => {
  const {
    isLoading,
    error,
    readyOrders,
    outForDeliveryOrders,
    refresh,
    updatingOrderId,
    handleStatusChange,
    handleRevertStatus,
  } = useDeliveryDisplay();

  return (
    <div className={styles.container}>
      {isLoading && (
        <div className={styles.centered}>
          <Spin size="large" />
        </div>
      )}
      {error && (
        <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
      )}
      <Header
        title="Delivery Display"
        breadcrumbs={[
          { title: 'Restaurant', path: '/restaurant' },
          { title: 'Delivery' },
        ]}
        actions={
          <Space size="large">
            <Statistic title="Ready Orders" value={readyOrders.length} valueStyle={{ color: '#1890ff' }} />
            <Statistic title="Out for Delivery" value={outForDeliveryOrders.length} valueStyle={{ color: '#faad14' }} />
            <Tooltip title="Refresh Orders">
              <Button icon={<ReloadOutlined />} onClick={refresh} size="large" />
            </Tooltip>
          </Space>
        }
      />
      <div className={styles.sectionsWrapper}>
        <ReadyOrdersSection
          orders={readyOrders}
          isLoading={isLoading}
          updatingOrderId={updatingOrderId}
          onStatusChange={handleStatusChange}
        />
        <OutForDeliverySection
          orders={outForDeliveryOrders}
          isLoading={isLoading}
          updatingOrderId={updatingOrderId}
          onStatusChange={handleStatusChange}
          onRevertStatus={handleRevertStatus}
        />
      </div>
    </div>
  );
};

export default DeliveryDisplay;
