import React from 'react';
import { Statistic, Space, Button, Tooltip } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface StatusStatisticsProps {
  readyCount: number;
  servedCount: number;
  onRefresh: () => void;
}

const StatusStatistics: React.FC<StatusStatisticsProps> = ({ readyCount, servedCount, onRefresh }) => (
  <Space size="large">
    <Statistic title="Ready Orders" value={readyCount} valueStyle={{ color: '#1890ff' }} />
    <Statistic title="Served Orders" value={servedCount} valueStyle={{ color: '#faad14' }} />
    <Tooltip title="Refresh Orders">
      <Button icon={<ReloadOutlined />} onClick={onRefresh} size="large" />
    </Tooltip>
  </Space>
);

export default StatusStatistics;
