import React from 'react';
import Header from '../../../../../components/Header';
import { Button } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

interface InventoryHeaderProps {
  onAdd: () => void;
}

const InventoryHeader: React.FC<InventoryHeaderProps> = ({ onAdd }) => (
  <Header 
    title="Stock Management"
    breadcrumbs={[
      { title: 'Restaurant', path: '/restaurant' },
      { title: 'Inventory' }
    ]}
    actions={
      <Button
        type="primary"
        icon={<PlusCircleOutlined />}
        onClick={onAdd}
        size="large"
      >
        Add New Ingredient
      </Button>
    }
  />
);

export default InventoryHeader;
