import React from 'react';
import { Input } from 'antd';
import { Order } from '../types/order';

interface Props {
  data: Partial<Order>;
  onChange: (data: Partial<Order>) => void;
}

const OrderEditForm: React.FC<Props> = ({ data, onChange }) => (
  <>
    <Input
      placeholder="Customer Name"
      value={data.customer_name || ''}
      onChange={e => onChange({ ...data, customer_name: e.target.value })}
      style={{ marginBottom: 8 }}
    />
    <Input
      placeholder="Table Number"
      value={data.table_number}
      onChange={e => onChange({ ...data, table_number: e.target.value })}
      style={{ marginBottom: 8 }}
    />
    <Input
      type="number"
      placeholder="Waiter"
      value={data.waiter}
      onChange={e => onChange({ ...data, waiter: Number(e.target.value) })}
    />
  </>
);

export default OrderEditForm;
