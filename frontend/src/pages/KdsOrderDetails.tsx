import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  // Add more fields as needed
}

interface KitchenOrder {
  id: number;
  system: number;
  customer_name: string;
  table_number: string;
  waiter: string | null;
  total_price: string;
  status: 'pending' | 'preparing' | 'ready';
  order_items: OrderItem[];
  created_at: string;
  updated_at: string;
}

const KdsOrderDetails: React.FC = () => {
  const { systemId, orderId } = useParams<{ systemId: string; orderId: string }>();
  const { data: order, loading, error, callApi } = useApi<KitchenOrder>();
  const navigate = useNavigate();
  const [updating, setUpdating] = React.useState<'preparing' | 'ready' | null>(null);

  const updateStatus = async (status: 'preparing' | 'ready') => {
    if (!systemId || !orderId) return;
    setUpdating(status);
    try {
      await callApi('patch', `/restaurant/${systemId}/kitchen/orders/${orderId}/`, { status });
      // Re-fetch order after update
      await callApi('get', `/restaurant/${systemId}/kitchen/orders/${orderId}/`);
    } finally {
      setUpdating(null);
    }
  };

  React.useEffect(() => {
    if (systemId && orderId) {
      callApi('get', `/restaurant/${systemId}/kitchen/orders/${orderId}/`);
    }
    // eslint-disable-next-line
  }, [systemId, orderId]);

  return (
    <div className="container py-4">
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left"></i> Back to Orders
      </button>
      {loading && <div className="alert alert-info">Loading order details...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {order && (
        <div className="card shadow-lg">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <span className="fs-4 fw-bold">Order #{order.id}</span>
            <span className={
              order.status === 'pending' ? 'badge bg-warning text-dark fs-6 px-3 py-2' :
              order.status === 'preparing' ? 'badge bg-info text-dark fs-6 px-3 py-2' :
              'badge bg-success fs-6 px-3 py-2'
            }>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          <div className="card-body">
            <div className="mb-3 d-flex gap-2">
              {order.status === 'pending' && (
                <button
                  className="btn btn-info fw-bold text-white shadow"
                  onClick={() => updateStatus('preparing')}
                  disabled={updating === 'preparing'}
                >
                  <i className="bi bi-hourglass-split me-1"></i> Start Preparing
                </button>
              )}
              {order.status === 'preparing' && (
                <button
                  className="btn btn-success fw-bold shadow"
                  onClick={() => updateStatus('ready')}
                  disabled={updating === 'ready'}
                >
                  <i className="bi bi-check2-circle me-1"></i> Mark as Ready
                </button>
              )}
              {order.status === 'ready' && <span className="text-success fw-bold fs-5"><i className="bi bi-check-circle"></i> Ready</span>}
            </div>
            <div className="row mb-3">
              <div className="col-md-4">
                <div className="mb-2"><strong>Customer:</strong> {order.customer_name || <span className="text-muted">N/A</span>}</div>
                <div className="mb-2"><strong>Table:</strong> {order.table_number}</div>
                <div className="mb-2"><strong>Waiter:</strong> {order.waiter || <span className="text-muted">N/A</span>}</div>
              </div>
              <div className="col-md-4">
                <div className="mb-2"><strong>Total Price:</strong> <span className="text-success">${order.total_price}</span></div>
                <div className="mb-2"><strong>Created:</strong> {new Date(order.created_at).toLocaleString()}</div>
                <div className="mb-2"><strong>Updated:</strong> {new Date(order.updated_at).toLocaleString()}</div>
              </div>
              <div className="col-md-4 d-flex align-items-center justify-content-center">
                <i className="bi bi-receipt fs-1 text-primary"></i>
              </div>
            </div>
            <hr />
            <h5 className="mb-3">Order Items</h5>
            {order.order_items.length === 0 ? (
              <div className="alert alert-light text-center">No items in this order.</div>
            ) : (
              <table className="table table-sm table-bordered table-striped">
                <thead className="table-secondary">
                  <tr>
                    <th>Name</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {order.order_items.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KdsOrderDetails;
