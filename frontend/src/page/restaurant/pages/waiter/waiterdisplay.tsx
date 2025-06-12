import React from 'react';
import { Spin, Alert } from 'antd';
import Header from '../../../../shared/componanets/Header';
import StatusStatistics from './components/StatusStatistics';
import ReadyOrdersSection from './components/ReadyOrdersSection';
import ServedOrdersSection from './components/ServedOrdersSection';
import { useWaiterDisplay } from './hooks/useWaiterDisplay';
import './waiterStyles.css';

const WaiterDisplay: React.FC = () => {
  const {
    readyOrders,
    servedOrders,
    fetchOrders,
    orderLoading,
    orderError,
    statusUpdatingId,
    handleOrderStatusChange,
    handleRevertStatus,
  } = useWaiterDisplay();

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div style={{ margin: '0 auto', padding: 24, height: '100%' }}>
      {/* Loading Spinner */}
      {orderLoading && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <Spin size="large" />
        </div>
      )}
      {/* Error Alert */}
      {orderError && (
        <Alert message={orderError} type="error" showIcon style={{ marginBottom: 16 }} />
      )}
      <Header 
        title="Waiter Display"
        breadcrumbs={[
          { title: 'Restaurant', path: '/restaurant' },
          { title: 'Waiter' }
        ]}
        actions={
          <StatusStatistics
            readyCount={readyOrders.length}
            servedCount={servedOrders.length}
            onRefresh={fetchOrders}
          />
        }
      />
      <div style={{ display: 'flex', gap: 24, height: 'calc(100% - 100px)', alignItems: 'start' }}>
        <ReadyOrdersSection
          orders={readyOrders}
          orderLoading={orderLoading}
          statusUpdatingId={statusUpdatingId}
          onStatusChange={handleOrderStatusChange}
        />
        <ServedOrdersSection
          orders={servedOrders}
          orderLoading={orderLoading}
          statusUpdatingId={statusUpdatingId}
          onStatusChange={handleOrderStatusChange}
          onRevert={handleRevertStatus}
        />
      </div>
    </div>
  );
};

export default WaiterDisplay;
