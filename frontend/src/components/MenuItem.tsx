import React from 'react';

const MenuItem = React.memo(({ item, orderId, onRemove }) => {
  return (
    <div className="d-flex justify-content-between align-items-center border-bottom py-2">
      <div>
        <strong>{item.name}</strong> – ${item.price} × {item.quantity}
      </div>
      <button className="btn btn-sm btn-danger" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
};

export default MenuItem;
