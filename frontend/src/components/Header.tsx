import React from 'react';
import { Layout, Typography, Button, Breadcrumb, Input } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  breadcrumbs?: { title: string; path?: string }[];
  showSearch?: boolean;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  showBackButton = false, 
  onBack, 
  actions,
  breadcrumbs,
  showSearch = false,
  onSearch,
  searchPlaceholder = 'Search...'
 }) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <AntHeader className="app-header">
      <div className="header-left">
        {showBackButton && (
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack} 
            className="back-button"
          />
        )}
        <div className="header-content">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumb className="header-breadcrumbs">
              {breadcrumbs.map((item, index) => (
                <Breadcrumb.Item key={index}>
                  {item.path ? (
                    <a onClick={() => item.path && navigate(item.path)}>{item.title}</a>
                  ) : (
                    item.title
                  )}
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
          )}
          <div className="header-titles">
            <Title level={4} className="header-title">{title}</Title>
            {subtitle && <Typography.Text className="header-subtitle">{subtitle}</Typography.Text>}
          </div>
        </div>
      </div>
      <div className="header-right">
        {showSearch && (
          <div className="header-search">
            <Input.Search
              placeholder={searchPlaceholder}
              onSearch={onSearch}
              style={{ width: 250 }}
              allowClear
            />
          </div>
        )}
        {actions}
      </div>
    </AntHeader>
  );
};

export default Header;
