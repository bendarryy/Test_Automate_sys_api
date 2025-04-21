import React from 'react';

interface MenuItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  };
  orderId: string;
  onRemove: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, orderId, onRemove }) => {
  return (
    <div className="d-flex justify-content-between align-items-center border-bottom py-2 ">
      <div>
        <strong>{item.name}</strong> – ${item.price} × {item.quantity}
      </div>
      <button className="btn btn-sm btn-success" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
};

export default MenuItem;
