import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Skeleton, Divider } from 'antd';
import Header from '../../../../components/Header';
import { useOrders } from '../../hooks/useOrders';
import { useGetMenuList } from '../../hooks/useGetMenuList';
import { useSelectedSystemId } from '../../../../shared/hooks/useSelectedSystemId';
import OrderDetails from './components/OrderDetails';
import { Order, OrderStatus } from './types/order'; // Added import for Order and OrderStatus


const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [systemId] = useSelectedSystemId();
  const navigate = useNavigate();
  const { data: order, loading, getOrderDetails, updateOrderStatus, updateOrder, createOrderItem, deleteOrderItem } = useOrders(systemId || "");
  const { menuItems, getMenu } = useGetMenuList(Number(systemId));

  React.useEffect(() => {
    if (orderId) {
      getOrderDetails(orderId);
    }
    getMenu();
  }, [orderId]);

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<Order>>({});
  const [newItem, setNewItem] = useState<{ menu_item: number; quantity: number }>({ menu_item: 0, quantity: 1 });

  const handleEditClick = () => {
    setEditedData({
      customer_name: order?.customer_name,
      table_number: order?.table_number,
      waiter: order?.waiter
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (orderId) {
        await updateOrder(orderId, editedData);
        getOrderDetails(orderId);
        setIsEditing(false);
      }
    } catch {
      // handle error
    }
  };

  const handleStatusChange = async (status: OrderStatus) => { // Changed type from string to OrderStatus
    if (!orderId) return;
    try {
      await updateOrderStatus(orderId, status);
      getOrderDetails(orderId);
    } catch {
      // handle error
    }
  };

  const handleAddItem = async () => {
    try {
      if (orderId && newItem.menu_item > 0) {
        await createOrderItem(orderId, {
          menu_item: Number(newItem.menu_item),
          quantity: newItem.quantity
        });
        getOrderDetails(orderId);
        setNewItem({ menu_item: 0, quantity: 1 });
      }
    } catch {
      // handle error
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      if (orderId) {
        await deleteOrderItem(orderId, itemId);
        getOrderDetails(orderId);
      }
    } catch {
      // handle error
    }
  };

  if (loading || !order) return (
    <div style={{ padding: '24px' }}>
      <Header
        title="Order Details"
        breadcrumbs={[
          { title: 'Restaurant', path: '/restaurant' },
          { title: 'Orders', path: '/orders' },
          { title: 'Loading...' }
        ]}
        actions={
          <Button onClick={() => navigate('/orders')}>
            Back to Orders
          </Button>
        }
      />
      <div style={{ marginTop: 16 }}>
        <Skeleton active paragraph={{ rows: 4 }} />
        <Divider />
        <Skeleton active paragraph={{ rows: 3 }} />
        <Divider />
        <Skeleton.Button active style={{ width: 200 }} />
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Header
        title={`Order #${order.id}`}
        breadcrumbs={[
          { title: 'Restaurant', path: '/restaurant' },
          { title: 'Orders', path: '/orders' },
          { title: `Order #${order.id}` }
        ]}
        actions={
          <Button onClick={() => navigate('/orders')}>
            Back to Orders
          </Button>
        }
      />
      <OrderDetails
        order={order as Order} // Cast order to the imported Order type if useOrders returns a more generic one
        isEditing={isEditing}
        editedData={editedData}
        onEditClick={handleEditClick}
        onSave={handleSave}
        onEditChange={setEditedData}
        onStatusChange={handleStatusChange}
        onAddItem={handleAddItem}
        onDeleteItem={handleDeleteItem}
        newItem={newItem}
        setNewItem={setNewItem}
        menuItems={menuItems || []}
      />
    </div>
  );
};

export default OrderDetailsPage;
