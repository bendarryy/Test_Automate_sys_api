import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Select, notification, Divider, List, Tag, Typography, Button, Input, InputNumber, Skeleton } from 'antd';
import { useOrders } from '../../hooks/useOrders';
import { useGetMenuList } from '../../hooks/useGetMenuList';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title } = Typography;

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'canceled';

const statusColors: Record<OrderStatus, string> = {
  pending: 'orange',
  preparing: 'blue',
  ready: 'green',
  completed: 'gray',
  canceled: 'red'
} as const;

interface Order {
  id: string;
  customer_name: string;
  table_number: string;
  waiter?: number;
  status: OrderStatus;  // This must match the OrderStatus type
  total_price: number;
  profit: number;
  order_items: {
    id: string;
    menu_item: number;
    menu_item_name?: string;
    quantity: number;
  }[];
  created_at: string;
  updated_at: string;
  order_type?: 'in_house' | 'delivery'; // Order type: 'in_house' (default) or 'delivery'
}


const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const systemId = localStorage.getItem('selectedSystemId') || '';
  const { data: order, loading, getOrderDetails, updateOrderStatus, updateOrder, createOrderItem, deleteOrderItem } = useOrders(systemId);
  const { menuItems, getMenu } = useGetMenuList(Number(systemId));

  React.useEffect(() => {
    if (orderId) {
      getOrderDetails(orderId);
    }
    getMenu();
  }, [orderId]);

  const handleStatusChange = async (status: string) => {
    if (!orderId) return;
    try {
      await updateOrderStatus(orderId, status);
      notification.success({ message: 'Order status updated' });
      getOrderDetails(orderId);
    } catch (err: unknown) {
      const error = err as Error;
      notification.error({ message: 'Failed to update order status', description: error.message });
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<Order>>({});

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
        notification.success({ message: 'Order updated successfully' });
        getOrderDetails(orderId);
        setIsEditing(false);
      }
    } catch  {
      notification.error({ message: 'Failed to update order' });
    }
  };

  const [newItem, setNewItem] = useState({ menu_item: 0, quantity: 1 });

  const handleAddItem = async () => {
    try {
      if (orderId && newItem.menu_item > 0) {
        await createOrderItem(orderId, {
          menu_item: Number(newItem.menu_item),
          quantity: newItem.quantity
        });
        notification.success({ message: 'Item added successfully' });
        getOrderDetails(orderId);
        setNewItem({ menu_item: 0, quantity: 1 });
      } else {
        notification.warning({ message: 'Please enter a valid menu item ID' });
      }
    } catch {
      notification.error({ message: 'Failed to add item' });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      if (orderId) {
        await deleteOrderItem(orderId, itemId);
        notification.success({ message: 'Item removed' });
        getOrderDetails(orderId);
      }
    } catch {
      notification.error({ message: 'Failed to remove item' });
    }
  };

  if (loading || !order) return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Skeleton active paragraph={{ rows: 4 }} />
        <Divider />
        <Skeleton active paragraph={{ rows: 3 }} />
        <Divider />
        <Skeleton.Button active style={{ width: 200 }} />
      </Card>
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title={<Title level={2}>Order #{order.id}</Title>} 
        headStyle={{ borderBottom: 0 }}
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Order type">
            {order?.order_type === 'delivery' ? 'delivery' : 'in_house'}
          </Descriptions.Item>
          <Descriptions.Item label="Customer">
            {isEditing ? (
              <Input 
                value={editedData.customer_name} 
                onChange={(e) => setEditedData({...editedData, customer_name: e.target.value})}
              />
            ) : order?.customer_name}
          </Descriptions.Item>
          <Descriptions.Item label="Table">
            {isEditing ? (
              <Input 
                value={editedData.table_number} 
                onChange={(e) => setEditedData({...editedData, table_number: e.target.value})}
              />
            ) : order?.table_number}
          </Descriptions.Item>
          {order?.waiter && (
            <Descriptions.Item label="Waiter">
              {isEditing ? (
                <Input 
                  type="number"
                  value={editedData.waiter} 
                  onChange={(e) => setEditedData({...editedData, waiter: Number(e.target.value)})}
                />
              ) : `Waiter #${order.waiter}`}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Status">
            <Tag color={statusColors[order.status]} style={{ textTransform: 'capitalize', fontSize: 14 }}>
              {order.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Date">{new Date(order.created_at).toLocaleString()}</Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">Items</Divider>
        <List
          itemLayout="horizontal"
          dataSource={order.order_items}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => handleDeleteItem(item.id.toString())}
                />
              ]}
            >
              <List.Item.Meta
                title={`${item.menu_item_name} x ${item.quantity}`}
              />
            </List.Item>
          )}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Select
            placeholder="Select menu item"
            style={{ width: 200 }}
            value={newItem.menu_item || undefined}
            onChange={(value) => setNewItem({...newItem, menu_item: Number(value)})}
          >
            {menuItems?.map(item => (
              <Option key={item.id} value={item.id}>
                {item.name}
              </Option>
            ))}
          </Select>
          <InputNumber 
            placeholder="Quantity"
            min={1}
            value={newItem.quantity}
            onChange={(value) => setNewItem({...newItem, quantity: value || 1})}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}>
            Add Item
          </Button>
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: '16px' }}>
          <Select
            value={order.status}
            style={{ width: 200 }}
            onChange={handleStatusChange}
            size="large"
          >
            <Option value="pending">Pending</Option>
            <Option value="preparing">Preparing</Option>
            <Option value="ready">Ready</Option>
            <Option value="completed">Completed</Option>
            <Option value="canceled">Canceled</Option>
          </Select>
          {isEditing ? (
            <Button type="primary" size="large" onClick={handleSave}>Save</Button>
          ) : (
            <Button type="primary" size="large" onClick={handleEditClick}>Edit Order</Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OrderDetailsPage;
