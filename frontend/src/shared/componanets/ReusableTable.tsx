

interface ReusableTableProps<T extends Record<string, unknown>> {
  data: T[];
  loading?: boolean;
  columns: ColumnsType<T>;
  rowKey?: keyof T;
  onRowSelectionChange?: (selectedRowKeys: React.Key[]) => void;
  selectedRowKeys?: React.Key[];
  showRowSelection?: boolean;
  extraActions?: React.ReactNode;
}

// Memoized reusable table component for performance
import React from 'react';
import { Table, Input, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';

interface ReusableTableProps<T extends Record<string, unknown>> {
  data: T[];
  loading?: boolean;
  columns: ColumnsType<T>;
  rowKey?: keyof T;
  onRowSelectionChange?: (selectedRowKeys: React.Key[]) => void;
  selectedRowKeys?: React.Key[];
  showRowSelection?: boolean;
  extraActions?: React.ReactNode;
}

const InternalReusableTable = <T extends Record<string, unknown>>({
  data,
  loading = false,
  columns,
  rowKey,
  onRowSelectionChange,
  selectedRowKeys,
  showRowSelection = true,
  extraActions,
}: ReusableTableProps<T>) => {
  // Memoize rowSelection for performance
  const rowSelection = React.useMemo(() => (
    showRowSelection
      ? {
          selectedRowKeys,
          onChange: onRowSelectionChange,
        }
      : undefined
  ), [showRowSelection, selectedRowKeys, onRowSelectionChange]);

  // Memoize columns for performance (columns should be memoized in parent, but this is a safeguard)
  const memoizedColumns = React.useMemo(() => columns, [columns]);

  return (
    <>
      {extraActions && (
        <div style={{ marginBottom: 16 }}>
          {extraActions}
        </div>
      )}
      <Table
        rowKey={rowKey}
        columns={memoizedColumns}
        dataSource={data}
        loading={loading}
        rowSelection={rowSelection}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />
    </>
  );
};

export const ReusableTable = React.memo(InternalReusableTable) as typeof InternalReusableTable;


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
