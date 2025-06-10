import React from 'react';
import { Button, Tooltip, Space } from 'antd';
import { ExclamationCircleOutlined, FireOutlined, AppstoreOutlined } from '@ant-design/icons';
import { ProductFilter } from '../hooks/useProducts';

interface ProductFiltersProps {
  filter: ProductFilter;
  setFilter: (filter: ProductFilter) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({ filter, setFilter }) => (
  <Space size={8} style={{ marginBottom: 16 }}>
    <Tooltip title="All Products">
      <Button
        type={filter === 'all' ? 'primary' : 'default'}
        icon={<AppstoreOutlined />}
        onClick={() => setFilter('all')}
        style={{ fontWeight: filter === 'all' ? 'bold' : undefined }}
      >
        all
      </Button>
    </Tooltip>
    <Tooltip title="Low Stock">
      <Button
        type={filter === 'low-stock' ? 'primary' : 'default'}
        icon={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
        onClick={() => setFilter('low-stock')}
        style={{ fontWeight: filter === 'low-stock' ? 'bold' : undefined }}
      >
        low stock
      </Button>
    </Tooltip>
    <Tooltip title="Expiring Soon">
      <Button
        type={filter === 'expiring-soon' ? 'primary' : 'default'}
        icon={<FireOutlined style={{ color: '#ff4d4f' }} />}
        onClick={() => setFilter('expiring-soon')}
        style={{ fontWeight: filter === 'expiring-soon' ? 'bold' : undefined }}
      >
        expiring soon
      </Button>
    </Tooltip>
    <Tooltip title="Expired">
      <Button
        type={filter === 'expired' ? 'primary' : 'default'}
        icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />} // red icon for expired
        onClick={() => setFilter('expired')}
        style={{ fontWeight: filter === 'expired' ? 'bold' : undefined }}
      >
        expired
      </Button>
    </Tooltip>
  </Space>
);

export default ProductFilters;
