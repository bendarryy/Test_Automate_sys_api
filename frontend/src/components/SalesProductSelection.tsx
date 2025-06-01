import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Card, Col, Row, Input, Select, Space, Typography, message, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { addItemToSale } from '../store/salesSlice';
import { useApi } from '../hooks/useApi';

interface Product {
  id: number;
  name: string;
  price: number;
  category?: string;
  image?: string;
}

export const SalesProductSelection = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'>('name-asc');
  const dispatch = useDispatch();
  const api = useApi();
  const systemId = localStorage.getItem('selectedSystemId');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.callApi<Product[]>('get', `/supermarket/${systemId}/products/`);
      const productsData = response || [];
      setProducts(productsData || []);
    } catch (error: unknown) {
      message.error(`Failed to load products: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [systemId]);

  useEffect(() => {
    if (systemId) {
      fetchProducts();
    }
  }, [systemId]);

  const handleAddProduct = (product: Product) => {
    const newItem = {
      id: Date.now(), // Temporary ID
      product: product.id,
      product_name: product.name,
      quantity: 1,
      unit_price: product.price,
      discount_amount: '0.00',
      total_price: product.price
    };
    dispatch(addItemToSale(newItem));
    message.success(`${product.name} added to sale`);
  };

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchText.toLowerCase()) &&
      (selectedCategories.length === 0 || (product.category && selectedCategories.includes(product.category)))
    )
    .sort((a, b) => {
      switch (sortOrder) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        default: return 0;
      }
    });

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))] as string[];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input
            placeholder="Search products"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            mode="multiple"
            placeholder="Filter by category"
            value={selectedCategories}
            onChange={setSelectedCategories}
            style={{ width: 200 }}
            options={categories.map(c => ({ value: c, label: c }))}
          />
          <Select
            placeholder="Sort by"
            value={sortOrder}
            onChange={setSortOrder}
            style={{ width: 150 }}
            options={[
              { value: 'name-asc', label: 'Name (A-Z)' },
              { value: 'name-desc', label: 'Name (Z-A)' },
              { value: 'price-asc', label: 'Price (Low-High)' },
              { value: 'price-desc', label: 'Price (High-Low)' },
            ]}
          />
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <Col key={product.id} xs={24} sm={12} md={8} lg={6} xl={4}>
                <Card
                  hoverable
                  onClick={() => handleAddProduct(product)}
                  cover={product.image ? <img alt={product.name} src={product.image} /> : null}
                >
                  <Card.Meta
                    title={product.name}
                    description={
                      <Space direction="vertical">
                        <Typography.Text strong>${product.price}</Typography.Text>
                        {product.category && <Typography.Text type="secondary">{product.category}</Typography.Text>}
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <Typography.Text type="secondary">No products found</Typography.Text>
            </div>
          )}
        </Row>
      )}
    </div>
  );
};
