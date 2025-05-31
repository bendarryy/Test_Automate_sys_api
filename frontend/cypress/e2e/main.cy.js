describe('Main Application Flow', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('Authentication', () => {
    it('should navigate to owner login page', () => {
      cy.get('[data-testid="owner-login-link"]').click()
      cy.url().should('include', '/owner-login')
    })

    it('should navigate to employee login page', () => {
      cy.get('[data-testid="employee-login-link"]').click()
      cy.url().should('include', '/employee-login')
    })

    it('should navigate to registration page', () => {
      cy.get('[data-testid="register-link"]').click()
      cy.url().should('include', '/register')
    })
  })

  describe('Restaurant Features', () => {
    beforeEach(() => {
      // Login as restaurant owner
      cy.visit('/owner-login')
      cy.get('[data-testid="email-input"]').type('owner@example.com')
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="login-button"]').click()
    })

    it('should display restaurant dashboard', () => {
      cy.url().should('include', '/restaurant')
      cy.get('[data-testid="restaurant-dashboard"]').should('be.visible')
    })

    it('should navigate to settings', () => {
      cy.get('[data-testid="settings-link"]').click()
      cy.url().should('include', '/settings')
      cy.get('[data-testid="settings-page"]').should('be.visible')
    })

    it('should update profile information', () => {
      cy.visit('/profile')
      cy.get('[data-testid="profile-form"]').should('be.visible')
      cy.get('[data-testid="name-input"]').clear().type('New Name')
      cy.get('[data-testid="save-profile-button"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })
  })

  describe('Supermarket Features', () => {
    beforeEach(() => {
      // Login as supermarket owner
      cy.visit('/owner-login')
      cy.get('[data-testid="email-input"]').type('supermarket@example.com')
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="login-button"]').click()
    })

    it('should display supermarket dashboard', () => {
      cy.url().should('include', '/supermarket')
      cy.get('[data-testid="supermarket-dashboard"]').should('be.visible')
    })
  })

  describe('System Settings', () => {
    beforeEach(() => {
      // Login as admin
      cy.visit('/owner-login')
      cy.get('[data-testid="email-input"]').type('admin@example.com')
      cy.get('[data-testid="password-input"]').type('admin123')
      cy.get('[data-testid="login-button"]').click()
    })

    it('should access system settings', () => {
      cy.get('[data-testid="systems-link"]').click()
      cy.url().should('include', '/systems')
      cy.get('[data-testid="systems-page"]').should('be.visible')
    })

    it('should change password', () => {
      cy.visit('/change-password')
      cy.get('[data-testid="current-password"]').type('oldpassword')
      cy.get('[data-testid="new-password"]').type('newpassword123')
      cy.get('[data-testid="confirm-password"]').type('newpassword123')
      cy.get('[data-testid="change-password-button"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })
  })
}) 