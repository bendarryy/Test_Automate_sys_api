describe('Restaurant Management Tests', () => {
  beforeEach(() => {
    // Login as restaurant owner
    cy.visit('/ownerlogin')
    cy.get('[data-testid="email-input"]').type('user80')
    cy.get('[data-testid="password-input"]').type('password')
    cy.get('[data-testid="login-button"]').click()
    // Select restaurant system
    cy.visit('/systems')
    cy.get('[data-testid="restaurant-system"]').click()
  })

  describe('Menu Management', () => {
    it('should access menu management page', () => {
      cy.visit('/menu')
      cy.get('[data-testid="menu-management-page"]').should('be.visible')
    })

    it('should add new menu item', () => {
      cy.visit('/menu')
      cy.get('[data-testid="add-menu-item-button"]').click()
      cy.get('[data-testid="item-name-input"]').type('New Dish')
      cy.get('[data-testid="item-price-input"]').type('99.99')
      cy.get('[data-testid="item-description-input"]').type('Delicious new dish')
      cy.get('[data-testid="save-menu-item-button"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })

    it('should handle empty menu item fields', () => {
      cy.visit('/menu')
      cy.get('[data-testid="add-menu-item-button"]').click()
      cy.get('[data-testid="save-menu-item-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle invalid price format', () => {
      cy.visit('/menu')
      cy.get('[data-testid="add-menu-item-button"]').click()
      cy.get('[data-testid="item-name-input"]').type('New Dish')
      cy.get('[data-testid="item-price-input"]').type('invalid')
      cy.get('[data-testid="save-menu-item-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle negative price', () => {
      cy.visit('/menu')
      cy.get('[data-testid="add-menu-item-button"]').click()
      cy.get('[data-testid="item-name-input"]').type('New Dish')
      cy.get('[data-testid="item-price-input"]').type('-99.99')
      cy.get('[data-testid="save-menu-item-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle very long item name', () => {
      cy.visit('/menu')
      cy.get('[data-testid="add-menu-item-button"]').click()
      cy.get('[data-testid="item-name-input"]').type('a'.repeat(100))
      cy.get('[data-testid="item-price-input"]').type('99.99')
      cy.get('[data-testid="save-menu-item-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle very long description', () => {
      cy.visit('/menu')
      cy.get('[data-testid="add-menu-item-button"]').click()
      cy.get('[data-testid="item-name-input"]').type('New Dish')
      cy.get('[data-testid="item-price-input"]').type('99.99')
      cy.get('[data-testid="item-description-input"]').type('a'.repeat(1000))
      cy.get('[data-testid="save-menu-item-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle duplicate item name', () => {
      cy.visit('/menu')
      cy.get('[data-testid="add-menu-item-button"]').click()
      cy.get('[data-testid="item-name-input"]').type('Existing Dish')
      cy.get('[data-testid="item-price-input"]').type('99.99')
      cy.get('[data-testid="save-menu-item-button"]').click()
      cy.get('.ant-alert-error').should('be.visible')
    })

    it('should edit existing menu item', () => {
      cy.visit('/restaurant/menu')
      cy.get('[data-testid="edit-menu-item-button"]').first().click()
      cy.get('[data-testid="item-price-input"]').clear().type('149.99')
      cy.get('[data-testid="save-menu-item-button"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })

    it('should delete menu item', () => {
      cy.visit('/restaurant/menu')
      cy.get('[data-testid="delete-menu-item-button"]').first().click()
      cy.get('[data-testid="confirm-delete-button"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })

    it('should cancel menu item deletion', () => {
      cy.visit('/restaurant/menu')
      cy.get('[data-testid="delete-menu-item-button"]').first().click()
      cy.get('[data-testid="cancel-delete-button"]').click()
      cy.get('[data-testid="menu-item"]').should('be.visible')
    })
  })

  describe('Order Management', () => {
    it('should view orders page', () => {
      cy.visit('/orders')
      cy.get('[data-testid="orders-page"]').should('be.visible')
    })

    it('should view order details', () => {
      cy.visit('/orders')
      cy.get('[data-testid="order-item"]').first().click()
      cy.url().should('include', '/orders/')
      cy.get('[data-testid="order-details"]').should('be.visible')
    })

    it('should handle non-existent order', () => {
      cy.visit('/orders/999999')
      cy.get('[data-testid="error-message"]').should('be.visible')
    })

    it('should update order status', () => {
      cy.visit('/orders')
      cy.get('[data-testid="order-item"]').first().click()
      cy.get('[data-testid="order-status-select"]').select('Completed')
      cy.get('[data-testid="update-status-button"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })

    it('should handle invalid order status', () => {
      cy.visit('/orders')
      cy.get('[data-testid="order-item"]').first().click()
      cy.get('[data-testid="order-status-select"]').select('Invalid Status')
      cy.get('[data-testid="update-status-button"]').click()
      cy.get('.ant-alert-error').should('be.visible')
    })
  })

  describe('Inventory Management', () => {
    it('should access inventory page', () => {
      cy.visit('/inventory')
      cy.get('[data-testid="inventory-page"]').should('be.visible')
    })

    it('should view inventory item details', () => {
      cy.visit('/inventory')
      cy.get('[data-testid="inventory-item"]').first().click()
      cy.url().should('include', '/inventory/')
      cy.get('[data-testid="item-details"]').should('be.visible')
    })

    it('should add new inventory item', () => {
      cy.visit('/inventory')
      cy.get('[data-testid="add-inventory-button"]').click()
      cy.get('[data-testid="item-name-input"]').type('New Item')
      cy.get('[data-testid="item-quantity-input"]').type('100')
      cy.get('[data-testid="item-unit-select"]').select('kg')
      cy.get('[data-testid="save-inventory-button"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })

    it('should handle negative quantity', () => {
      cy.visit('/inventory')
      cy.get('[data-testid="add-inventory-button"]').click()
      cy.get('[data-testid="item-name-input"]').type('New Item')
      cy.get('[data-testid="item-quantity-input"]').type('-100')
      cy.get('[data-testid="save-inventory-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle invalid quantity format', () => {
      cy.visit('/inventory')
      cy.get('[data-testid="add-inventory-button"]').click()
      cy.get('[data-testid="item-name-input"]').type('New Item')
      cy.get('[data-testid="item-quantity-input"]').type('invalid')
      cy.get('[data-testid="save-inventory-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should update inventory quantity', () => {
      cy.visit('/inventory')
      cy.get('[data-testid="inventory-item"]').first().click()
      cy.get('[data-testid="update-quantity-input"]').clear().type('50')
      cy.get('[data-testid="update-quantity-button"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })
  })

  describe('KDS (Kitchen Display System)', () => {
    it('should access KDS page', () => {
      cy.visit('/kds')
      cy.get('[data-testid="kds-page"]').should('be.visible')
    })

    it('should view specific order in KDS', () => {
      cy.visit('/kds/order/123')
      cy.get('[data-testid="kds-order-details"]').should('be.visible')
    })

    it('should handle non-existent KDS order', () => {
      cy.visit('/kds/order/999999')
      cy.get('[data-testid="error-message"]').should('be.visible')
    })

    it('should update order status in KDS', () => {
      cy.visit('/kds/order/123')
      cy.get('[data-testid="update-kds-status-button"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })
  })

  describe('Employee Management', () => {
    it('should access employees page', () => {
      cy.visit('/employees')
      cy.get('[data-testid="employees-page"]').should('be.visible')
    })

    it('should add new employee', () => {
      cy.visit('/employees')
      cy.get('[data-testid="add-employee-button"]').click()
      cy.get('[data-testid="employee-name-input"]').type('New Employee')
      cy.get('[data-testid="employee-role-select"]').select('Waiter')
      cy.get('[data-testid="employee-email-input"]').type('employee@example.com')
      cy.get('[data-testid="save-employee-button"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })

    it('should handle invalid employee email', () => {
      cy.visit('/employees')
      cy.get('[data-testid="add-employee-button"]').click()
      cy.get('[data-testid="employee-name-input"]').type('New Employee')
      cy.get('[data-testid="employee-role-select"]').select('Waiter')
      cy.get('[data-testid="employee-email-input"]').type('invalid-email')
      cy.get('[data-testid="save-employee-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle duplicate employee email', () => {
      cy.visit('/employees')
      cy.get('[data-testid="add-employee-button"]').click()
      cy.get('[data-testid="employee-name-input"]').type('New Employee')
      cy.get('[data-testid="employee-role-select"]').select('Waiter')
      cy.get('[data-testid="employee-email-input"]').type('existing@example.com')
      cy.get('[data-testid="save-employee-button"]').click()
      cy.get('.ant-alert-error').should('be.visible')
    })
  })

  describe('Financial Dashboard', () => {
    it('should access financial dashboard', () => {
      cy.visit('/financesdashboards')
      cy.get('[data-testid="financial-dashboard"]').should('be.visible')
    })

    it('should filter financial data by date range', () => {
      cy.visit('/financesdashboards')
      cy.get('[data-testid="date-range-picker"]').click()
      cy.get('[data-testid="start-date"]').type('2024-01-01')
      cy.get('[data-testid="end-date"]').type('2024-12-31')
      cy.get('[data-testid="apply-date-filter"]').click()
      cy.get('[data-testid="financial-data"]').should('be.visible')
    })

    it('should handle invalid date range', () => {
      cy.visit('/financesdashboards')
      cy.get('[data-testid="date-range-picker"]').click()
      cy.get('[data-testid="start-date"]').type('2024-12-31')
      cy.get('[data-testid="end-date"]').type('2024-01-01')
      cy.get('[data-testid="apply-date-filter"]').click()
      cy.get('.ant-alert-error').should('be.visible')
    })
  })

  describe('Waiter Display', () => {
    it('should access waiter display', () => {
      cy.visit('/waiterdisplay')
      cy.get('[data-testid="waiter-display"]').should('be.visible')
    })

    it('should handle table selection', () => {
      cy.visit('/waiterdisplay')
      cy.get('[data-testid="table-item"]').first().click()
      cy.get('[data-testid="table-details"]').should('be.visible')
    })

    it('should handle non-existent table', () => {
      cy.visit('/waiterdisplay/table/999')
      cy.get('[data-testid="error-message"]').should('be.visible')
    })
  })

  describe('Delivery Display', () => {
    it('should access delivery display', () => {
      cy.visit('/deliverydisplay')
      cy.get('[data-testid="delivery-display"]').should('be.visible')
    })

    it('should handle delivery status update', () => {
      cy.visit('/deliverydisplay')
      cy.get('[data-testid="delivery-item"]').first().click()
      cy.get('[data-testid="update-delivery-status"]').select('Delivered')
      cy.get('[data-testid="save-delivery-status"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })

    it('should handle invalid delivery status', () => {
      cy.visit('/deliverydisplay')
      cy.get('[data-testid="delivery-item"]').first().click()
      cy.get('[data-testid="update-delivery-status"]').select('Invalid Status')
      cy.get('[data-testid="save-delivery-status"]').click()
      cy.get('.ant-alert-error').should('be.visible')
    })
  })

  describe('Table Management', () => {
    it('should add new table', () => {
      cy.visit('/restaurant/tables')
      cy.get('[data-testid="add-table-button"]').click()
      cy.get('[data-testid="table-number-input"]').type('10')
      cy.get('[data-testid="table-capacity-input"]').type('4')
      cy.get('[data-testid="save-table-button"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })

    it('should handle duplicate table number', () => {
      cy.visit('/restaurant/tables')
      cy.get('[data-testid="add-table-button"]').click()
      cy.get('[data-testid="table-number-input"]').type('1')
      cy.get('[data-testid="table-capacity-input"]').type('4')
      cy.get('[data-testid="save-table-button"]').click()
      cy.get('.ant-alert-error').should('be.visible')
    })

    it('should handle invalid table capacity', () => {
      cy.visit('/restaurant/tables')
      cy.get('[data-testid="add-table-button"]').click()
      cy.get('[data-testid="table-number-input"]').type('10')
      cy.get('[data-testid="table-capacity-input"]').type('0')
      cy.get('[data-testid="save-table-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should update table status', () => {
      cy.visit('/restaurant/tables')
      cy.get('[data-testid="table-status-select"]').first().select('Occupied')
      cy.get('[data-testid="update-table-status-button"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })

    it('should handle invalid table status', () => {
      cy.visit('/restaurant/tables')
      cy.get('[data-testid="table-status-select"]').first().select('Invalid Status')
      cy.get('[data-testid="update-table-status-button"]').click()
      cy.get('.ant-alert-error').should('be.visible')
    })
  })
}) 