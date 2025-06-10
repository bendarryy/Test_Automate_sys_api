import React from 'react';
import { Select } from 'antd';
import { OrderStatus } from '../types/order';

const { Option } = Select;

interface Props {
  value: OrderStatus;
  onChange: (status: OrderStatus) => void;
  orderType?: 'in_house' | 'delivery';
  size?: 'large' | 'middle' | 'small';
  style?: React.CSSProperties;
}

const OrderStatusSelect: React.FC<Props> = ({ value, onChange, orderType, size, style }) => (
  <Select value={value} onChange={onChange} size={size} style={style}>
    <Option value="pending">Pending</Option>
    <Option value="preparing">Preparing</Option>
    <Option value="ready">Ready</Option>
    {orderType === 'delivery' ? (
      <Option value="out_for_delivery">Out for Delivery</Option>
    ) : (
      <Option value="served">Served</Option>
    )}
    <Option value="completed">Completed</Option>
    <Option value="canceled">Canceled</Option>
  </Select>
);

export default OrderStatusSelect;
