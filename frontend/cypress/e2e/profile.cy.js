describe('Profile and Settings Tests', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/ownerLogin')
    cy.get('[data-testid="email-input"]').type('owner@example.com')
    cy.get('[data-testid="password-input"]').type('password123')
    cy.get('[data-testid="login-button"]').click()
  })

  describe('Profile Management', () => {
    it('should update profile information', () => {
      cy.visit('/profile')
      cy.get('[data-testid="name-input"]').clear().type('New Name')
      cy.get('[data-testid="phone-input"]').clear().type('1234567890')
      cy.get('[data-testid="address-input"]').clear().type('New Address')
      cy.get('[data-testid="save-profile-button"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })

    it('should display current profile information', () => {
      cy.visit('/profile')
      cy.get('[data-testid="name-input"]').should('have.value')
      cy.get('[data-testid="phone-input"]').should('have.value')
      cy.get('[data-testid="address-input"]').should('have.value')
    })
  })

  describe('Password Management', () => {
    it('should change password successfully', () => {
      cy.visit('/change-password')
      cy.get('[data-testid="current-password"]').type('oldpassword')
      cy.get('[data-testid="new-password"]').type('newpassword123')
      cy.get('[data-testid="confirm-password"]').type('newpassword123')
      cy.get('[data-testid="change-password-button"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })

    it('should show error with incorrect current password', () => {
      cy.visit('/change-password')
      cy.get('[data-testid="current-password"]').type('wrongpassword')
      cy.get('[data-testid="new-password"]').type('newpassword123')
      cy.get('[data-testid="confirm-password"]').type('newpassword123')
      cy.get('[data-testid="change-password-button"]').click()
      cy.get('.ant-alert-error').should('be.visible')
    })
  })

  describe('Settings', () => {
    it('should access settings page', () => {
      cy.visit('/settings')
      cy.get('[data-testid="settings-page"]').should('be.visible')
    })

    it('should update system settings', () => {
      cy.visit('/settings')
      cy.get('[data-testid="system-name-input"]').clear().type('New System Name')
      cy.get('[data-testid="save-settings-button"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })
  })
}) 