import React from 'react';
import { Modal, Descriptions } from 'antd';
import type { Product } from '../types/product';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, onClose }) => {
  return (
    <Modal
      open={!!product}
      title={product ? product.name : ''}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      {product && (
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Price">${product.price}</Descriptions.Item>
          <Descriptions.Item label="Stock">{product.stock_quantity}</Descriptions.Item>
          <Descriptions.Item label="Expiry">{product.expiry_date}</Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
};

export default ProductDetailsModal;
