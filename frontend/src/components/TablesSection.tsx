import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setSelectedTable } from "../store/billSlice";
import { Card, Row, Col, Badge, Tooltip, Space, Typography, Tag, Drawer, Tabs, Input, Button, Select, Popover, message } from 'antd';
import { MdPeopleOutline, MdTableRestaurant, MdEventSeat, MdEventAvailable, MdSearch, MdFilterList, MdClose } from "react-icons/md";
import { Table } from '../types';

const { Text, Title } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

const tables: Table[] = [
  {
    id: 1,
    name: 'Table 1',
    status: "available",
    capacity: 4
  },
  {
    id: 2,
    name: 'Table 2',
    status: "available",
    capacity: 6
  },
  {
    id: 3,
    name: 'Table 3',
    status: "reserved",
    capacity: 2
  },
  {
    id: 4,
    name: 'Table 4',
    status: "occupied",
    capacity: 8
  },
  {
    id: 5,
    name: 'Table 5',
    status: "available",
    capacity: 4
  },
  {
    id: 6,
    name: 'Table 6',
    status: "reserved",
    capacity: 6
  },
  {
    id: 7,
    name: 'Table 7',
    status: "available",
    capacity: 2
  },
  {
    id: 8,
    name: 'Table 8',
    status: "occupied",
    capacity: 8
  },
  {
    id: 9,
    name: 'Table 9',
    status: "available",
    capacity: 4
  },
  {
    id: 10,
    name: 'Table 10',
    status: "reserved",
    capacity: 6
  },
  {
    id: 11,
    name: 'Table 11',
    status: "available",
    capacity: 2
  },
  {
    id: 12,
    name: 'Table 12',
    status: "occupied",
    capacity: 8
  }
];

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

  useEffect(() => {
    setIsOpen(true);
  }, []);

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

  const renderTableCard = (table: Table) => (
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
                  <Text type="secondary">Reserved for 2 hours</Text>
                </Space>
              )}
              {table.status === 'occupied' && (
                <Space>
                  <MdEventAvailable size={16} />
                  <Text type="secondary">Occupied for 45 min</Text>
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
            transition: 'all 0.3s ease',
            transform: hoveredTable === table.id ? 'translateY(-4px)' : 'none',
            boxShadow: hoveredTable === table.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
            height: '100%',
            opacity: orderType === 'delivery' ? 0.5 : 1,
          }}
          onMouseEnter={() => setHoveredTable(table.id)}
          onMouseLeave={() => setHoveredTable(null)}
          bodyStyle={{ padding: '12px' }}
        >
          <Space direction="vertical" style={{ width: '100%' }} align="center" size="small">
            <Badge
              status={getStatusColor(table.status) as any}
              text={
                <Tag color={getStatusColor(table.status)} style={{ margin: 0 }}>
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
              <MdTableRestaurant size={24} color={selectedTable === table.id ? '#1890ff' : '#8c8c8c'} />
            </div>

            <Text strong style={{ margin: 0 }}>
              {table.name}
            </Text>
          </Space>
        </Card>
      </Popover>
    </Col>
  );

  const renderContent = () => (
    <div style={{ padding: '16px' }}>
      <Tabs defaultActiveKey="1">
        <TabPane 
          tab={
            <Space>
              <MdTableRestaurant />
              <span>All Tables</span>
            </Space>
          } 
          key="1"
        >
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

          <Row gutter={[16, 16]}>
            {filteredTables.map(renderTableCard)}
          </Row>
        </TabPane>
        <TabPane 
          tab={
            <Space>
              <MdEventSeat />
              <span>Reservations</span>
            </Space>
          } 
          key="2"
        >
          <Row gutter={[16, 16]}>
            {tables.filter(t => t.status === 'reserved').map(renderTableCard)}
          </Row>
        </TabPane>
        <TabPane 
          tab={
            <Space>
              <MdEventAvailable />
              <span>Occupied</span>
            </Space>
          } 
          key="3"
        >
          <Row gutter={[16, 16]}>
            {tables.filter(t => t.status === 'occupied').map(renderTableCard)}
          </Row>
        </TabPane>
      </Tabs>
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
      bodyStyle={{ padding: 0 }}
      headerStyle={{ 
        padding: '16px 24px',
        borderBottom: '1px solid #f0f0f0'
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
