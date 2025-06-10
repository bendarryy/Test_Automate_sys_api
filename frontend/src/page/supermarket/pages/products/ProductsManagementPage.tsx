import React, { useState } from 'react';
import { Card, Typography, Space, Spin, Result , App as AntdApp } from 'antd';
import ProductTable from './components/ProductTable';
import ProductForm from './components/ProductForm';
import ProductStockEditor from './components/ProductStockEditor';
import ProductFilters from './components/ProductFilters';
import ProductDetailsModal from './components/ProductDetailsModal';
import { useProducts } from './hooks/useProducts';
import { useProductFilters } from './hooks/useProductFilters';
import { useProductStock } from './hooks/useProductStock';
import { useApi } from '../../../../shared/hooks/useApi';
import { AddProductPayload, Product } from './types/product';
import { useSelectedSystemId } from '../../../../shared/hooks/useSelectedSystemId';

const { Title } = Typography;

const ProductsManagementPage: React.FC = () => {
  const [systemId] = useSelectedSystemId();
  const { filter, setFilter } = useProductFilters();
  const { products, loading, error } = useProducts(systemId || '', filter);
  const { updateStock, loading: stockLoading } = useProductStock(systemId || '');
  const { callApi: addProductApi } = useApi<Product>();
  const [showStockEditor, setShowStockEditor] = useState<Product | null>(null);
  const [showDetails, setShowDetails] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);
  const [optimisticProducts, setOptimisticProducts] = useState<Product[] | null>(null);
  const { notification } = AntdApp.useApp();

  const handleAddProduct = async (payload: AddProductPayload) => {
    setAdding(true);
    // Optimistic update: add product locally with a temporary id
    const tempId = Math.random() * 1000000;
    const optimisticProduct: Product = {
      id: tempId,
      ...payload,
    };
    setOptimisticProducts((prev) => (prev ? [optimisticProduct, ...prev] : [optimisticProduct, ...(products || [])]));
    try {
      const created = await addProductApi('post', `/api/supermarket/${systemId}/products/`, payload);
      notification.success({ message: 'Product added successfully!' });
      // Replace temp product with real one
      setOptimisticProducts((prev) => prev ? [created as Product, ...prev.filter(p => p.id !== tempId)] : null);
    } catch {
      notification.error({ message: 'Failed to add product' });
      // Rollback optimistic update
      setOptimisticProducts((prev) => prev ? prev.filter(p => p.id !== tempId) : null);
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateStock = async (productId: number, stock: number) => {
    // Optimistic update: update stock locally
    setOptimisticProducts((prev) => {
      const base = prev || products;
      return base.map((p) =>
        p.id === productId ? { ...p, stock_quantity: stock } : p
      );
    });
    try {
      await updateStock(productId, stock);
      notification.success({ message: 'Stock updated!' });
    } catch {
      notification.error({ message: 'Failed to update stock' });
      // Rollback: refetch or remove optimistic update
      setOptimisticProducts(null);
    }
  };

  // Clear optimistic updates when filter changes
  React.useEffect(() => {
    setOptimisticProducts(null);
  }, [filter, systemId]);

  const displayedProducts = optimisticProducts || products;

  return (
    <Card className="products-management-page" style={{ maxWidth: 1100, margin: '32px auto', boxShadow: '0 2px 16px #f0f1f2' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>Supermarket Products</Title>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <ProductFilters filter={filter} setFilter={setFilter} />
          <ProductForm onSubmit={handleAddProduct} loading={adding} />
        </Space>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>
        ) : error ? (
          <Result status="error" title="Error" subTitle={error} />
        ) : (
          <ProductTable
            products={displayedProducts}
            onEditStock={setShowStockEditor}
            onViewDetails={setShowDetails}
          />
        )}
        {showStockEditor && (
          <ProductStockEditor
            product={showStockEditor}
            onUpdate={async (stock) => {
              await handleUpdateStock(showStockEditor.id, stock);
              setShowStockEditor(null);
            }}
            loading={stockLoading}
          />
        )}
        <ProductDetailsModal product={showDetails} onClose={() => setShowDetails(null)} />
      </Space>
    </Card>
  );
};

export default ProductsManagementPage;
