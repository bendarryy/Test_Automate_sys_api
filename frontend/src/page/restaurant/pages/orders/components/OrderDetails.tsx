import React from 'react';
import { Card, Descriptions, Divider, Tag, Button, Select, InputNumber, Input } from 'antd';
import { statusColors } from '../utils/orderUtils';
import { Order, OrderStatus } from '../types/order'; // Import OrderStatus
import OrderItemsList from './OrderItemsList';
import OrderStatusSelect from './OrderStatusSelect';

interface Props {
  order: Order;
  isEditing: boolean;
  editedData: Partial<Order>;
  onEditClick: () => void;
  onSave: () => void;
  onEditChange: (data: Partial<Order>) => void;
  onStatusChange: (status: OrderStatus) => void; // Changed from string to OrderStatus
  onAddItem: () => void;
  onDeleteItem: (itemId: string) => void;
  newItem: { menu_item: number; quantity: number };
  setNewItem: (item: { menu_item: number; quantity: number }) => void;
  menuItems: { id: number; name: string }[];
}

const { Option } = Select;

const OrderDetails: React.FC<Props> = ({
  order,
  isEditing,
  editedData,
  onEditClick,
  onSave,
  onEditChange,
  onStatusChange,
  onAddItem,
  onDeleteItem,
  newItem,
  setNewItem,
  menuItems
}) => (
  <Card
    style={{ marginTop: 16 }}
    title={
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tag color={statusColors[order.status]} style={{ textTransform: 'capitalize', fontSize: 14 }}>
          {order.status}
        </Tag>
        <Tag color="cyan">${order.total_price}</Tag>
      </div>
    }
    headStyle={{ borderBottom: 0 }}
  >
    <Descriptions bordered column={1}>
      <Descriptions.Item label="Order type">
        {order?.order_type === 'delivery' ? 'delivery' : 'in_house'}
      </Descriptions.Item>
      <Descriptions.Item label="Customer">
        {isEditing ? (
          <Input
            value={editedData.customer_name || ''}
            onChange={e => onEditChange({ ...editedData, customer_name: e.target.value })}
          />
        ) : order?.customer_name}
      </Descriptions.Item>
      <Descriptions.Item label="Table">
        {isEditing ? (
          <Input
            value={editedData.table_number}
            onChange={e => onEditChange({ ...editedData, table_number: e.target.value })}
          />
        ) : order?.table_number}
      </Descriptions.Item>
      {order?.waiter && (
        <Descriptions.Item label="Waiter">
          {isEditing ? (
            <Input
              type="number"
              value={editedData.waiter}
              onChange={e => onEditChange({ ...editedData, waiter: Number(e.target.value) })}
            />
          ) : `Waiter #${order.waiter}`}
        </Descriptions.Item>
      )}
      <Descriptions.Item label="Date">{new Date(order.created_at).toLocaleString()}</Descriptions.Item>
    </Descriptions>

    <Divider orientation="left">Items</Divider>
    <OrderItemsList items={order.order_items} onDelete={onDeleteItem} />
    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
      <Select
        placeholder="Select menu item"
        style={{ width: 200 }}
        value={newItem.menu_item || undefined}
        onChange={value => setNewItem({ ...newItem, menu_item: Number(value) })}
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
        onChange={value => setNewItem({ ...newItem, quantity: value || 1 })}
      />
      <Button type="primary" onClick={onAddItem}>
        Add Item
      </Button>
    </div>

    <div style={{ marginTop: 24, display: 'flex', gap: '16px' }}>
      <OrderStatusSelect
        value={order.status}
        onChange={onStatusChange} // This will now correctly pass OrderStatus
        orderType={order.order_type}
        size="large"
        style={{ width: 200 }}
      />
      {isEditing ? (
        <Button type="primary" size="large" onClick={onSave}>Save</Button>
      ) : (
        <Button type="primary" size="large" onClick={onEditClick}>Edit Order</Button>
      )}
    </div>
  </Card>
);

export default OrderDetails;
