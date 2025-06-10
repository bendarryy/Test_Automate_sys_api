import React from 'react';
import { Card, Space, Input, Select, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { statusColors, statusLabels } from '../utils/kdsConstants';

const { Search } = Input;

interface FiltersBarProps {
  searchText: string;
  onSearchText: (value: string) => void;
  statusFilter: string[];
  onStatusFilter: (value: string[]) => void;
  tableFilter: string;
  onTableFilter: (value: string) => void;
  uniqueTables: string[];
}

const FiltersBar: React.FC<FiltersBarProps> = ({
  searchText,
  onSearchText,
  statusFilter,
  onStatusFilter,
  tableFilter,
  onTableFilter,
  uniqueTables
}) => (
  <Card style={{ marginBottom: '24px' }}>
    <Space size="large">
      <Search
        placeholder="Search by order ID, customer, or table"
        allowClear
        value={searchText}
        onSearch={onSearchText}
        style={{ width: 300 }}
        prefix={<SearchOutlined />}
      />
      <Select
        mode="multiple"
        placeholder="Filter by status"
        style={{ width: 300 }}
        value={statusFilter}
        onChange={onStatusFilter}
        allowClear
        options={Object.entries(statusLabels).map(([value, label]) => ({
          value,
          label: <Tag color={statusColors[value as keyof typeof statusColors]}>{label}</Tag>
        }))}
      />
      <Select
        placeholder="Filter by table"
        style={{ width: 200 }}
        value={tableFilter}
        onChange={onTableFilter}
        allowClear
        options={uniqueTables.map(table => ({ value: table, label: `Table ${table}` }))}
      />
    </Space>
  </Card>
);

export default FiltersBar;
