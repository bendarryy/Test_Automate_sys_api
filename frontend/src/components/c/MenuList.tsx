/* MenuList.tsx */
import React from 'react';
import MenuItem from './MenuItem';
import MenuForm from './MenuForm';
import styles from '../../styles/MenuList.module.css'; // Adjust the path as necessary

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  [key: string]: any;
}

interface Order {
  id: string;
  status: string;
  items: OrderItem[];
}

interface MenuListProps {
  order: Order | null;
  onAddItem: (orderId: string, itemData: any) => void;
  onRemoveItem: (orderId: string, itemId: string) => void;
}

const MenuList: React.FC<MenuListProps> = ({ order, onAddItem, onRemoveItem }) => {
  if (!order || !order.items) return <p className={styles.message}>Order not found or has no items.</p>;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <strong>Order #{order.id}</strong> – <span className={styles.status}>{order.status}</span>
      </div>
      <div className={styles.body}>
        {order.items.length > 0 ? (
          order.items.map(item => (
            <MenuItem
              key={item.id}
              item={{ ...item, quantity: item.quantity ?? 0 }}
              orderId={order.id}
              onRemove={() => onRemoveItem(order.id, item.id)}
            />
          ))
        ) : (
          <p className={styles.message}>No items in this order.</p>
        )}

        <MenuForm onSubmit={data => onAddItem(order.id, data)} />
      </div>
    </div>
  );
};

export default MenuList;