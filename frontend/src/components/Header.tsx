import React from 'react';
import { Layout, Typography, Button, Breadcrumb, Input } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

// Breadcrumbs Item type
type BreadcrumbItem = { title: string; path?: string };

// Memoized Breadcrumbs component
const MemoBreadcrumbs = React.memo(
  ({
    breadcrumbs,
    navigate,
  }: {
    breadcrumbs: BreadcrumbItem[];
    navigate: ReturnType<typeof useNavigate>;
  }) => {
    const items = React.useMemo(
      () =>
        breadcrumbs.map((item, index) => ({
          title: item.path ? (
            <a onClick={() => item.path && navigate(item.path)}>{item.title}</a>
          ) : (
            item.title
          ),
          key: index,
        })),
      [breadcrumbs, navigate]
    );
    return <Breadcrumb className="header-breadcrumbs" items={items} />;
  }
);

// Memoized Search Input
const MemoSearch = React.memo(
  ({
    onSearch,
    placeholder,
  }: {
    onSearch?: (value: string) => void;
    placeholder: string;
  }) => (
    <div className="header-search">
      <Input.Search
        placeholder={placeholder}
        onSearch={onSearch}
        style={{ width: 250 }}
        allowClear
      />
    </div>
  )
);

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  showSearch?: boolean;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  style?: React.CSSProperties;
}

// Custom props comparison for React.memo
function areEqual(prev: HeaderProps, next: HeaderProps) {
  return (
    prev.title === next.title &&
    prev.subtitle === next.subtitle &&
    prev.showBackButton === next.showBackButton &&
    prev.onBack === next.onBack &&
    prev.actions === next.actions &&
    JSON.stringify(prev.breadcrumbs) === JSON.stringify(next.breadcrumbs) &&
    prev.showSearch === next.showSearch &&
    prev.onSearch === next.onSearch &&
    prev.searchPlaceholder === next.searchPlaceholder &&
    JSON.stringify(prev.style) === JSON.stringify(next.style)
  );
}

const Header: React.FC<HeaderProps> = React.memo((props) => {
  const {
    title,
    subtitle,
    showBackButton = false,
    onBack,
    actions,
    breadcrumbs,
    showSearch = false,
    onSearch,
    searchPlaceholder = 'Search...',
    style,
  } = props;

  const navigate = useNavigate();

  const handleBack = React.useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  }, [onBack, navigate]);

  // Memoize header titles
  const headerTitles = React.useMemo(
    () => (
      <div className="header-titles">
        <Title level={4} className="header-title">
          {title}
        </Title>
        {subtitle && (
          <Typography.Text className="header-subtitle">
            {subtitle}
          </Typography.Text>
        )}
      </div>
    ),
    [title, subtitle]
  );

  return (
    <AntHeader
      className="app-header custom-header"
      style={{
        ...(style || {}),
        '--ant-prefix': 'custom-header',
        background: 'unset',
      } as React.CSSProperties & Record<string, string>}
    >
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
            <MemoBreadcrumbs breadcrumbs={breadcrumbs} navigate={navigate} />
          )}
          {headerTitles}
        </div>
      </div>
      <div className="header-right">
        {showSearch && (
          <MemoSearch
            onSearch={onSearch}
            placeholder={searchPlaceholder}
          />
        )}
        {actions}
      </div>
    </AntHeader>
  );
}, areEqual);

Header.displayName = 'Header';
export default Header;
