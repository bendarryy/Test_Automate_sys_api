import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Header from '../../../../components/Header';
import { Row, Col, Spin, Alert, Button } from 'antd';
import { DashboardOutlined } from '@ant-design/icons';
import useHasPermission from '../../../../shared/hooks/useHasPermission';
import { useSelectedSystemId } from '../../../../shared/hooks/useSelectedSystemId';

import { useKdsOrders } from './hooks/useKdsOrders';
import { filterOrders, getOrderStats, getUniqueTables } from './utils/kdsHelpers';
import OrderCard from './components/OrderCard';
import StatsCards from './components/StatsCards';
import FiltersBar from './components/FiltersBar';

const KdsPage: React.FC = () => {
  const params = useParams<{ systemId?: string }>();
  const [selectedSystemId] = useSelectedSystemId();
  const systemId = params.systemId || selectedSystemId || '5';

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [tableFilter, setTableFilter] = useState<string>('');

  const { orders, loading, error, updating, fetchOrders, handleStatusUpdate } = useKdsOrders(systemId);

  const hasKdsPermission = useHasPermission('read_kds');
  if (!hasKdsPermission) return <Navigate to="/" replace />;

  const filteredOrders = filterOrders(orders, searchText, statusFilter, tableFilter);
  const stats = getOrderStats(orders);
  const uniqueTables = getUniqueTables(orders);

  return (
    <div style={{ padding: '24px' }}>
      <Header
        title="Kitchen Display System"
        breadcrumbs={[
          { title: 'Restaurant', path: '/restaurant' },
          { title: 'KDS' }
        ]}
        actions={
          <Button
            type="primary"
            onClick={fetchOrders}
            icon={<DashboardOutlined />}
          >
            Refresh
          </Button>
        }
      />

      {loading && <Spin size="large" className="center-spinner" />}
      {error && <Alert message={error} type="error" showIcon />}

      <StatsCards stats={stats} />

      <FiltersBar
        searchText={searchText}
        onSearchText={setSearchText}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        tableFilter={tableFilter}
        onTableFilter={setTableFilter}
        uniqueTables={uniqueTables}
      />

      <Row gutter={[16, 16]}>
        {filteredOrders.map(order => (
          <Col xs={24} sm={12} md={8} lg={8} xl={8} key={order.id}>
            <OrderCard
              order={order}
              updating={updating}
              onStatusUpdate={handleStatusUpdate}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default KdsPage;
