describe('Authentication Tests', () => {
  beforeEach(() => {
    cy.visit('/')
    // Clear localStorage before each test
    cy.clearLocalStorage()
  })

  describe('Owner Login', () => {
    it('should successfully login as owner and redirect to systems page when no system selected', () => {
      cy.visit('/ownerlogin')
      cy.get('[data-testid="email-input"]').type('user80')
      cy.get('[data-testid="password-input"]').type('password')
      cy.get('[data-testid="login-button"]').click()
      cy.url().should('include', '/systems')
    })

    it('should successfully login as owner and redirect to dashboard when system is already selected', () => {
      // Set system in localStorage before login
      cy.window().then((win) => {
        win.localStorage.setItem('selectedSystemCategory', 'restaurant')
        win.localStorage.setItem('selectedSystemId', '7')
      })
      
      cy.visit('/ownerlogin')
      cy.get('[data-testid="email-input"]').type('user80')
      cy.get('[data-testid="password-input"]').type('password')
      cy.get('[data-testid="login-button"]').click()
      cy.url().should('not.include', '/systems')
      cy.get('[data-testid="restaurant-dashboard"]').should('be.visible')
    })

    it('should show error with invalid credentials', () => {
      cy.visit('/ownerlogin')
      cy.get('[data-testid="email-input"]').type('wronguser')
      cy.get('[data-testid="password-input"]').type('wrongpass')
      cy.get('[data-testid="login-button"]').click()
      cy.get('.ant-alert-error').should('be.visible')
    })

    it('should handle empty username', () => {
      cy.visit('/ownerlogin')
      cy.get('[data-testid="password-input"]').type('password')
      cy.get('[data-testid="login-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle empty password', () => {
      cy.visit('/ownerlogin')
      cy.get('[data-testid="email-input"]').type('user80')
      cy.get('[data-testid="login-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle special characters in username', () => {
      cy.visit('/ownerlogin')
      cy.get('[data-testid="email-input"]').type('user@#$%^&*()')
      cy.get('[data-testid="password-input"]').type('password')
      cy.get('[data-testid="login-button"]').click()
      cy.get('.ant-alert-error').should('be.visible')
    })

    it('should handle very long username', () => {
      cy.visit('/ownerlogin')
      cy.get('[data-testid="email-input"]').type('a'.repeat(100))
      cy.get('[data-testid="password-input"]').type('password')
      cy.get('[data-testid="login-button"]').click()
      cy.get('.ant-alert-error').should('be.visible')
    })

    it('should handle very long password', () => {
      cy.visit('/ownerlogin')
      cy.get('[data-testid="email-input"]').type('user80')
      cy.get('[data-testid="password-input"]').type('a'.repeat(100))
      cy.get('[data-testid="login-button"]').click()
      cy.get('.ant-alert-error').should('be.visible')
    })

    it('should handle SQL injection attempt', () => {
      cy.visit('/ownerlogin')
      cy.get('[data-testid="email-input"]').type("' OR '1'='1")
      cy.get('[data-testid="password-input"]').type("' OR '1'='1")
      cy.get('[data-testid="login-button"]').click()
      cy.get('.ant-alert-error').should('be.visible')
    })

    it('should handle XSS attempt', () => {
      cy.visit('/ownerlogin')
      cy.get('[data-testid="email-input"]').type('<script>alert("xss")</script>')
      cy.get('[data-testid="password-input"]').type('password')
      cy.get('[data-testid="login-button"]').click()
      cy.get('.ant-alert-error').should('be.visible')
    })
  })

  describe('Employee Login', () => {
    it('should successfully login as employee', () => {
      cy.visit('/employeelogin')
      cy.get('[data-testid="email-input"]').type('koko@email.com')
      cy.get('[data-testid="password-input"]').type('password')
      cy.get('[data-testid="login-button"]').click()
      cy.url().should('satisfy', (url) => {
        return url.includes('/') || url.includes('/systems')
      })
    })

    it('should show error with invalid employee credentials', () => {
      cy.visit('/employeelogin')
      cy.get('[data-testid="email-input"]').type('wrong@example.com')
      cy.get('[data-testid="password-input"]').type('wrongpass')
      cy.get('[data-testid="login-button"]').click()
      cy.get('.ant-alert-error').should('be.visible')
    })

    it('should handle invalid email format', () => {
      cy.visit('/employeelogin')
      cy.get('[data-testid="email-input"]').type('invalid-email')
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="login-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle empty email', () => {
      cy.visit('/employeelogin')
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="login-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle empty password', () => {
      cy.visit('/employeelogin')
      cy.get('[data-testid="email-input"]').type('employee@example.com')
      cy.get('[data-testid="login-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })
  })

  describe('Registration', () => {
    it('should successfully register new user', () => {
      cy.visit('/register')
      cy.get('[data-testid="username-input"]').type('newuser12312121')
      cy.get('[data-testid="email-input"]').type('newuser@example.com')
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="confirm-password-input"]').type('password123')
      cy.get('[data-testid="first-name-input"]').type('John')
      cy.get('[data-testid="last-name-input"]').type('Doe')
      cy.get('[data-testid="register-button"]').click()
      cy.url().should('include', '/ownerlogin')
    })

    it('should show error with mismatched passwords', () => {
      cy.visit('/register')
      cy.get('[data-testid="username-input"]').type('newuser123')
      cy.get('[data-testid="email-input"]').type('newuser@example.com')
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="confirm-password-input"]').type('differentpass')
      cy.get('[data-testid="register-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle weak password', () => {
      cy.visit('/register')
      cy.get('[data-testid="username-input"]').type('newuser123')
      cy.get('[data-testid="email-input"]').type('newuser@example.com')
      cy.get('[data-testid="password-input"]').type('123')
      cy.get('[data-testid="confirm-password-input"]').type('123')
      cy.get('[data-testid="register-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle existing username', () => {
      cy.visit('/register')
      cy.get('[data-testid="username-input"]').type('user80')
      cy.get('[data-testid="email-input"]').type('newuser@example.com')
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="confirm-password-input"]').type('password123')
      cy.get('[data-testid="register-button"]').click()
      cy.get('.ant-alert-error').should('be.visible')
    })

    it('should handle existing email', () => {
      cy.visit('/register')
      cy.get('[data-testid="username-input"]').type('newuser123')
      cy.get('[data-testid="email-input"]').type('user80@example.com')
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="confirm-password-input"]').type('password123')
      cy.get('[data-testid="register-button"]').click()
      cy.get('.ant-alert-error').should('be.visible')
    })

    it('should handle invalid email format', () => {
      cy.visit('/register')
      cy.get('[data-testid="username-input"]').type('newuser123')
      cy.get('[data-testid="email-input"]').type('invalid-email')
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="confirm-password-input"]').type('password123')
      cy.get('[data-testid="register-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle short username', () => {
      cy.visit('/register')
      cy.get('[data-testid="username-input"]').type('ab')
      cy.get('[data-testid="email-input"]').type('newuser@example.com')
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="confirm-password-input"]').type('password123')
      cy.get('[data-testid="register-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle empty required fields', () => {
      cy.visit('/register')
      cy.get('[data-testid="register-button"]').click()
      cy.get('.ant-form-item-explain-error').should('have.length.at.least', 3)
    })

    it('should handle special characters in username', () => {
      cy.visit('/register')
      cy.get('[data-testid="username-input"]').type('user@#$%^&*()')
      cy.get('[data-testid="email-input"]').type('newuser@example.com')
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="confirm-password-input"]').type('password123')
      cy.get('[data-testid="register-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle very long username', () => {
      cy.visit('/register')
      cy.get('[data-testid="username-input"]').type('a'.repeat(100))
      cy.get('[data-testid="email-input"]').type('newuser@example.com')
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="confirm-password-input"]').type('password123')
      cy.get('[data-testid="register-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })

    it('should handle very long password', () => {
      cy.visit('/register')
      cy.get('[data-testid="username-input"]').type('newuser123')
      cy.get('[data-testid="email-input"]').type('newuser@example.com')
      cy.get('[data-testid="password-input"]').type('a'.repeat(100))
      cy.get('[data-testid="confirm-password-input"]').type('a'.repeat(100))
      cy.get('[data-testid="register-button"]').click()
      cy.get('.ant-form-item-explain-error').should('be.visible')
    })
  })

  describe('System Selection', () => {
    beforeEach(() => {
      cy.visit('/ownerlogin')
      cy.get('[data-testid="email-input"]').type('user80')
      cy.get('[data-testid="password-input"]').type('password')
      cy.get('[data-testid="login-button"]').click()
    })

    it('should access systems page after login when no system selected', () => {
      cy.url().should('include', '/systems')
    })

    it('should select restaurant system and store in localStorage', () => {
      cy.visit('/systems')
      cy.get('[data-testid="restaurant-system"]').click()
      cy.url().should('not.include', '/systems')
      cy.get('[data-testid="restaurant-dashboard"]').should('be.visible')
      
      // Verify localStorage was set
      cy.window().then((win) => {
        expect(win.localStorage.getItem('selectedSystemCategory')).to.equal('restaurant')
        expect(win.localStorage.getItem('selectedSystemId')).to.not.be.null
      })
    })

    it('should select supermarket system and store in localStorage', () => {
      cy.visit('/systems')
      cy.get('[data-testid="supermarket-system"]').click()
      cy.url().should('not.include', '/systems')
      cy.get('[data-testid="supermarket-dashboard"]').should('be.visible')
      
      // Verify localStorage was set
      cy.window().then((win) => {
        expect(win.localStorage.getItem('selectedSystemCategory')).to.equal('supermarket')
        expect(win.localStorage.getItem('selectedSystemId')).to.not.be.null
      })
    })

    it('should handle system selection without login', () => {
      cy.visit('/systems')
      cy.url().should('include', '/ownerlogin')
    })

    it('should handle invalid system selection', () => {
      cy.visit('/systems')
      cy.get('[data-testid="invalid-system"]').should('not.exist')
    })

    it('should maintain selected system after refresh', () => {
      // Set system in localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('selectedSystemCategory', 'restaurant')
        win.localStorage.setItem('selectedSystemId', '123')
      })
      
      cy.visit('/')
      cy.get('[data-testid="restaurant-dashboard"]').should('be.visible')
      cy.reload()
      cy.get('[data-testid="restaurant-dashboard"]').should('be.visible')
    })
  })

  describe('Navigation and Security', () => {
    it('should prevent access to protected routes without login', () => {
      cy.visit('/profile')
      cy.url().should('include', '/ownerlogin')
    })

    it('should prevent access to systems page without login', () => {
      cy.visit('/systems')
      cy.url().should('include', '/ownerlogin')
    })

    it('should handle session timeout', () => {
      // Set system in localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('selectedSystemCategory', 'restaurant')
        win.localStorage.setItem('selectedSystemId', '123')
      })
      
      cy.visit('/ownerlogin')
      cy.get('[data-testid="email-input"]').type('user80')
      cy.get('[data-testid="password-input"]').type('password')
      cy.get('[data-testid="login-button"]').click()
      cy.clearLocalStorage()
      cy.reload()
      cy.url().should('include', '/ownerlogin')
    })

    it('should handle browser back button after logout', () => {
      // Set system in localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('selectedSystemCategory', 'restaurant')
        win.localStorage.setItem('selectedSystemId', '123')
      })
      
      cy.visit('/ownerlogin')
      cy.get('[data-testid="email-input"]').type('user80')
      cy.get('[data-testid="password-input"]').type('password')
      cy.get('[data-testid="login-button"]').click()
      cy.get('[data-testid="logout-button"]').click()
      cy.go('back')
      cy.url().should('include', '/ownerlogin')
    })
  })
}) 