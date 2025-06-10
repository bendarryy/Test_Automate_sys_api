import React from 'react';
import { Table, Button, Tag } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { Employee } from '../types/employee';
import { roleColors } from '../utils/roleOptions';

interface EmployeeTableProps {
  data: Employee[] | undefined;
  loading: boolean;
  onEdit: (employee: Employee) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({ data, loading, onEdit }) => {
  const columns = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={roleColors[role] || 'default'}>
          {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: Employee) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => onEdit(record)}
        />
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      pagination={{ pageSize: 10 }}
    />
  );
};

export default EmployeeTable;
