import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useParams, Link, Outlet } from 'react-router-dom';

interface KitchenOrder {
  id: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'canceled';
  // Add other relevant fields as needed
}

const KdsPage: React.FC = () => {
  // Use dynamic systemId from URL if present
  const params = useParams<{ systemId: string }>();
  // Prefer systemId from URL, else from localStorage, else fallback to '5'
  const systemId = params.systemId || localStorage.getItem('selectedSystemId');
  const { /* data, */ loading, error, callApi } = useApi<KitchenOrder[]>();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [updating, setUpdating] = useState<number | null>(null);

  // Status options for orders
  const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'completed', label: 'Completed' },
    { value: 'canceled', label: 'Canceled' },
  ];

  // Helper to refetch orders
  const fetchOrders = () => {
    if (systemId) {
      callApi('get', `/restaurant/${systemId}/kitchen/orders/`)
        .then(setOrders)
        .catch(() => {});
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [systemId]);

  const handleStatusUpdate = async (id: number, status: 'preparing' | 'ready' | 'completed' | 'canceled') => {
    if (!systemId) return;
    setUpdating(id);
    try {
      await callApi('patch', `/restaurant/${systemId}/kitchen/orders/${id}/`, { status });
      fetchOrders(); // Refetch after status update
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 fw-bold text-primary display-5">
        <i className="bi bi-display"></i> Kitchen Display System <span className="text-dark">(KDS)</span>
      </h2>
      {loading && <div className="alert alert-info">Loading orders, please wait...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle text-center shadow rounded">
          <thead className="table-primary">
            <tr>
              <th className="fs-5">Order #</th>
              <th className="fs-5">Status</th>
              <th className="fs-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && !loading && (
              <tr>
                <td colSpan={3} className="text-muted py-4 fs-4">No kitchen orders found.</td>
              </tr>
            )}
            {orders.map(order => (
              <tr key={order.id}>
                <td className="fw-bold">{order.id}</td>
                <td>
                  <span className={
                    order.status === 'pending' ? 'badge bg-warning text-dark fs-6 px-3 py-2' :
                    order.status === 'preparing' ? 'badge bg-info text-dark fs-6 px-3 py-2' :
                    order.status === 'ready' ? 'badge bg-success fs-6 px-3 py-2' :
                    order.status === 'completed' ? 'badge bg-secondary fs-6 px-3 py-2' :
                    order.status === 'canceled' ? 'badge bg-danger fs-6 px-3 py-2' :
                    'badge bg-light text-dark fs-6 px-3 py-2'
                  }>
                    {STATUS_OPTIONS.find(opt => opt.value === order.status)?.label || order.status}
                  </span>
                </td>
                <td>
                  <div className="d-flex flex-wrap justify-content-center gap-2">
                    <Link
                      className="btn btn-outline-primary btn-sm"
                      to={`/kds/${systemId}/order/${order.id}`}
                      title="View Order Details"
                    >
                      <i className="bi bi-eye"></i> Details
                    </Link>
                    {order.status === 'pending' && (
                      <button
                        className="btn btn-sm btn-info fw-bold text-white shadow"
                        onClick={() => handleStatusUpdate(order.id, 'preparing')}
                        disabled={updating === order.id}
                      >
                        <i className="bi bi-hourglass-split me-1"></i> Start Preparing
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        className="btn btn-sm btn-success fw-bold shadow"
                        onClick={() => handleStatusUpdate(order.id, 'ready')}
                        disabled={updating === order.id}
                      >
                        <i className="bi bi-check2-circle me-1"></i> Mark as Ready
                      </button>
                    )}
                    {order.status === 'ready' && <span className="text-success fw-bold fs-5"><i className="bi bi-check-circle"></i> Ready</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Outlet />
    </div>
  );
};

export default KdsPage;
