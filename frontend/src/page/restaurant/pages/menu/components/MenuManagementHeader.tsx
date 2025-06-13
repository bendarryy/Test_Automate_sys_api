import React from 'react';
import { Input, Select, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface MenuManagementHeaderProps {
  searchText: string;
  setSearchText: (text: string) => void;
  selectedCategories: string[];
  setSelectedCategories: (cats: string[]) => void;
  categories: string[];
  loading: boolean;
  onAdd: () => void;
}

const MenuManagementHeader: React.FC<MenuManagementHeaderProps> = ({
  searchText,
  setSearchText,
  selectedCategories,
  setSelectedCategories,
  categories,
  loading,
  onAdd,
}) => (
  <Space>
    <Input.Search
      placeholder="Search items"
      value={searchText}
      onChange={e => setSearchText(e.target.value)}
      style={{ width: 200, display: 'flex' }}
    />
    <Select
      mode="multiple"
      style={{ width: 100 }}
      placeholder="Category"
      value={selectedCategories}
      onChange={setSelectedCategories}
      options={categories.map(cat => ({ label: cat, value: cat }))}
      loading={loading}
    />
    <Button type="primary" onClick={onAdd} icon={<PlusOutlined />}>
      Add Item
    </Button>
  </Space>
);

export default MenuManagementHeader;