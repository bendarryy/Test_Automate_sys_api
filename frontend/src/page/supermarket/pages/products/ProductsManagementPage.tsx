import React, { useState } from 'react';
import { Card, Typography, Spin, Result , App as AntdApp } from 'antd';
import ProductTable from './components/ProductTable';
import ProductForm from './components/ProductForm';
import ProductStockEditor from './components/ProductStockEditor';
import ProductFilters from './components/ProductFilters';
import ProductDetailsModal from './components/ProductDetailsModal';
import { useProducts } from './hooks/useProducts';
import { useProductFilters } from './hooks/useProductFilters';
import { useProductStock } from './hooks/useProductStock';
import { useDeleteProduct } from './hooks/useDeleteProduct';
import { useApi } from '../../../../shared/hooks/useApi';
import { AddProductPayload, Product } from './types/product';
import { useSelectedSystemId } from '../../../../shared/hooks/useSelectedSystemId';

const { Title } = Typography;

const ProductsManagementPage: React.FC = () => {
  const [systemId] = useSelectedSystemId();
  const { filter, setFilter } = useProductFilters();
  const { products, loading, error } = useProducts(systemId || '', filter);
  const { updateStock, loading: stockLoading } = useProductStock(systemId || '');
  const { deleteProduct, loading: deleteLoading } = useDeleteProduct(systemId || '');
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
      const newProduct = await addProductApi('post', `/supermarket/${systemId}/products/`, payload);
      // Replace temp product with actual product from API response
      setOptimisticProducts((prev) => {
        const base = prev || [];
        return base.map(p => p.id === tempId ? newProduct : p).filter(p => p !== null) as Product[];
      });
      notification.success({ message: 'Product added successfully!' });
    } catch (e: unknown) {
      notification.error({ message: 'Failed to add product', description: (e as Error)?.message || 'Unknown error' });
      // Rollback optimistic update
      setOptimisticProducts((prev) => (prev || []).filter((p: Product) => p.id !== tempId)); // Corrected filter syntax
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    const originalProducts = optimisticProducts || products;
    // Optimistic update: remove product locally
    setOptimisticProducts((prev) => {
      const base = prev || products;
      return base.filter(p => p.id !== productId);
    });
    try {
      await deleteProduct(productId);
      notification.success({ message: 'Product deleted successfully!' });
    } catch (e: unknown) { // Changed e: any to e: unknown
      notification.error({ message: 'Failed to delete product', description: (e as Error)?.message || 'Unknown error' });
      // Rollback optimistic update
      setOptimisticProducts(originalProducts);
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
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>Products Management</Title>
      <ProductForm onSubmit={handleAddProduct} loading={adding} />
      <ProductFilters filter={filter} setFilter={setFilter} />
      {(loading || deleteLoading || stockLoading) && <Spin size="large" style={{ display: 'block', margin: 'auto' }} />}
      {error && <Result status="error" title="Failed to load products" subTitle={typeof error === 'string' ? error : (error as Error)?.message} />} {/* Handled error message type */}
      {!loading && !error && (
        <ProductTable
          products={displayedProducts}
          onEditStock={product => setShowStockEditor(product)}
          onViewDetails={product => setShowDetails(product)}
          onDeleteProduct={handleDeleteProduct}
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
    </Card>
  );
};

export default ProductsManagementPage;
