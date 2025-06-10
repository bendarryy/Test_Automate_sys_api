import React from 'react';
import { List, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { OrderItem } from '../types/order';

interface Props {
  items: OrderItem[];
  onDelete?: (itemId: string) => void;
}

const OrderItemsList: React.FC<Props> = ({ items, onDelete }) => (
  <List
    itemLayout="horizontal"
    dataSource={items}
    renderItem={(item) => (
      <List.Item
        actions={onDelete ? [
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => onDelete(item.id.toString())}
          />
        ] : undefined}
      >
        <List.Item.Meta
          title={`${item.menu_item_name} x ${item.quantity}`}
        />
      </List.Item>
    )}
  />
);

export default OrderItemsList;
