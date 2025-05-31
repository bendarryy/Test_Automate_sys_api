describe('Supermarket Management Tests', () => {
  beforeEach(() => {
    // Login as supermarket owner
    cy.visit('/ownerlogin')
    cy.get('[data-testid="email-input"]').type('user80')
    cy.get('[data-testid="password-input"]').type('password')
    cy.get('[data-testid="login-button"]').click()
    // Select supermarket system
    cy.visit('/systems')
    cy.get('[data-testid="supermarket-system"]').click()
  })

  describe('Products Management', () => {
    it('should access products page', () => {
      cy.visit('/products')
      cy.get('[data-testid="products-page"]').should('be.visible')
    })

    it('should add new product', () => {
      cy.visit('/products')
      cy.get('[data-testid="add-product-button"]').click()
      cy.get('[data-testid="product-name-input"]').type('New Product')
      cy.get('[data-testid="product-price-input"]').type('29.99')
      cy.get('[data-testid="product-quantity-input"]').type('100')
      cy.get('[data-testid="product-category-select"]').select('Groceries')
      cy.get('[data-testid="save-product-button"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })

    it('should handle empty product fields', () => {
      cy.visit('/products')
      cy.get('[data-testid="add-product-button"]').click()
      cy.get('[data-testid="save-product-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle invalid price format', () => {
      cy.visit('/products')
      cy.get('[data-testid="add-product-button"]').click()
      cy.get('[data-testid="product-name-input"]').type('New Product')
      cy.get('[data-testid="product-price-input"]').type('invalid')
      cy.get('[data-testid="save-product-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle negative price', () => {
      cy.visit('/products')
      cy.get('[data-testid="add-product-button"]').click()
      cy.get('[data-testid="product-name-input"]').type('New Product')
      cy.get('[data-testid="product-price-input"]').type('-29.99')
      cy.get('[data-testid="save-product-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle negative quantity', () => {
      cy.visit('/products')
      cy.get('[data-testid="add-product-button"]').click()
      cy.get('[data-testid="product-name-input"]').type('New Product')
      cy.get('[data-testid="product-price-input"]').type('29.99')
      cy.get('[data-testid="product-quantity-input"]').type('-100')
      cy.get('[data-testid="save-product-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle invalid quantity format', () => {
      cy.visit('/products')
      cy.get('[data-testid="add-product-button"]').click()
      cy.get('[data-testid="product-name-input"]').type('New Product')
      cy.get('[data-testid="product-price-input"]').type('29.99')
      cy.get('[data-testid="product-quantity-input"]').type('invalid')
      cy.get('[data-testid="save-product-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle duplicate product name', () => {
      cy.visit('/products')
      cy.get('[data-testid="add-product-button"]').click()
      cy.get('[data-testid="product-name-input"]').type('Existing Product')
      cy.get('[data-testid="product-price-input"]').type('29.99')
      cy.get('[data-testid="product-quantity-input"]').type('100')
      cy.get('[data-testid="save-product-button"]').click()
      cy.get('.ant-alert-error').should('be.visible')
    })

    it('should edit existing product', () => {
      cy.visit('/products')
      cy.get('[data-testid="edit-product-button"]').first().click()
      cy.get('[data-testid="product-price-input"]').clear().type('39.99')
      cy.get('[data-testid="save-product-button"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })

    it('should delete product', () => {
      cy.visit('/products')
      cy.get('[data-testid="delete-product-button"]').first().click()
      cy.get('[data-testid="confirm-delete-button"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })

    it('should cancel product deletion', () => {
      cy.visit('/products')
      cy.get('[data-testid="delete-product-button"]').first().click()
      cy.get('[data-testid="cancel-delete-button"]').click()
      cy.get('[data-testid="product-item"]').should('be.visible')
    })

    it('should search products', () => {
      cy.visit('/products')
      cy.get('[data-testid="search-input"]').type('Product')
      cy.get('[data-testid="search-button"]').click()
      cy.get('[data-testid="product-list"]').should('be.visible')
    })

    it('should filter products by category', () => {
      cy.visit('/products')
      cy.get('[data-testid="category-filter"]').select('Groceries')
      cy.get('[data-testid="apply-filter-button"]').click()
      cy.get('[data-testid="product-list"]').should('be.visible')
    })
  })

  describe('Sales Management', () => {
    it('should access sales page', () => {
      cy.visit('/supermarket/sales')
      cy.get('[data-testid="sales-page"]').should('be.visible')
    })

    it('should view sales history', () => {
      cy.visit('/supermarket/sales')
      cy.get('[data-testid="sales-list"]').should('be.visible')
    })

    it('should filter sales by date range', () => {
      cy.visit('/supermarket/sales')
      cy.get('[data-testid="date-range-picker"]').click()
      cy.get('[data-testid="start-date"]').type('2024-01-01')
      cy.get('[data-testid="end-date"]').type('2024-12-31')
      cy.get('[data-testid="apply-date-filter"]').click()
      cy.get('[data-testid="sales-list"]').should('be.visible')
    })

    it('should handle invalid date range', () => {
      cy.visit('/supermarket/sales')
      cy.get('[data-testid="date-range-picker"]').click()
      cy.get('[data-testid="start-date"]').type('2024-12-31')
      cy.get('[data-testid="end-date"]').type('2024-01-01')
      cy.get('[data-testid="apply-date-filter"]').click()
      cy.get('.ant-alert-error').should('be.visible')
    })

    it('should view sales details', () => {
      cy.visit('/supermarket/sales')
      cy.get('[data-testid="sale-item"]').first().click()
      cy.get('[data-testid="sale-details"]').should('be.visible')
    })

    it('should handle non-existent sale', () => {
      cy.visit('/supermarket/sales/999999')
      cy.get('[data-testid="error-message"]').should('be.visible')
    })
  })

  describe('Purchase Orders', () => {
    it('should access purchase orders page', () => {
      cy.visit('/supermarket/purchase-orders')
      cy.get('[data-testid="purchase-orders-page"]').should('be.visible')
    })

    it('should create new purchase order', () => {
      cy.visit('/supermarket/purchase-orders')
      cy.get('[data-testid="create-order-button"]').click()
      cy.get('[data-testid="supplier-select"]').select('Supplier 1')
      cy.get('[data-testid="add-item-button"]').click()
      cy.get('[data-testid="item-select"]').select('Product 1')
      cy.get('[data-testid="quantity-input"]').type('10')
      cy.get('[data-testid="save-order-button"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })

    it('should handle empty purchase order fields', () => {
      cy.visit('/supermarket/purchase-orders')
      cy.get('[data-testid="create-order-button"]').click()
      cy.get('[data-testid="save-order-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle invalid quantity in purchase order', () => {
      cy.visit('/supermarket/purchase-orders')
      cy.get('[data-testid="create-order-button"]').click()
      cy.get('[data-testid="supplier-select"]').select('Supplier 1')
      cy.get('[data-testid="add-item-button"]').click()
      cy.get('[data-testid="item-select"]').select('Product 1')
      cy.get('[data-testid="quantity-input"]').type('invalid')
      cy.get('[data-testid="save-order-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle negative quantity in purchase order', () => {
      cy.visit('/supermarket/purchase-orders')
      cy.get('[data-testid="create-order-button"]').click()
      cy.get('[data-testid="supplier-select"]').select('Supplier 1')
      cy.get('[data-testid="add-item-button"]').click()
      cy.get('[data-testid="item-select"]').select('Product 1')
      cy.get('[data-testid="quantity-input"]').type('-10')
      cy.get('[data-testid="save-order-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should view purchase order details', () => {
      cy.visit('/supermarket/purchase-orders')
      cy.get('[data-testid="order-item"]').first().click()
      cy.get('[data-testid="order-details"]').should('be.visible')
    })

    it('should handle non-existent purchase order', () => {
      cy.visit('/supermarket/purchase-orders/999999')
      cy.get('[data-testid="error-message"]').should('be.visible')
    })

    it('should update purchase order status', () => {
      cy.visit('/supermarket/purchase-orders')
      cy.get('[data-testid="order-item"]').first().click()
      cy.get('[data-testid="order-status-select"]').select('Received')
      cy.get('[data-testid="update-status-button"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })

    it('should handle invalid purchase order status', () => {
      cy.visit('/supermarket/purchase-orders')
      cy.get('[data-testid="order-item"]').first().click()
      cy.get('[data-testid="order-status-select"]').select('Invalid Status')
      cy.get('[data-testid="update-status-button"]').click()
      cy.get('.ant-alert-error').should('be.visible')
    })
  })

  describe('Supplier Management', () => {
    it('should access suppliers page', () => {
      cy.visit('/supermarket/suppliers')
      cy.get('[data-testid="suppliers-page"]').should('be.visible')
    })

    it('should add new supplier', () => {
      cy.visit('/supermarket/suppliers')
      cy.get('[data-testid="add-supplier-button"]').click()
      cy.get('[data-testid="supplier-name-input"]').type('New Supplier')
      cy.get('[data-testid="supplier-contact-input"]').type('1234567890')
      cy.get('[data-testid="supplier-email-input"]').type('supplier@example.com')
      cy.get('[data-testid="save-supplier-button"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })

    it('should handle empty supplier fields', () => {
      cy.visit('/supermarket/suppliers')
      cy.get('[data-testid="add-supplier-button"]').click()
      cy.get('[data-testid="save-supplier-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle invalid supplier email', () => {
      cy.visit('/supermarket/suppliers')
      cy.get('[data-testid="add-supplier-button"]').click()
      cy.get('[data-testid="supplier-name-input"]').type('New Supplier')
      cy.get('[data-testid="supplier-contact-input"]').type('1234567890')
      cy.get('[data-testid="supplier-email-input"]').type('invalid-email')
      cy.get('[data-testid="save-supplier-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle invalid supplier contact', () => {
      cy.visit('/supermarket/suppliers')
      cy.get('[data-testid="add-supplier-button"]').click()
      cy.get('[data-testid="supplier-name-input"]').type('New Supplier')
      cy.get('[data-testid="supplier-contact-input"]').type('invalid')
      cy.get('[data-testid="supplier-email-input"]').type('supplier@example.com')
      cy.get('[data-testid="save-supplier-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle duplicate supplier email', () => {
      cy.visit('/supermarket/suppliers')
      cy.get('[data-testid="add-supplier-button"]').click()
      cy.get('[data-testid="supplier-name-input"]').type('New Supplier')
      cy.get('[data-testid="supplier-contact-input"]').type('1234567890')
      cy.get('[data-testid="supplier-email-input"]').type('existing@example.com')
      cy.get('[data-testid="save-supplier-button"]').click()
      cy.get('.ant-alert-error').should('be.visible')
    })

    it('should edit existing supplier', () => {
      cy.visit('/supermarket/suppliers')
      cy.get('[data-testid="edit-supplier-button"]').first().click()
      cy.get('[data-testid="supplier-contact-input"]').clear().type('9876543210')
      cy.get('[data-testid="save-supplier-button"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })

    it('should delete supplier', () => {
      cy.visit('/supermarket/suppliers')
      cy.get('[data-testid="delete-supplier-button"]').first().click()
      cy.get('[data-testid="confirm-delete-button"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })

    it('should cancel supplier deletion', () => {
      cy.visit('/supermarket/suppliers')
      cy.get('[data-testid="delete-supplier-button"]').first().click()
      cy.get('[data-testid="cancel-delete-button"]').click()
      cy.get('[data-testid="supplier-item"]').should('be.visible')
    })

    it('should search suppliers', () => {
      cy.visit('/supermarket/suppliers')
      cy.get('[data-testid="search-input"]').type('Supplier')
      cy.get('[data-testid="search-button"]').click()
      cy.get('[data-testid="supplier-list"]').should('be.visible')
    })
  })
}) 