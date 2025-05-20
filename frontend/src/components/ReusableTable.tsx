import React from 'react';
import { Table, Input, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';



interface ReusableTableProps<T extends Record<string, unknown>> {
  data: T[];
  loading?: boolean;
  columns: ColumnsType<T>;
  rowKey?: keyof T;
  onRowSelectionChange?: (selectedRowKeys: React.Key[]) => void;
  selectedRowKeys?: React.Key[];
  showSearch?: boolean;
  showRowSelection?: boolean;
  extraActions?: React.ReactNode;
}

export function ReusableTable<T extends Record<string, unknown>>({
  data,
  loading = false,
  columns,
  rowKey,
  onRowSelectionChange,
  selectedRowKeys,
  showSearch = true,
  showRowSelection = true,
  extraActions,
}: ReusableTableProps<T>) {
  // Example usage of permission-based action buttons:
  // Place this in the parent component using ReusableTable, not inside the table itself.
  //
  // import useHasPermission from '../hooks/useHasPermission';
  // const hasEdit = useHasPermission('update_menu');
  // const hasDelete = useHasPermission('delete_menu');
  //
  // const columns = [
  //   ...,
  //   {
  //     title: 'Actions',
  //     key: 'actions',
  //     render: (_: any, record: any) => (
  //       <>
  //         {hasEdit && <Button onClick={() => handleEdit(record)}>Edit</Button>}
  //         {hasDelete && <Button danger onClick={() => handleDelete(record)}>Delete</Button>}
  //       </>
  //     ),
  //   },
  // ];

  const [searchText, setSearchText] = React.useState('');

  const filteredData = React.useMemo(() => {
    if (!searchText) return data;
    return data.filter(item => 
      JSON.stringify(item).toLowerCase().includes(searchText.toLowerCase())
    );
  }, [data, searchText]);

  const rowSelection = showRowSelection
    ? {
        selectedRowKeys,
        onChange: onRowSelectionChange,
      }
    : undefined;

  return (
    <>
      {showSearch && (
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Space style={{ marginLeft: 8 }}>
            {extraActions}
          </Space>
        </div>
      )}
      <Table
        rowKey={rowKey}
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowSelection={rowSelection}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />
    </>
  );
}

export function StatusTag({ status, statusColors }: { status: string; statusColors: Record<string, string> }) {
  return (
    <Tag color={statusColors[status]} style={{ textTransform: 'capitalize' }}>
      {status}
    </Tag>
  );
}

export function createStatusFilter<T extends { status: string }>(statusColors: Record<string, string>) {
  return {
    filters: Object.entries(statusColors).map(([status]) => ({
      text: status.charAt(0).toUpperCase() + status.slice(1),
      value: status,
    })),
    onFilter: (value: string, record: T) => record.status === value,
  };
}

export function createSearchFilter<T extends Record<string, unknown>>(dataIndex: keyof T, placeholder?: string) {
  return {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }: {
      setSelectedKeys: (keys: React.Key[]) => void;
      selectedKeys: React.Key[];
      confirm: () => void;
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={placeholder}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={confirm}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value: string, record: T) =>
      record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
  };
}
