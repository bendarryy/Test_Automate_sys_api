describe('Restaurant Dashboard Components', () => {
  before(() => {
    // Clear localStorage and login once
    cy.clearLocalStorage()
    cy.visit('/ownerLogin')
    cy.get('[data-testid="email-input"]').type('user80')
    cy.get('[data-testid="password-input"]').type('password')
    cy.get('[data-testid="login-button"]').click()

    // Select restaurant system
    cy.contains('restaurant').parent().parent().parent().parent().within(() => {
      cy.contains('Select').click()
    })
  })

  describe('HomePage Component', () => {
    it('should render dashboard with correct title and breadcrumbs', () => {
      cy.contains('Restaurant Dashboard').should('be.visible')
      cy.contains('Restaurant').should('be.visible')
      cy.contains('Dashboard').should('be.visible')
    })

    it('should toggle sidebar state', () => {
      // Check initial state
      cy.get('.ant-layout-sider').should('have.class', 'ant-layout-sider-collapsed')
      
      // Toggle sidebar
      cy.get('button').contains('>').click()
      cy.get('.ant-layout-sider').should('not.have.class', 'ant-layout-sider-collapsed')
      
      // Toggle back
      cy.get('button').contains('<').click()
      cy.get('.ant-layout-sider').should('have.class', 'ant-layout-sider-collapsed')
    })
  })

  describe('ProductSelection Component', () => {
    it('should toggle order type between in-house and delivery', () => {
      // Check initial state (in-house)
      cy.get('button').contains('In House').should('be.visible')
      
      // Switch to delivery
      cy.get('button').contains('Delivery').click()
      cy.get('button').contains('Delivery').should('be.visible')
      
      // Switch back to in-house
      cy.get('button').contains('In House').click()
      cy.get('button').contains('In House').should('be.visible')
    })

    it('should handle table selection button', () => {
      // In-house mode
      cy.get('button').contains('In House').click()
      cy.contains('Select Table').should('be.visible')
      
      // Delivery mode
      cy.get('button').contains('Delivery').click()
      cy.contains('Select Table').should('be.disabled')
    })

    it('should filter products by category', () => {
      cy.get('.ant-select-multiple').click()
      cy.contains('Main Course').click()
      cy.contains('Appetizers').click()
      cy.get('.ant-select-selection-item').should('have.length', 2)
    })

    it('should search products', () => {
      cy.get('.ant-input-search').type('Burger')
      cy.contains('Burger').should('be.visible')
    })

    it('should sort products', () => {
      cy.get('.ant-select').last().click()
      cy.contains('Price (Low to High)').click()
      cy.get('.ant-card').first().contains('$10.99')
    })
  })

  describe('TablesSection Component', () => {
    it('should open tables drawer with correct tabs', () => {
      cy.contains('Select Table').click()
      cy.get('.ant-drawer').should('be.visible')
      cy.contains('All Tables').should('be.visible')
      cy.contains('Reservations').should('be.visible')
      cy.contains('Occupied').should('be.visible')
    })

    it('should filter tables by status and capacity', () => {
      cy.contains('Select Table').click()
      
      // Filter by status
      cy.get('.ant-select-multiple').first().click()
      cy.contains('Available').click()
      
      // Filter by capacity
      cy.get('.ant-select-multiple').last().click()
      cy.contains('4 seats').click()
      
      cy.get('.ant-select-selection-item').should('have.length', 2)
    })

    it('should show table details in popover', () => {
      cy.contains('Select Table').click()
      cy.contains('Table 1').trigger('mouseover')
      cy.contains('4 seats').should('be.visible')
      cy.contains('Available').should('be.visible')
    })

    it('should handle table selection', () => {
      cy.contains('Select Table').click()
      cy.contains('Table 1').click()
      cy.get('.ant-drawer').should('not.exist')
      cy.contains('Table 1').should('be.visible')
    })
  })

  describe('BillSection Component', () => {
    beforeEach(() => {
      // Add items to bill
      cy.contains('Burger').click()
    })

    it('should display bill items with quantity controls', () => {
      cy.contains('Burger').should('be.visible')
      cy.get('input[type="number"]').should('have.value', '1')
    })

    it('should update item quantity', () => {
      cy.get('input[type="number"]').type('2')
      cy.contains('$21.98').should('be.visible')
    })

    it('should remove items from bill', () => {
      cy.get('.ant-btn-danger').click()
      cy.contains('Add items to the order').should('be.visible')
    })

    it('should handle delivery order details', () => {
      // Switch to delivery mode
      cy.get('button').contains('Delivery').click()
      
      // Check required fields
      cy.get('input[placeholder="Enter customer name (required)"]').should('be.visible')
      cy.contains('Send Order').click()
      cy.contains('Customer name is required for delivery orders').should('be.visible')
      
      // Add customer name
      cy.get('input[placeholder="Enter customer name (required)"]').type('John Doe')
      cy.contains('Send Order').should('not.be.disabled')
    })

    it('should handle in-house order details', () => {
      // Check table requirement
      cy.contains('Send Order').click()
      cy.contains('Please select a table for in-house orders').should('be.visible')
      
      // Select table
      cy.contains('Select Table').click()
      cy.contains('Table 1').click()
      cy.contains('Send Order').should('not.be.disabled')
    })

    it('should apply and validate discount', () => {
      // Apply valid discount
      cy.get('input[placeholder="Discount (%)"]').type('10')
      cy.contains('After Discount: $9.89').should('be.visible')
      
      // Try invalid discount
      cy.get('input[placeholder="Discount (%)"]').clear().type('150')
      cy.contains('Discount must be between 0 and 100').should('be.visible')
    })

    it('should handle order submission', () => {
      // Select table
      cy.contains('Select Table').click()
      cy.contains('Table 1').click()
      
      // Submit order
      cy.contains('Send Order').click()
      cy.contains('Order sent successfully').should('be.visible')
    })
  })

  describe('Integration Tests', () => {
    it('should complete full order flow', () => {
      // Add items
      cy.contains('Burger').click()
      
      // Select table
      cy.contains('Select Table').click()
      cy.contains('Table 1').click()
      
      // Add customer details
      cy.get('input[placeholder="Enter customer name (optional)"]').type('John Doe')
      
      // Apply discount
      cy.get('input[placeholder="Discount (%)"]').type('10')
      
      // Submit order
      cy.contains('Send Order').click()
      cy.contains('Order sent successfully').should('be.visible')
    })

    it('should handle concurrent operations', () => {
      // Add items while changing table
      cy.contains('Burger').click()
      cy.contains('Select Table').click()
      cy.contains('Table 1').click()
      cy.contains('Burger').should('be.visible')
      cy.contains('Table 1').should('be.visible')
    })
  })
}) 