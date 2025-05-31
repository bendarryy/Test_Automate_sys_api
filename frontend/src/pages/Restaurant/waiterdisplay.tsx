import React, { useMemo } from 'react';
import { useWaiter } from '../../hooks/useWaiter';
import { Button, Tooltip, Empty,  Statistic, Space, Spin, Alert, Skeleton } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import Header from '../../components/Header';
import { Swiper, SwiperSlide } from 'swiper/react';
import OrderCard from '../../components/OrderCard';
import { ClockCircleTwoTone, CheckCircleTwoTone } from '@ant-design/icons';
import { App as AntdApp } from 'antd';
import 'swiper/swiper-bundle.css';
import './waiterStyles.css';

const SYSTEM_ID = localStorage.getItem('selectedSystemId') ?? '';


const WaiterDisplay: React.FC = () => {
  const { message, modal } = AntdApp.useApp();
  console.log('SYSTEM_ID:', SYSTEM_ID);
  const [statusUpdatingId, setStatusUpdatingId] = React.useState<number | null>(null);
  const { orders, patchOrderStatus, fetchOrders, orderLoading, orderError } = useWaiter(SYSTEM_ID);

  // Fetch orders automatically on mount
  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Debugging logs
  console.log('orders:', orders);
  console.log('orderLoading:', orderLoading);
  console.log('orderError:', orderError);

  // تصنيف الطلبات
  const [readyOrders, servedOrders] = useMemo(() => {
    const ready = orders
      .filter(o => o.status === 'ready')
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    
    const served = orders
      .filter(o => o.status === 'served')
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    
    return [ready, served];
  }, [orders]);

  const handleOrderStatusChange = async (orderId: number, newStatus: string) => {
    setStatusUpdatingId(orderId);
    try {
      await patchOrderStatus(orderId, newStatus);
      message.success('Order status updated successfully');
    } catch {
      message.error('Failed to update order status');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleRevertStatus = async (orderId: number) => {
    modal.confirm({
      title: 'Confirm Revert',
      content: 'This order will be moved back to Ready section',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setStatusUpdatingId(orderId);
          await patchOrderStatus(orderId, 'ready');
          message.success('Order reverted successfully');
        } catch {
          message.error('Error reverting order');
        } finally {
          setStatusUpdatingId(null);
        }
      }
    });
  };

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
          <Space size="large">
            <Statistic title="Ready Orders" value={readyOrders.length} valueStyle={{ color: '#1890ff' }} />
            <Statistic title="Served Orders" value={servedOrders.length} valueStyle={{ color: '#faad14' }} />
            <Tooltip title="Refresh Orders">
              <Button icon={<ReloadOutlined />} onClick={fetchOrders} size="large" />
            </Tooltip>
          </Space>
        }
      />

      <div style={{ display: 'flex', gap: 24, height: 'calc(100% - 100px)', alignItems: 'start' }}>
        {/* قسم الطلبات الجاهزة - أفقي (75%) */}
        <div style={{ flex: 2, minWidth: 0 }}>
          <h2 style={{ color: '#1890ff', marginBottom: 16 }}>
            <ClockCircleTwoTone twoToneColor="#1890ff" style={{ marginLeft: 8 }} />
            Ready Orders
          </h2>
          
          {orderLoading ? (
            <div style={{
              display: 'flex',
              gap: 16,
              padding: 16,
              background: '#f0f9ff',
              borderRadius: 12,
              height: '100%',
              width: '100%',
              overflow: 'hidden',
              maxHeight: 400
            }}>
              {[...Array(3)].map((_, idx) => (
                <Skeleton.Button
                  key={idx}
                  active
                  style={{ width: 300, height: 320, borderRadius: 12, overflow: 'hidden' }}
                />
              ))}
            </div>
          ) : readyOrders.length > 0 ? (
            <div style={{ 
              background: '#f0f9ff', 
              borderRadius: 12, 
              padding: 16, 
              height: '100%',
              width: '100%' 
            }}>
              <Swiper 
                spaceBetween={16} 
                slidesPerView={'auto'}
                freeMode={true}
                direction="horizontal"
                style={{ height: '100%', padding: '8px 0' }}
              >
                {readyOrders.map(order => (
                  <SwiperSlide key={order.id} style={{ width: 370, height: '100%' }}>
                    <div style={{ height: '100%', paddingRight: 16 }}>
                      <OrderCard 
                        order={order} 
                        isUpdating={statusUpdatingId === order.id}
                        onStatusChange={(newStatus) => handleOrderStatusChange(order.id, newStatus)}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : (
            <Empty description="No orders available" style={{ marginTop: 24 }} />
          )}
        </div>

        {/* قسم الطلبات المقدمة - عمودي (25%) */}
        <div style={{ flex: 1.5, minWidth: 0 ,display: 'flex', flexDirection: 'column', height: '100%'}}>
          <h2 style={{ color: '#faad14', marginBottom: 16 }}>
            <CheckCircleTwoTone twoToneColor="#faad14" style={{ marginLeft: 8 }} />
            Served Orders
          </h2>
          <div className="custom-scrollbar">
          {orderLoading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gridTemplateRows: 'repeat(3, 1fr)',
              gap: 16,
              height: 'calc(100vh - 200px)',
              paddingRight: 4,
              overflow: 'hidden',
            }}>
              {[...Array(3)].map((_, idx) => (
                <Skeleton.Button
                  key={idx}
                  active
                  style={{ width: '100%', height: "100%", borderRadius: 12, overflow: 'hidden' }}
                />
              ))}
            </div>
          ) : servedOrders.length > 0 ? (
            <div style={{ 
              height: '100%',
              paddingRight: 4
            }}>
              {servedOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isUpdating={statusUpdatingId === order.id}
                  onStatusChange={(newStatus) => {
                    if (newStatus === 'ready') {
                      handleRevertStatus(order.id);
                    } else {
                      handleOrderStatusChange(order.id, newStatus);
                    }
                  }}
                  showRevertButton={true}
                />
              ))}
            </div>
          ) : (
            <Empty description="No orders available" style={{ marginTop: 24 }} />
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaiterDisplay;
