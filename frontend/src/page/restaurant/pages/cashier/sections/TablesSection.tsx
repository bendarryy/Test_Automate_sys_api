import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../../store";
import { setSelectedTable } from "../../../../../store/billSlice";
import { Card, Row, Col, Badge, Space, Typography, Tag, Drawer, Tabs, Input, Button, Select, Popover, message } from 'antd';
import { MdPeopleOutline, MdTableRestaurant, MdEventSeat, MdEventAvailable, MdSearch, MdClose } from "react-icons/md";
import { Table } from '../../../../../types';
import apiClient from '../../../../../config/apiClient.config';
import { useSelectedSystemId } from '../../../../../shared/hooks/useSelectedSystemId';

const { Text } = Typography;
const { Search } = Input;

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available':
      return 'success';
    case 'reserved':
      return 'warning';
    case 'occupied':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'available':
      return 'Available';
    case 'reserved':
      return 'Reserved';
    case 'occupied':
      return 'Occupied';
    default:
      return status;
  }
};

interface TablesSectionProps {
  onClose: () => void;
  orderType?: 'in_house' | 'delivery';
}

const TablesSection: React.FC<TablesSectionProps> = ({ onClose, orderType = 'in_house' }) => {
  const dispatch = useDispatch();
  const selectedTable = useSelector((state: RootState) => state.bill.selectedTable);
  const [hoveredTable, setHoveredTable] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [capacityFilter, setCapacityFilter] = useState<number[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemId] = useSelectedSystemId();

  const fetchTables = async () => {
    if (!systemId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/restaurant/systems/${systemId}/tables/`);
      const apiTables = (res.data || []).map((t: any, idx: number) => ({
        id: Number(t.table_number),
        name: `Table ${t.table_number}`,
        status: t.is_occupied ? 'occupied' : 'available',
        capacity: 4,
        ...t,
      }));
      setTables(apiTables);
    } catch (err: any) {
      setError('حدث خطأ أثناء تحميل الطاولات');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTables();
    setIsOpen(true);
  }, [systemId]);

  const handleTableClick = (id: number) => {
    if (orderType === 'delivery') {
      message.info('Table selection is not available for delivery orders');
      return;
    }
    dispatch(setSelectedTable(id === selectedTable ? null : id));
    setIsOpen(false);
    onClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const filteredTables = tables.filter(table => {
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(table.status);
    const matchesCapacity = capacityFilter.length === 0 || capacityFilter.includes(table.capacity);
    return matchesSearch && matchesStatus && matchesCapacity;
  });

  const renderTableCard = (table: any) => (
    <Col key={table.id} xs={24} sm={12} md={8} lg={6} style={{ marginBottom: '16px' }}>
      <Popover
        content={
          <div style={{ padding: '8px' }}>
            <Space direction="vertical" size="small">
              <Space>
                <MdPeopleOutline size={16} />
                <Text>{table.capacity} seats</Text>
              </Space>
              {table.status === 'reserved' && (
                <Space>
                  <MdEventSeat size={16} />
                  <Text type="secondary">Reserved</Text>
                </Space>
              )}
              {table.status === 'occupied' && (
                <Space>
                  <MdEventAvailable size={16} />
                  <Text type="secondary">Occupied</Text>
                </Space>
              )}
            </Space>
          </div>
        }
        trigger="hover"
        placement="right"
      >
        <Card
          hoverable
          onClick={() => handleTableClick(table.id)}
          style={{
            cursor: orderType === 'delivery' ? 'not-allowed' : 'pointer',
            border: selectedTable === table.id ? '2px solid #1890ff' : '1px solid #f0f0f0',
            background: selectedTable === table.id ? '#e6f7ff' : '#fff',
            boxShadow: selectedTable === table.id ? '0 4px 16px rgba(24,144,255,0.10)' : hoveredTable === table.id ? '0 8px 24px rgba(0,0,0,0.05)' : '0 2px 8px rgba(0,0,0,0.03)',
            transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
            minHeight: 170,
            transform: hoveredTable === table.id ? 'scale(1.02)' : undefined,
            opacity: orderType === 'delivery' ? 0.5 : 1,
          }}
          onMouseEnter={() => setHoveredTable(table.id)}
          onMouseLeave={() => setHoveredTable(null)}
          styles={{ body: { padding: '12px' } }}
        >
          <Space direction="vertical" style={{ width: '100%' }} align="center" size="small">
            <Badge
              status={getStatusColor(table.status) as 'success' | 'error' | 'warning' | 'processing' | 'default'}
              text={
                <Tag color={getStatusColor(table.status)} style={{ margin: 0, fontWeight: 600, fontSize: 13, borderRadius: 8, padding: '2px 12px' }}>
                  {getStatusText(table.status)}
                </Tag>
              }
            />
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '8px',
              backgroundColor: selectedTable === table.id ? '#e6f7ff' : '#f5f5f5',
              borderRadius: '8px',
              width: '100%'
            }}>
              <MdTableRestaurant size={28} color={selectedTable === table.id ? '#1890ff' : '#8c8c8c'} />
            </div>
            <Text strong style={{ margin: 0, fontSize: 16, letterSpacing: 1, textAlign: 'center' }}>
              {table.name}
            </Text>
          </Space>
        </Card>
      </Popover>
    </Col>
  );

  const items = [
    {
      key: '1',
      label: (
        <Space>
          <MdTableRestaurant />
          <span>All Tables</span>
        </Space>
      ),
      children: (
        <>
          <div style={{ marginBottom: '16px' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Search
                  placeholder="Search tables..."
                  allowClear
                  prefix={<MdSearch />}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Select
                  mode="multiple"
                  allowClear
                  style={{ width: '100%' }}
                  placeholder="Filter by status"
                  onChange={setStatusFilter}
                  options={[
                    { value: 'available', label: 'Available' },
                    { value: 'reserved', label: 'Reserved' },
                    { value: 'occupied', label: 'Occupied' },
                  ]}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Select
                  mode="multiple"
                  allowClear
                  style={{ width: '100%' }}
                  placeholder="Filter by capacity"
                  onChange={setCapacityFilter}
                  options={[
                    { value: 2, label: '2 seats' },
                    { value: 4, label: '4 seats' },
                    { value: 6, label: '6 seats' },
                    { value: 8, label: '8 seats' },
                  ]}
                />
              </Col>
            </Row>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>جارٍ تحميل الطاولات...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', color: 'red', padding: '2rem' }}>{error}</div>
          ) : (
            <Row gutter={[16, 16]}>
              {filteredTables.map(renderTableCard)}
            </Row>
          )}
        </>
      ),
    },
    {
      key: '2',
      label: (
        <Space>
          <MdEventSeat />
          <span>Reservations</span>
        </Space>
      ),
      children: (
        <Row gutter={[16, 16]}>
          {tables.filter(t => t.status === 'reserved').map(renderTableCard)}
        </Row>
      ),
    },
    {
      key: '3',
      label: (
        <Space>
          <MdEventAvailable />
          <span>Occupied</span>
        </Space>
      ),
      children: (
        <Row gutter={[16, 16]}>
          {tables.filter(t => t.status === 'occupied').map(renderTableCard)}
        </Row>
      ),
    },
  ];

  const renderContent = () => (
    <div style={{ padding: '16px' }}>
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );

  return (
    <Drawer
      title={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Button 
              type="text" 
              icon={<MdClose size={20} />} 
              onClick={handleClose}
              style={{ 
                padding: '4px',
                marginLeft: '-8px'
              }}
            />
            <MdTableRestaurant size={24} />
            <span>Select Table</span>
          </Space>
        </Space>
      }
      placement="right"
      width={800}
      closable={false}
      onClose={handleClose}
      open={isOpen}
      styles={{
        body: { padding: 0 },
        header: { 
          padding: '16px 24px',
          borderBottom: '1px solid #f0f0f0'
        }
      }}
      maskClosable={true}
      keyboard={true}
      destroyOnClose={true}
    >
      {renderContent()}
    </Drawer>
  );
};

export default TablesSection;
