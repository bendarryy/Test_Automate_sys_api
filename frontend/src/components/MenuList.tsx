import React from 'react';
import MenuItem from './MenuItem';
import MenuForm from './MenuForm'; // ✅

const MenuList = ({ order, onAddItem, onRemoveItem }) => {
  if (!order || !order.items) return <p>Order not found or has no items.</p>;

  return (
    <div className="card mb-3">
      <div className="card-header">
        <strong>Order #{order.id}</strong> – {order.status}
      </div>
      <div className="card-body">
        {order.items.length > 0 ? (
          order.items.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              orderId={order.id}
              onRemove={() => onRemoveItem(order.id, item.id)}
            />
          ))
        ) : (
          <p>No items in this order.</p>
        )}

        <MenuForm onSubmit={(data) => onAddItem(order.id, data)} />
      </div>
    </div>
  );
};

export default MenuList;
