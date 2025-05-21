import React, { useState, useEffect } from 'react';
import '../../styles/deliverydisplay.css';

// Mock data for testing
const mockDeliveryOrders: DeliveryOrder[] = [
  {
    id: 1,
    customer_name: "Ahmed Mohamed",
    address: "123 Main St, Cairo",
    phone: "01234567890",
    status: "new",
    items: [
      { id: 1, name: "Pizza", quantity: 2, price: 12.99 },
      { id: 2, name: "Coke", quantity: 2, price: 2.99 }
    ],
    total_price: 31.96,
    created_at: "2024-03-20T10:00:00Z",
    estimated_delivery_time: "30 mins"
  },
  {
    id: 2,
    customer_name: "Mohamed Ali",
    address: "456 Park Ave, Giza",
    phone: "01123456789",
    status: "assigned",
    items: [
      { id: 3, name: "Burger", quantity: 1, price: 8.99 },
      { id: 4, name: "Fries", quantity: 1, price: 3.99 }
    ],
    total_price: 12.98,
    created_at: "2024-03-20T10:15:00Z",
    estimated_delivery_time: "25 mins"
  }
];

interface DeliveryOrder {
  id: number;
  customer_name: string;
  address: string;
  phone: string;
  status: 'new' | 'assigned' | 'picked' | 'delivered';
  items: OrderItem[];
  total_price: number;
  created_at: string;
  estimated_delivery_time: string;
}

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

const DeliveryDisplay: React.FC = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>(mockDeliveryOrders);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customer_name: '',
    address: '',
    phone: '',
    items: [{ name: '', quantity: 1, price: 0 }]
  });
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    completed: 0
  });

  // Update stats when orders change
  useEffect(() => {
    const newStats = {
      total: orders.length,
      new: orders.filter(order => order.status === 'new').length,
      inProgress: orders.filter(order => order.status === 'assigned' || order.status === 'picked').length,
      completed: orders.filter(order => order.status === 'delivered').length
    };
    setStats(newStats);
  }, [orders]);

  const updateOrderStatus = (orderId: number, newStatus: DeliveryOrder['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const createNewOrder = () => {
    const newOrder: DeliveryOrder = {
      id: orders.length + 1,
      customer_name: "New Customer",
      address: "New Address",
      phone: "New Phone",
      status: "new",
      items: [],
      total_price: 0,
      created_at: new Date().toISOString(),
      estimated_delivery_time: "30 mins"
    };
    setOrders([...orders, newOrder]);
  };

  const handleNewOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total_price = newOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const order: DeliveryOrder = {
      id: orders.length + 1,
      customer_name: newOrder.customer_name,
      address: newOrder.address,
      phone: newOrder.phone,
      status: 'new',
      items: newOrder.items.map((item, index) => ({
        id: index + 1,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      total_price,
      created_at: new Date().toISOString(),
      estimated_delivery_time: '30 mins'
    };

    setOrders([...orders, order]);
    setShowNewOrderForm(false);
    setNewOrder({
      customer_name: '',
      address: '',
      phone: '',
      items: [{ name: '', quantity: 1, price: 0 }]
    });
  };

  const addNewItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { name: '', quantity: 1, price: 0 }]
    });
  };

  const removeItem = (index: number) => {
    setNewOrder({
      ...newOrder,
      items: newOrder.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const updatedItems = [...newOrder.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  const calculateTotal = () => {
    return newOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <div className="delivery-display">
      <div className="display-header">
        <div className="header-top">
          <h1>Delivery Management</h1>
          <button 
            className="create-order-button"
            onClick={() => setShowNewOrderForm(true)}
          >
            Create New Order
          </button>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat">
            <span className="stat-label">New Orders</span>
            <span className="stat-value">{stats.new}</span>
          </div>
          <div className="stat">
            <span className="stat-label">In Progress</span>
            <span className="stat-value">{stats.inProgress}</span>
          </div>
        </div>
      </div>

      {showNewOrderForm && (
        <div className="new-order-form">
          <h2>Create New Order</h2>
          <form onSubmit={handleNewOrderSubmit}>
            <div className="form-sections">
              <div className="customer-section">
                <h3>Customer Information</h3>
                <div className="form-group">
                  <label>Customer Name:</label>
                  <input
                    type="text"
                    value={newOrder.customer_name}
                    onChange={(e) => setNewOrder({...newOrder, customer_name: e.target.value})}
                    required
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="form-group">
                  <label>Phone:</label>
                  <input
                    type="tel"
                    value={newOrder.phone}
                    onChange={(e) => setNewOrder({...newOrder, phone: e.target.value})}
                    required
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="form-group">
                  <label>Address:</label>
                  <input
                    type="text"
                    value={newOrder.address}
                    onChange={(e) => setNewOrder({...newOrder, address: e.target.value})}
                    required
                    placeholder="Enter delivery address"
                  />
                </div>
              </div>

              <div className="order-items-section">
                <div className="section-header">
                  <h3>Order Items</h3>
                  <button
                    type="button"
                    className="add-item-button"
                    onClick={addNewItem}
                  >
                    <span className="plus-icon">+</span> Add Item
                  </button>
                </div>

                <div className="items-table">
                  <div className="items-header">
                    <div className="item-name">Item Name</div>
                    <div className="item-quantity">Quantity</div>
                    <div className="item-price">Price</div>
                    <div className="item-total">Total</div>
                    <div className="item-actions"></div>
                  </div>

                  {newOrder.items.map((item, index) => (
                    <div key={index} className="order-item-input">
                      <input
                        type="text"
                        placeholder="Enter item name"
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        required
                        className="item-name-input"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                        min="1"
                        required
                        className="item-quantity-input"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                        min="0"
                        step="0.01"
                        required
                        className="item-price-input"
                      />
                      <div className="item-total">
                        ${(item.quantity * item.price).toFixed(2)}
                      </div>
                      <button
                        type="button"
                        className="remove-item-button"
                        onClick={() => removeItem(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="order-total-section">
                  <div className="total-label">Total Amount:</div>
                  <div className="total-value">${calculateTotal().toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button">Create Order</button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setShowNewOrderForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="orders-grid">
        {orders.map((order) => (
          <div 
            key={order.id} 
            className={`order-card status-${order.status}`}
            onClick={() => setSelectedOrder(order)}
          >
            <div className="order-header">
              <span className="order-number">Order #{order.id}</span>
              <div className="order-time">
                <span className="time-label">Created:</span>
                <span className="time-value">
                  {new Date(order.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <div className="order-status">
              <div className={`status-indicator status-${order.status}`}></div>
              <span className="status-text">{order.status.toUpperCase()}</span>
            </div>

            <div className="customer-info">
              <h3>Customer Details</h3>
              <div className="info-item">
                <span className="info-label">Name:</span>
                <span className="info-value">{order.customer_name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone:</span>
                <span className="info-value">{order.phone}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Address:</span>
                <span className="info-value">{order.address}</span>
              </div>
            </div>

            <div className="order-items">
              <h3>Order Items</h3>
              {order.items.map((item) => (
                <div key={item.id} className="item">
                  <span className="item-quantity">{item.quantity}x</span>
                  <span className="item-name">{item.name}</span>
                  <span className="item-price">${item.price}</span>
                </div>
              ))}
              <div className="order-total">
                <span>Total: ${order.total_price}</span>
              </div>
            </div>

            <div className="order-actions">
              {order.status === 'new' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    updateOrderStatus(order.id, 'assigned');
                  }}
                  className="action-button"
                >
                  Assign Driver
                </button>
              )}
              {order.status === 'assigned' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    updateOrderStatus(order.id, 'picked');
                  }}
                  className="action-button"
                >
                  Mark as Picked
                </button>
              )}
              {order.status === 'picked' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    updateOrderStatus(order.id, 'delivered');
                  }}
                  className="action-button"
                >
                  Mark as Delivered
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryDisplay;
