describe('Main Application Flow', () => {
  beforeEach(() => {
    cy.visit('/')
    // Clear localStorage before each test
    cy.clearLocalStorage()
  })

  describe('Authentication', () => {
    it('should navigate between login pages', () => {
      // Start at owner login
      cy.visit('/ownerLogin')
      
      // Switch to employee login
      cy.contains('Switch to Employee Login').click()
      cy.url().should('include', '/employeelogin')
      
      // Switch back to owner login
      cy.contains('Switch to Owner Login').click()
      cy.url().should('include', '/ownerLogin')
    })

    it('should navigate to registration page', () => {
      cy.visit('/register')
      cy.get('[data-testid="username-input"]').should('be.visible')
      cy.get('[data-testid="email-input"]').should('be.visible')
      cy.get('[data-testid="password-input"]').should('be.visible')
      cy.get('[data-testid="confirm-password-input"]').should('be.visible')
    })
  })

  describe('System Selection', () => {
    beforeEach(() => {
      // Mock successful login response
      cy.intercept('POST', '/api/core/login/', {
        statusCode: 200,
        body: {
          token: 'fake-token',
          user: {
            id: 1,
            username: 'user80',
            email: 'user80@example.com'
          }
        }
      }).as('loginRequest')

      // Mock successful systems response
      cy.intercept('GET', '/api/core/systems/', {
        statusCode: 200,
        body: [
          {
            id: 5,
            name: 'Restaurant System',
            description: 'Restaurant management system',
            category: 'restaurant'
          },
          {
            id: 7,
            name: 'Supermarket System',
            description: 'Supermarket management system',
            category: 'supermarket'
          }
        ]
      }).as('systemsRequest')

      // Mock successful profile response
      cy.intercept('GET', '/api/core/profile/', {
        statusCode: 200,
        body: {
          id: 1,
          username: 'user80',
          email: 'user80@example.com'
        }
      }).as('profileRequest')

      cy.visit('/ownerLogin')
      cy.get('[data-testid="email-input"]').type('user80')
      cy.get('[data-testid="password-input"]').type('password')
      cy.get('[data-testid="login-button"]').click()
      cy.wait('@loginRequest')
    })

    it('should access systems page after login when no system selected', () => {
      cy.url().should('include', '/systems')
      cy.contains('Select a System to Start').should('be.visible')
    })

    it('should select restaurant system and store in localStorage', () => {
      cy.visit('/systems')
      cy.wait('@systemsRequest')
      // Find the restaurant system by its category tag
      cy.contains('restaurant').parent().parent().parent().parent().within(() => {
        cy.contains('Select').click()
      })
      cy.url().should('not.include', '/systems')
      cy.contains('Restaurant Dashboard').should('be.visible')
      
      // Verify localStorage was set
      cy.window().then((win) => {
        expect(win.localStorage.getItem('selectedSystemCategory')).to.equal('restaurant')
        expect(win.localStorage.getItem('selectedSystemId')).to.equal('5')
      })
    })

    it('should select supermarket system and store in localStorage', () => {
      cy.visit('/systems')
      cy.wait('@systemsRequest')
      // Find the supermarket system by its category tag
      cy.contains('supermarket').parent().parent().parent().parent().within(() => {
        cy.contains('Select').click()
      })
      cy.url().should('not.include', '/systems')
      cy.contains('Supermarket Dashboard').should('be.visible')
      
      // Verify localStorage was set
      cy.window().then((win) => {
        expect(win.localStorage.getItem('selectedSystemCategory')).to.equal('supermarket')
        expect(win.localStorage.getItem('selectedSystemId')).to.equal('7')
      })
    })

    it('should handle system selection without login', () => {
      cy.clearLocalStorage()
      cy.visit('/systems')
      cy.url().should('include', '/ownerLogin')
    })

    it('should maintain selected system after refresh', () => {
      // Set system in localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('selectedSystemCategory', 'restaurant')
        win.localStorage.setItem('selectedSystemId', '5')
      })
      
      cy.visit('/')
      cy.contains('Restaurant Dashboard').should('be.visible')
      cy.reload()
      cy.contains('Restaurant Dashboard').should('be.visible')
    })

    it('should show loading state while fetching systems', () => {
      // Mock delayed systems response
      cy.intercept('GET', '/api/core/systems/', (req) => {
        req.reply({
          delay: 1000,
          statusCode: 200,
          body: []
        })
      })
      cy.visit('/systems')
      cy.contains('Loading systems...').should('be.visible')
    })

    it('should show error state if systems fail to load', () => {
      // Mock API failure
      cy.intercept('GET', '/api/core/systems/', {
        statusCode: 500,
        body: 'Error loading systems'
      })
      cy.visit('/systems')
      cy.contains('Error loading systems').should('be.visible')
    })

    it('should show no systems message if none available', () => {
      // Mock empty systems response
      cy.intercept('GET', '/api/core/systems/', {
        statusCode: 200,
        body: []
      })
      cy.visit('/systems')
      cy.contains('No systems available.').should('be.visible')
    })
  })

  describe('Restaurant Features', () => {
    beforeEach(() => {
      // Mock successful login response
      cy.intercept('POST', '/api/core/login/', {
        statusCode: 200,
        body: {
          token: 'fake-token',
          user: {
            id: 1,
            username: 'user80',
            email: 'user80@example.com'
          }
        }
      }).as('loginRequest')

      // Mock successful profile response
      cy.intercept('GET', '/api/core/profile/', {
        statusCode: 200,
        body: {
          id: 1,
          username: 'user80',
          email: 'user80@example.com'
        }
      }).as('profileRequest')

      // Set system in localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('selectedSystemCategory', 'restaurant')
        win.localStorage.setItem('selectedSystemId', '5')
      })
      // Login as restaurant owner
      cy.visit('/ownerLogin')
      cy.get('[data-testid="email-input"]').type('user80')
      cy.get('[data-testid="password-input"]').type('password')
      cy.get('[data-testid="login-button"]').click()
      cy.wait('@loginRequest')
    })

    it('should display restaurant dashboard', () => {
      cy.url().should('include', '/')
      cy.contains('Restaurant Dashboard').should('be.visible')
    })

    it('should navigate through main menu items', () => {
      // Test Orders
      cy.contains('Orders').click()
      cy.url().should('include', '/orders')
      cy.contains('Orders').should('be.visible')

      // Test Menu
      cy.contains('Menu').click()
      cy.url().should('include', '/menu')
      cy.contains('Menu Management').should('be.visible')

      // Test Inventory
      cy.contains('Inventory').click()
      cy.url().should('include', '/inventory')
      cy.contains('Inventory Management').should('be.visible')

      // Test KDS
      cy.contains('KDS').click()
      cy.url().should('include', '/kds')
      cy.contains('Kitchen Display System').should('be.visible')

      // Test Waiter Display
      cy.contains('Waiter Display').click()
      cy.url().should('include', '/waiterdisplay')
      cy.contains('Waiter Display').should('be.visible')

      // Test Delivery Display
      cy.contains('Delivery Display').click()
      cy.url().should('include', '/deliverydisplay')
      cy.contains('Delivery Display').should('be.visible')

      // Test Employees
      cy.contains('Employees').click()
      cy.url().should('include', '/employees')
      cy.contains('Employees').should('be.visible')

      // Test Finances
      cy.contains('Finances').click()
      cy.url().should('include', '/financesdashboards')
      cy.contains('Financial Dashboard').should('be.visible')
    })
  })

  describe('Supermarket Features', () => {
    beforeEach(() => {
      // Mock successful login response
      cy.intercept('POST', '/api/core/login/', {
        statusCode: 200,
        body: {
          token: 'fake-token',
          user: {
            id: 1,
            username: 'user80',
            email: 'user80@example.com'
          }
        }
      }).as('loginRequest')

      // Mock successful profile response
      cy.intercept('GET', '/api/core/profile/', {
        statusCode: 200,
        body: {
          id: 1,
          username: 'user80',
          email: 'user80@example.com'
        }
      }).as('profileRequest')

      // Set system in localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('selectedSystemCategory', 'supermarket')
        win.localStorage.setItem('selectedSystemId', '7')
      })
      // Login as supermarket owner
      cy.visit('/ownerLogin')
      cy.get('[data-testid="email-input"]').type('user80')
      cy.get('[data-testid="password-input"]').type('password')
      cy.get('[data-testid="login-button"]').click()
      cy.wait('@loginRequest')
    })

    it('should display supermarket dashboard', () => {
      cy.url().should('include', '/')
      cy.contains('Supermarket Dashboard').should('be.visible')
    })

    it('should navigate through supermarket menu items', () => {
      // Test Products
      cy.contains('Products').click()
      cy.url().should('include', '/products')
      cy.contains('Inventory Management').should('be.visible')

      // Test Sales
      cy.contains('Sales').click()
      cy.url().should('include', '/supermarket/sales')
      cy.contains('Sales').should('be.visible')

      // Test Purchase Orders
      cy.contains('Purchase Orders').click()
      cy.url().should('include', '/supermarket/purchase-orders')
      cy.contains('Purchase Orders').should('be.visible')

      // Test Supplier Management
      cy.contains('Supplier Management').click()
      cy.url().should('include', '/supermarket/suppliers')
      cy.contains('Supplier Management').should('be.visible')
    })
  })

  describe('Common Features', () => {
    beforeEach(() => {
      // Mock successful login response
      cy.intercept('POST', '/api/core/login/', {
        statusCode: 200,
        body: {
          token: 'fake-token',
          user: {
            id: 1,
            username: 'user80',
            email: 'user80@example.com'
          }
        }
      }).as('loginRequest')

      // Mock successful profile response
      cy.intercept('GET', '/api/core/profile/', {
        statusCode: 200,
        body: {
          id: 1,
          username: 'user80',
          email: 'user80@example.com'
        }
      }).as('profileRequest')

      // Set system in localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('selectedSystemCategory', 'restaurant')
        win.localStorage.setItem('selectedSystemId', '5')
      })
      // Login as any user
      cy.visit('/ownerLogin')
      cy.get('[data-testid="email-input"]').type('user80')
      cy.get('[data-testid="password-input"]').type('password')
      cy.get('[data-testid="login-button"]').click()
      cy.wait('@loginRequest')
    })

    it('should access profile page', () => {
      cy.contains('Profile').click()
      cy.url().should('include', '/profile')
      cy.contains('Profile Information').should('be.visible')
    })

    it('should access settings page', () => {
      cy.contains('Settings').click()
      cy.url().should('include', '/settings')
      cy.contains('Settings').should('be.visible')
    })

    it('should change password', () => {
      cy.visit('/change-password')
      cy.get('[data-testid="current-password"]').type('password')
      cy.get('[data-testid="new-password"]').type('newpassword123')
      cy.get('[data-testid="confirm-password"]').type('newpassword123')
      cy.get('[data-testid="change-password-button"]').click()
      cy.contains('Password changed successfully').should('be.visible')
    })

    it('should toggle theme', () => {
      cy.get('.ant-switch').click()
      cy.get('body').should('have.class', 'dark-theme')
      cy.get('.ant-switch').click()
      cy.get('body').should('not.have.class', 'dark-theme')
    })

    it('should check notifications', () => {
      cy.get('.ant-badge').click()
      cy.get('.ant-dropdown').should('be.visible')
    })
  })
}) 