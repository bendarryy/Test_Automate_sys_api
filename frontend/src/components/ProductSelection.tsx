import React, { useEffect, useState, useMemo } from "react";
// import GridScrollX from "./GridScrollX"; // Removed unused import
// import styles from "../styles/ProductsSection.module.css"; // Removed unused import
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../store/billSlice";
import { useGetMenu, getCategoryIcon } from "../hooks/useGetMenu";
// Import necessary Ant Design components
import { Card, Col, Row, Spin, Input, Select, Space, Typography, Popover, Button } from 'antd';
import { MdTableRestaurant } from "react-icons/md";
import { RootState } from "../store";
import TablesSection from "./TablesSection";

interface Product {
  id: number | string;
  name: string;
  price: number | string;
  category?: string;
  description: string;
  image: string;
  is_available: boolean;
  cost: number | null;
}

// Define sort options type
type SortOrder = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'default';

const ProductSelection = () => {
  const dispatch = useDispatch();
  const selectedTable = useSelector((state: RootState) => state.bill.selectedTable);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('default'); 
  const { getMenu, getCategories, loading } = useGetMenu(5);
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showTables, setShowTables] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesData = await getCategories();
      if (categoriesData) {
        setCategories(categoriesData);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => { 
    const fetchMenu = async () => {
      try {
        if (selectedCategories.length > 0) {
          // Fetch menu for each category separately and combine results
          const menuPromises = selectedCategories.map(category => getMenu(category));
          const results = await Promise.all(menuPromises);
          // Combine all results and remove duplicates based on id
          const combinedResults = results.flat().filter((item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)
          );
          // Update the data state with combined results
          if (combinedResults) {
            setProducts(combinedResults);
          }
        } else {
          const result = await getMenu();
          if (result) {
            setProducts(result);
          }
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
        setProducts([]);
      }
    };
    fetchMenu();
  }, [selectedCategories]); 

  // Memoize displayed products based on filters and sorting
  const displayedProducts = useMemo(() => {
    let filtered = products;

    // Filter by search term (case-insensitive)
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort products
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return Number(a.price) - Number(b.price);
        case 'price-desc':
          return Number(b.price) - Number(a.price);
        default:
          return 0;
      }
    });

    return sorted;
  }, [products, searchTerm, sortOrder]);

  const renderProductImage = (product: Product) => {
    // Check if the image is an SVG with emoji (our category icon)
    const isCategoryIcon = product.image?.startsWith('data:image/svg+xml') || !product.image;
    
    return (
      <div style={{ 
        height: 160,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isCategoryIcon ? '#f0f2f5' : '#f5f5f5'
      }}>
        {isCategoryIcon ? (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '64px',
            backgroundColor: '#f0f2f5'
          }}>
            {product.image ? (
              <img
                alt={product.name}
                src={product.image}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <span style={{ fontSize: '64px' }}>
                {getCategoryIcon(product.category || '')}
              </span>
            )}
          </div>
        ) : (
          <img
            alt={product.name}
            src={product.image}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              // If image fails to load, show category icon instead
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const iconSpan = document.createElement('span');
                iconSpan.style.fontSize = '64px';
                iconSpan.textContent = getCategoryIcon(product.category || '');
                parent.appendChild(iconSpan);
              }
            }}
          />
        )}
      </div>
    );
  };

  const handleTableButtonClick = () => {
    setShowTables(true);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem", padding: '1rem' }}>
      {/* Controls Section */}
      <Space wrap style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button
              onClick={handleTableButtonClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '12px',
                border: selectedTable ? '1px solid #1890ff' : '1px solid #e8e8e8',
                backgroundColor: selectedTable ? '#f0f7ff' : '#fff',
                boxShadow: selectedTable ? '0 2px 8px rgba(24,144,255,0.15)' : '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px',
                  borderRadius: '8px',
                  backgroundColor: selectedTable ? '#e6f4ff' : '#f0f7ff',
                  transition: 'all 0.3s ease',
                }}>
                  <MdTableRestaurant size={15} style={{ 
                    color: selectedTable ? '#1890ff' : '#8c8c8c'
                  }} />
                </div>
                <span style={{ 
                  fontSize: '14px',
                  fontWeight: selectedTable ? 600 : 500,
                  color: selectedTable ? '#1890ff' : '#262626'
                }}>
                  {selectedTable ? `Table ${selectedTable}` : 'Select Table'}
                </span>
              </div>
            </Button>
            <Select<string[]>
                mode="multiple"
                allowClear
                style={{ minWidth: 200 }}
                placeholder="Filter categories"
                onChange={setSelectedCategories} 
                options={categories.map(cat => ({ 
                  label: (
                    <Space>
                      <span>{getCategoryIcon(cat)}</span>
                      <span>{cat}</span>
                    </Space>
                  ), 
                  value: cat 
                }))}
                value={selectedCategories}
                loading={loading}
                maxTagCount={3}
                maxTagTextLength={10}
                maxTagPlaceholder={(omittedValues) => `+${omittedValues.length} more`}
            />
          </Space>

          <Space>
            <Input.Search 
              placeholder="Search products..."
              allowClear
              onSearch={setSearchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              style={{ width: 200 }}
            />
            <Select<SortOrder>
              defaultValue="default"
              style={{ width: 180 }}
              onChange={setSortOrder}
              options={[
                { value: 'default', label: 'Sort by...' },
                { value: 'name-asc', label: 'Name (A-Z)' },
                { value: 'name-desc', label: 'Name (Z-A)' },
                { value: 'price-asc', label: 'Price (Low to High)' },
                { value: 'price-desc', label: 'Price (High to Low)' },
              ]}
            />
          </Space>
      </Space>

      {/* Products Grid Section */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: '1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[16, 16]} style={{ margin: '0px' }}>
            {displayedProducts.map((product) => (
              <Col key={product.id} xs={24} sm={12} md={8} lg={4}> {/* Adjusted column sizes */}
                <Card
                  hoverable
                  onClick={() => {
                    if (product.is_available) {
                      dispatch(
                        addItem({
                          ...product,
                          id: product.id.toString(),
                          price: Number(product.price),
                          quantity: 1,
                        })
                      );
                    }
                  }}
                  style={{ 
                    height: '100%',
                    opacity: product.is_available ? 1 : 0.6,
                    cursor: product.is_available ? 'pointer' : 'not-allowed'
                  }}
                  cover={renderProductImage(product)}
                  bodyStyle={{ padding: '12px' }}
                >
                  <Card.Meta
                    title={
                      <Popover 
                        content={product.name}
                        trigger="hover"
                        placement="topLeft"
                      >
                        <Typography.Text 
                          ellipsis 
                          style={{ 
                            fontSize: '16px',
                            fontWeight: 'bold',
                            marginBottom: '4px',
                            display: 'block',
                            width: '100%'
                          }}
                        >
                          {product.name}
                        </Typography.Text>
                      </Popover>
                    }
                    description={
                      <div>
                        <p style={{ 
                          margin: 0,
                          fontSize: '15px',
                          fontWeight: 'bold',
                          color: '#1890ff'
                        }}>
                          ${product.price}
                        </p>
                        {product.description && (
                          <Popover 
                            content={product.description}
                            trigger="hover"
                            placement="topLeft"
                          >
                            <Typography.Paragraph
                              style={{ 
                                margin: '4px 0 0 0',
                                fontSize: '12px',
                                color: '#666',
                              }}
                              ellipsis={{
                                rows: 2,
                                expandable: false,
                              }}
                            >
                              {product.description}
                            </Typography.Paragraph>
                          </Popover>
                        )}
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
      {showTables && <TablesSection onClose={() => setShowTables(false)} />}
    </div>
  );
};

export default ProductSelection;
