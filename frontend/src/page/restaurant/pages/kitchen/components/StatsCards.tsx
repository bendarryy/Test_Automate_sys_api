import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { DashboardOutlined, ClockCircleOutlined, HourglassOutlined } from '@ant-design/icons';

interface StatsCardsProps {
  stats: { total: number; pending: number; preparing: number };
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => (
  <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
      <Card>
        <Statistic
          title="Total Orders"
          value={stats.total}
          prefix={<DashboardOutlined />}
        />
      </Card>
    </Col>
    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
      <Card>
        <Statistic
          title="Pending"
          value={stats.pending}
          valueStyle={{ color: '#faad14' }}
          prefix={<ClockCircleOutlined />}
        />
      </Card>
    </Col>
    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
      <Card>
        <Statistic
          title="Preparing"
          value={stats.preparing}
          valueStyle={{ color: '#1890ff' }}
          prefix={<HourglassOutlined />}
        />
      </Card>
    </Col>
  </Row>
);

export default StatsCards;
