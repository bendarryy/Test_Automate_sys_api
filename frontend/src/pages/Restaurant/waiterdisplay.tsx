import React, { useState, useEffect } from 'react';
import '../../styles/waiterdisplay.css';

// Mock data for testing
const mockTables: Table[] = [
  { number: 1, status: 'available' },
  { number: 2, status: 'occupied' },
  { number: 3, status: 'reserved' },
  { number: 4, status: 'available' },
  { number: 5, status: 'occupied' },
];

const mockOrders = [
  {
    id: 1,
    table_number: 2,
    status: 'preparing',
    items: [
      { id: 1, name: 'Pizza', quantity: 2, price: 12.99 },
      { id: 2, name: 'Coke', quantity: 2, price: 2.99 },
    ],
    created_at: '2024-03-20T10:00:00Z',
  },
  {
    id: 2,
    table_number: 5,
    status: 'ready',
    items: [
      { id: 3, name: 'Burger', quantity: 1, price: 8.99 },
      { id: 4, name: 'Fries', quantity: 1, price: 3.99 },
    ],
    created_at: '2024-03-20T10:15:00Z',
  },
];

interface Order {
  id: number;
  table_number: number;
  status: string;
  items: OrderItem[];
  created_at: string;
}

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface Table {
  number: number;
  status: 'available' | 'occupied' | 'reserved';
}

const WaiterDisplay: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    preparing: 0,
    ready: 0,
    completed: 0
  });

  // Update stats when orders change
  useEffect(() => {
    const newStats = {
      total: orders.length,
      preparing: orders.filter(order => order.status === 'preparing').length,
      ready: orders.filter(order => order.status === 'ready').length,
      completed: orders.filter(order => order.status === 'completed').length
    };
    setStats(newStats);
  }, [orders]);

  // Update selected order when orders change
  useEffect(() => {
    if (selectedOrder) {
      const updatedOrder = orders.find(order => order.id === selectedOrder.id);
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
    }
  }, [orders]);

  const updateOrderStatus = (orderId: number, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const createNewOrder = (tableNumber: number) => {
    const newOrder: Order = {
      id: orders.length + 1,
      table_number: tableNumber,
      status: 'new',
      items: [],
      created_at: new Date().toISOString(),
    };
    setOrders([...orders, newOrder]);
    setTables(tables.map(table => 
      table.number === tableNumber ? { ...table, status: 'occupied' } : table
    ));
  };

  const removeItemFromOrder = (orderId: number, itemId: number) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          items: order.items.filter(item => item.id !== itemId)
        };
      }
      return order;
    });
    setOrders(updatedOrders);
  };

  return (
    <div className="waiter-display">
      <div className="display-header">
        <div className="header-top">
          <h1>Restaurant Management</h1>
          <div className="header-stats">
            <div className="stat">
              <span className="stat-label">Total Orders</span>
              <span className="stat-value">{stats.total}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Preparing</span>
              <span className="stat-value">{stats.preparing}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Ready</span>
              <span className="stat-value">{stats.ready}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Completed</span>
              <span className="stat-value">{stats.completed}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="tables-section">
          <div className="section-header">
            <h2>Tables</h2>
            <div className="table-legend">
              <span className="legend-item available">Available</span>
              <span className="legend-item occupied">Occupied</span>
              <span className="legend-item reserved">Reserved</span>
            </div>
          </div>
          <div className="tables-grid">
            {tables.map((table) => (
              <div
                key={table.number}
                className={`table-card ${table.status}`}
                onClick={() => createNewOrder(table.number)}
              >
                <div className="table-number">Table {table.number}</div>
                <div className="table-status">
                  <span className={`status-indicator ${table.status}`}></span>
                  <span className="status-text">{table.status}</span>
                </div>
                {table.status === 'occupied' && (
                  <div className="table-actions">
                    <button className="action-button">View Order</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="orders-section">
          <div className="section-header">
            <h2>Active Orders</h2>
            <div className="order-filters">
              <button className="filter-button active">All</button>
              <button className="filter-button">Preparing</button>
              <button className="filter-button">Ready</button>
            </div>
          </div>
          <div className="orders-grid">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`order-card ${order.status} ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="order-header">
                  <div className="order-info">
                    <h3>Table {order.table_number}</h3>
                    <span className="order-time">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="order-status">
                    <span className={`status-indicator ${order.status}`}></span>
                    <span className="status-text">{order.status}</span>
                  </div>
                </div>

                <div className="order-items-preview">
                  {order.items.map((item, index) => (
                    <div key={item.id} className="preview-item">
                      <span className="item-quantity">{item.quantity}x</span>
                      <span className="item-name">{item.name}</span>
                    </div>
                  ))}
                </div>

                <div className="order-actions">
                  {order.status === 'new' && (
                    <button 
                      className="action-button preparing"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(order.id, 'preparing');
                      }}
                    >
                      Start Preparing
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button 
                      className="action-button ready"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(order.id, 'ready');
                      }}
                    >
                      Mark as Ready
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button 
                      className="action-button complete"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(order.id, 'completed');
                      }}
                    >
                      Complete Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedOrder && (
          <div className="order-details">
            <div className="details-header">
              <h2>Order Details - Table {selectedOrder.table_number}</h2>
              <button 
                className="close-button"
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>
            <div className="details-content">
              <div className="order-info">
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className={`info-value status-${selectedOrder.status}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Created:</span>
                  <span className="info-value">
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="items-list">
                <h3>Order Items</h3>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="item">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">{item.quantity}x</span>
                    </div>
                    <div className="item-price">
                      <span className="price">${item.price}</span>
                      <span className="total">${(item.quantity * item.price).toFixed(2)}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItemFromOrder(selectedOrder.id, item.id);
                      }}
                      className="remove-button"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div className="order-total">
                  <span className="total-label">Total:</span>
                  <span className="total-value">
                    ${selectedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaiterDisplay;
