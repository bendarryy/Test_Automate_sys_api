import { useState } from 'react';
import '../../styles/deliverydisplay.css';

interface DeliveryOrder {
  id: number;
  orderNumber: string;
  status: 'new' | 'assigned' | 'picked' | 'delivered';
  items: {
    name: string;
    quantity: number;
    notes?: string;
  }[];
  customerInfo: {
    name: string;
    address: string;
    phone: string;
  };
  timeReceived: string;
  estimatedDelivery?: string;
  driver?: string;
}

const DeliveryDisplay = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([
    {
      id: 1,
      orderNumber: '#ORD-001',
      status: 'new',
      items: [
        { name: 'Grilled Chicken', quantity: 2 },
        { name: 'Greek Salad', quantity: 1, notes: 'Extra dressing' }
      ],
      customerInfo: {
        name: 'John Smith',
        address: '123 Main St, Apt 4B',
        phone: '+1 234-567-8900'
      },
      timeReceived: '16:05',
      estimatedDelivery: '30-45 min'
    },
    {
      id: 2,
      orderNumber: '#ORD-002',
      status: 'assigned',
      items: [
        { name: 'Beef Burger', quantity: 1 },
        { name: 'French Fries', quantity: 2 },
        { name: 'Cola', quantity: 2 }
      ],
      customerInfo: {
        name: 'Sarah Wilson',
        address: '456 Oak Ave',
        phone: '+1 234-567-8901'
      },
      timeReceived: '16:00',
      estimatedDelivery: '15-25 min',
      driver: 'Mike Johnson'
    },
    {
      id: 3,
      orderNumber: '#ORD-003',
      status: 'picked',
      items: [
        { name: 'Margherita Pizza', quantity: 1 },
        { name: 'Water', quantity: 2 }
      ],
      customerInfo: {
        name: 'David Brown',
        address: '789 Pine St, Suite 3',
        phone: '+1 234-567-8902'
      },
      timeReceived: '15:55',
      estimatedDelivery: '5-10 min',
      driver: 'Tom Davis'
    }
  ]);

  const getStatusColor = (status: DeliveryOrder['status']) => {
    switch (status) {
      case 'new': return 'status-new';
      case 'assigned': return 'status-assigned';
      case 'picked': return 'status-picked';
      case 'delivered': return 'status-delivered';
      default: return '';
    }
  };

  const getStatusText = (status: DeliveryOrder['status']) => {
    switch (status) {
      case 'new': return 'New Order';
      case 'assigned': return 'Driver Assigned';
      case 'picked': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      default: return '';
    }
  };

  const handleOrderDelivered = (orderId: number) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: 'delivered' as const } : order
    ));
  };

  return (
    <div className="delivery-display">
      <header className="display-header">
        <h1>Delivery Display</h1>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-label">New Orders</span>
            <span className="stat-value">{orders.filter(o => o.status === 'new').length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Assigned</span>
            <span className="stat-value">{orders.filter(o => o.status === 'assigned').length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Out for Delivery</span>
            <span className="stat-value">{orders.filter(o => o.status === 'picked').length}</span>
          </div>
        </div>
      </header>

      <div className="orders-grid">
        {orders.filter(order => order.status !== 'delivered').map(order => (
          <div key={order.id} className={`order-card ${getStatusColor(order.status)}`}>
            <div className="order-header">
              <div className="order-number">{order.orderNumber}</div>
              <div className="order-time">
                <span className="time-label">Order Time:</span>
                <span className="time-value">{order.timeReceived}</span>
              </div>
            </div>

            <div className="order-status">
              <span className="status-indicator"></span>
              <span className="status-text">{getStatusText(order.status)}</span>
              {order.estimatedDelivery && (
                <span className="estimated-time">({order.estimatedDelivery})</span>
              )}
            </div>

            <div className="customer-info">
              <h3>Customer Details</h3>
              <div className="info-item">
                <span className="info-label">Name:</span>
                <span className="info-value">{order.customerInfo.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Address:</span>
                <span className="info-value">{order.customerInfo.address}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone:</span>
                <span className="info-value">{order.customerInfo.phone}</span>
              </div>
            </div>

            <div className="order-items">
              <h3>Order Items</h3>
              {order.items.map((item, index) => (
                <div key={index} className="item">
                  <span className="item-quantity">×{item.quantity}</span>
                  <span className="item-name">{item.name}</span>
                  {item.notes && (
                    <div className="item-notes">{item.notes}</div>
                  )}
                </div>
              ))}
            </div>

            {order.driver && (
              <div className="driver-info">
                <span className="driver-label">Driver:</span>
                <span className="driver-name">{order.driver}</span>
              </div>
            )}

            {order.status === 'picked' && (
              <button 
                className="deliver-button"
                onClick={() => handleOrderDelivered(order.id)}
              >
                Mark as Delivered
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryDisplay;
