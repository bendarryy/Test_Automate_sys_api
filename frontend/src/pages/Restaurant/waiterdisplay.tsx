import React, { useMemo } from 'react';
import { useWaiter } from '../../hooks/useWaiter';
import { Button, Tooltip, Empty, message, Statistic, Row, Col, Space, Modal } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import OrderCard from '../../components/OrderCard';
import { ClockCircleTwoTone, CheckCircleTwoTone } from '@ant-design/icons';

import 'swiper/swiper-bundle.css';
import './waiterStyles.css';

const SYSTEM_ID = localStorage.getItem('selectedSystemId') ?? '';


const WaiterDisplay: React.FC = () => {
  const [statusUpdatingId, setStatusUpdatingId] = React.useState<number | null>(null);
  
  const { orders, patchOrderStatus, fetchOrders } = useWaiter(SYSTEM_ID);

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
      fetchOrders();
    } catch {
      message.error('Failed to update order status');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleRevertStatus = async (orderId: number) => {
    Modal.confirm({
      title: 'Confirm Revert',
      content: 'This order will be moved back to Ready section',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setStatusUpdatingId(orderId);
          await patchOrderStatus(orderId, 'ready');
          message.success('Order reverted successfully');
          fetchOrders();
        } catch {
          message.error('Error reverting order');
        } finally {
          setStatusUpdatingId(null);
        }
      }
    });
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24, height: '100%' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 32 }} gutter={[16, 16]}>
        <Col>
          <h1 style={{ margin: 0, fontWeight: 700, fontSize: 32 }}>Waiter Display</h1>
        </Col>
        <Col>
          <Space size="large">
            <Statistic title="Ready Orders" value={readyOrders.length} valueStyle={{ color: '#1890ff' }} />
            <Statistic title="Served Orders" value={servedOrders.length} valueStyle={{ color: '#faad14' }} />
            <Tooltip title="Refresh Orders">
              <Button icon={<ReloadOutlined />} onClick={fetchOrders} size="large" />
            </Tooltip>
          </Space>
        </Col>
      </Row>

      <div style={{ display: 'flex', gap: 24, height: 'calc(100% - 100px)', alignItems: 'start' }}>
        {/* قسم الطلبات الجاهزة - أفقي (75%) */}
        <div style={{ flex: 3, minWidth: 0 }}>
          <h2 style={{ color: '#1890ff', marginBottom: 16 }}>
            <ClockCircleTwoTone twoToneColor="#1890ff" style={{ marginLeft: 8 }} />
            Ready Orders
          </h2>
          
          {readyOrders.length > 0 ? (
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
                  <SwiperSlide key={order.id} style={{ width: 300, height: '100%' }}>
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
        <div style={{ flex: 1, minWidth: 0 ,display: 'flex', flexDirection: 'column', height: '100%'}}>
          <h2 style={{ color: '#faad14', marginBottom: 16 }}>
            <CheckCircleTwoTone twoToneColor="#faad14" style={{ marginLeft: 8 }} />
            Served Orders
          </h2>
          <div className="custom-scrollbar">
          {servedOrders.length > 0 ? (
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 16,
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
