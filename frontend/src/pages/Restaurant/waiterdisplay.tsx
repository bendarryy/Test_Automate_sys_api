import { useState } from 'react';
import '../../styles/waiterdisplay.css';

interface Order {
  id: number;
  tableNumber: string;
  status: 'new' | 'preparing' | 'ready' | 'delivered';
  items: {
    name: string;
    quantity: number;
    notes?: string;
  }[];
  timeReceived: string;
  estimatedTime?: string;
}

const WaiterDisplay = () => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1,
      tableNumber: 'T5',
      status: 'new',
      items: [
        { name: 'Grilled Chicken', quantity: 2 },
        { name: 'Greek Salad', quantity: 1, notes: 'No olives' }
      ],
      timeReceived: '16:05',
      estimatedTime: '10 min'
    },
    {
      id: 2,
      tableNumber: 'T3',
      status: 'preparing',
      items: [
        { name: 'Beef Burger', quantity: 1 },
        { name: 'French Fries', quantity: 2 },
        { name: 'Cola', quantity: 2 }
      ],
      timeReceived: '16:00',
      estimatedTime: '5 min'
    },
    {
      id: 3,
      tableNumber: 'T8',
      status: 'ready',
      items: [
        { name: 'Margherita Pizza', quantity: 1 },
        { name: 'Water', quantity: 2 }
      ],
      timeReceived: '15:55'
    }
  ]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'new': return 'status-new';
      case 'preparing': return 'status-preparing';
      case 'ready': return 'status-ready';
      case 'delivered': return 'status-delivered';
      default: return '';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'new': return 'New';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready to Serve';
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
    <div className="waiter-display">
      <header className="display-header">
        <h1>Waiter Display</h1>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-label">New Orders</span>
            <span className="stat-value">{orders.filter(o => o.status === 'new').length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Preparing</span>
            <span className="stat-value">{orders.filter(o => o.status === 'preparing').length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Ready to Serve</span>
            <span className="stat-value">{orders.filter(o => o.status === 'ready').length}</span>
          </div>
        </div>
      </header>

      <div className="orders-grid">
        {orders.filter(order => order.status !== 'delivered').map(order => (
          <div key={order.id} className={`order-card ${getStatusColor(order.status)}`}>
            <div className="order-header">
              <div className="table-number">{order.tableNumber}</div>
              <div className="order-time">
                <span className="time-label">Order Time:</span>
                <span className="time-value">{order.timeReceived}</span>
              </div>
            </div>

            <div className="order-status">
              <span className="status-indicator"></span>
              <span className="status-text">{getStatusText(order.status)}</span>
              {order.estimatedTime && (
                <span className="estimated-time">({order.estimatedTime})</span>
              )}
            </div>

            <div className="order-items">
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

            {order.status === 'ready' && (
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

export default WaiterDisplay;
