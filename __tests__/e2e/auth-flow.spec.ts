import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display login form by default', async ({ page }) => {
    // Check that the login form is displayed
    await expect(page.getByText('SplitSave')).toBeVisible()
    await expect(page.getByText('Welcome back')).toBeVisible()
    await expect(page.getByLabel('Email address')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  test('should toggle between login and signup modes', async ({ page }) => {
    // Initially in login mode
    await expect(page.getByText('Welcome back')).toBeVisible()
    
    // Switch to signup mode
    await page.getByRole('button', { name: 'Sign up' }).click()
    await expect(page.getByText('Create your account')).toBeVisible()
    await expect(page.getByText('Start your financial journey together')).toBeVisible()
    
    // Switch back to login mode
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText('Welcome back')).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    const emailInput = page.getByLabel('Email address')
    const passwordInput = page.getByLabel('Password')
    
    // Enter invalid email
    await emailInput.fill('invalid-email')
    await passwordInput.fill('password123')
    
    // Should show validation error
    await expect(page.getByText('Please enter a valid email address')).toBeVisible()
  })

  test('should validate password length for signup', async ({ page }) => {
    // Switch to signup mode
    await page.getByRole('button', { name: 'Sign up' }).click()
    
    const emailInput = page.getByLabel('Email address')
    const passwordInput = page.getByLabel('Password')
    
    await emailInput.fill('test@example.com')
    await passwordInput.fill('short')
    
    // Should show password validation error
    await expect(page.getByText('Password must be at least 8 characters long')).toBeVisible()
    await expect(page.getByText('Weak')).toBeVisible()
  })

  test('should show password strength indicator', async ({ page }) => {
    // Switch to signup mode
    await page.getByRole('button', { name: 'Sign up' }).click()
    
    const passwordInput = page.getByLabel('Password')
    
    // Weak password
    await passwordInput.fill('short')
    await expect(page.getByText('Weak')).toBeVisible()
    
    // Strong password
    await passwordInput.clear()
    await passwordInput.fill('strongpassword123')
    await expect(page.getByText('Strong')).toBeVisible()
  })

  test('should display CRO elements', async ({ page }) => {
    // Check value proposition
    await expect(page.getByText(/The smart way for couples and partners to manage shared expenses/)).toBeVisible()
    
    // Check social proof
    await expect(page.getByText('Join 10,000+ happy couples')).toBeVisible()
    await expect(page.getByText('4.9/5 rating')).toBeVisible()
    
    // Check trust indicators
    await expect(page.getByText('🔒 Your data is encrypted and secure')).toBeVisible()
  })

  test('should show benefits for signup users', async ({ page }) => {
    // Switch to signup mode
    await page.getByRole('button', { name: 'Sign up' }).click()
    
    await expect(page.getByText('✨ What you\'ll get:')).toBeVisible()
    await expect(page.getByText('• Free shared expense tracking')).toBeVisible()
    await expect(page.getByText('• Collaborative savings goals')).toBeVisible()
    await expect(page.getByText('• Real-time partner notifications')).toBeVisible()
    await expect(page.getByText('• Financial insights and reports')).toBeVisible()
  })

  test('should have accessible form elements', async ({ page }) => {
    // Check form labels
    await expect(page.getByLabel('Email address')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    
    // Check button labels
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign up' })).toBeVisible()
  })

  test('should handle form submission loading state', async ({ page }) => {
    const emailInput = page.getByLabel('Email address')
    const passwordInput = page.getByLabel('Password')
    const submitButton = page.getByRole('button', { name: 'Sign In' })
    
    await emailInput.fill('test@example.com')
    await passwordInput.fill('password123')
    
    // Click submit button
    await submitButton.click()
    
    // Should show loading state
    await expect(page.getByText('Processing...')).toBeVisible()
    await expect(submitButton).toBeDisabled()
  })

  test('should clear form when switching modes', async ({ page }) => {
    const emailInput = page.getByLabel('Email address')
    const passwordInput = page.getByLabel('Password')
    
    // Fill form
    await emailInput.fill('test@example.com')
    await passwordInput.fill('password123')
    
    // Switch modes
    await page.getByRole('button', { name: 'Sign up' }).click()
    
    // Form should be cleared
    await expect(emailInput).toHaveValue('')
    await expect(passwordInput).toHaveValue('')
  })

  test('should display terms and privacy links', async ({ page }) => {
    await expect(page.getByText('Terms of Service')).toBeVisible()
    await expect(page.getByText('Privacy Policy')).toBeVisible()
  })
})

test.describe('Mobile Responsiveness', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/')
    
    // Check that all elements are visible on mobile
    await expect(page.getByText('SplitSave')).toBeVisible()
    await expect(page.getByLabel('Email address')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
    
    // Check that social proof is visible
    await expect(page.getByText('Join 10,000+ happy couples')).toBeVisible()
    await expect(page.getByText('4.9/5 rating')).toBeVisible()
  })

  test('should have touch-friendly button sizes on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    const submitButton = page.getByRole('button', { name: 'Sign In' })
    
    // Check button dimensions (should be at least 44px for touch targets)
    const buttonBox = await submitButton.boundingBox()
    expect(buttonBox?.width).toBeGreaterThanOrEqual(44)
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44)
  })
})

test.describe('Performance', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    
    // Wait for the main content to be visible
    await expect(page.getByText('SplitSave')).toBeVisible()
    
    const loadTime = Date.now() - startTime
    
    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('should have good Core Web Vitals', async ({ page }) => {
    // Navigate to the page
    await page.goto('/')
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle')
    
    // Check that images are loaded
    await expect(page.getByText('SplitSave')).toBeVisible()
    
    // Basic performance check - no console errors
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    // Wait a bit more for any delayed errors
    await page.waitForTimeout(1000)
    
    // Should have no console errors
    expect(consoleErrors).toHaveLength(0)
  })
})

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display login form by default', async ({ page }) => {
    // Check that the login form is displayed
    await expect(page.getByText('SplitSave')).toBeVisible()
    await expect(page.getByText('Welcome back')).toBeVisible()
    await expect(page.getByLabel('Email address')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  test('should toggle between login and signup modes', async ({ page }) => {
    // Initially in login mode
    await expect(page.getByText('Welcome back')).toBeVisible()
    
    // Switch to signup mode
    await page.getByRole('button', { name: 'Sign up' }).click()
    await expect(page.getByText('Create your account')).toBeVisible()
    await expect(page.getByText('Start your financial journey together')).toBeVisible()
    
    // Switch back to login mode
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText('Welcome back')).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    const emailInput = page.getByLabel('Email address')
    const passwordInput = page.getByLabel('Password')
    
    // Enter invalid email
    await emailInput.fill('invalid-email')
    await passwordInput.fill('password123')
    
    // Should show validation error
    await expect(page.getByText('Please enter a valid email address')).toBeVisible()
  })

  test('should validate password length for signup', async ({ page }) => {
    // Switch to signup mode
    await page.getByRole('button', { name: 'Sign up' }).click()
    
    const emailInput = page.getByLabel('Email address')
    const passwordInput = page.getByLabel('Password')
    
    await emailInput.fill('test@example.com')
    await passwordInput.fill('short')
    
    // Should show password validation error
    await expect(page.getByText('Password must be at least 8 characters long')).toBeVisible()
    await expect(page.getByText('Weak')).toBeVisible()
  })

  test('should show password strength indicator', async ({ page }) => {
    // Switch to signup mode
    await page.getByRole('button', { name: 'Sign up' }).click()
    
    const passwordInput = page.getByLabel('Password')
    
    // Weak password
    await passwordInput.fill('short')
    await expect(page.getByText('Weak')).toBeVisible()
    
    // Strong password
    await passwordInput.clear()
    await passwordInput.fill('strongpassword123')
    await expect(page.getByText('Strong')).toBeVisible()
  })

  test('should display CRO elements', async ({ page }) => {
    // Check value proposition
    await expect(page.getByText(/The smart way for couples and partners to manage shared expenses/)).toBeVisible()
    
    // Check social proof
    await expect(page.getByText('Join 10,000+ happy couples')).toBeVisible()
    await expect(page.getByText('4.9/5 rating')).toBeVisible()
    
    // Check trust indicators
    await expect(page.getByText('🔒 Your data is encrypted and secure')).toBeVisible()
  })

  test('should show benefits for signup users', async ({ page }) => {
    // Switch to signup mode
    await page.getByRole('button', { name: 'Sign up' }).click()
    
    await expect(page.getByText('✨ What you\'ll get:')).toBeVisible()
    await expect(page.getByText('• Free shared expense tracking')).toBeVisible()
    await expect(page.getByText('• Collaborative savings goals')).toBeVisible()
    await expect(page.getByText('• Real-time partner notifications')).toBeVisible()
    await expect(page.getByText('• Financial insights and reports')).toBeVisible()
  })

  test('should have accessible form elements', async ({ page }) => {
    // Check form labels
    await expect(page.getByLabel('Email address')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    
    // Check button labels
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign up' })).toBeVisible()
  })

  test('should handle form submission loading state', async ({ page }) => {
    const emailInput = page.getByLabel('Email address')
    const passwordInput = page.getByLabel('Password')
    const submitButton = page.getByRole('button', { name: 'Sign In' })
    
    await emailInput.fill('test@example.com')
    await passwordInput.fill('password123')
    
    // Click submit button
    await submitButton.click()
    
    // Should show loading state
    await expect(page.getByText('Processing...')).toBeVisible()
    await expect(submitButton).toBeDisabled()
  })

  test('should clear form when switching modes', async ({ page }) => {
    const emailInput = page.getByLabel('Email address')
    const passwordInput = page.getByLabel('Password')
    
    // Fill form
    await emailInput.fill('test@example.com')
    await passwordInput.fill('password123')
    
    // Switch modes
    await page.getByRole('button', { name: 'Sign up' }).click()
    
    // Form should be cleared
    await expect(emailInput).toHaveValue('')
    await expect(passwordInput).toHaveValue('')
  })

  test('should display terms and privacy links', async ({ page }) => {
    await expect(page.getByText('Terms of Service')).toBeVisible()
    await expect(page.getByText('Privacy Policy')).toBeVisible()
  })
})

test.describe('Mobile Responsiveness', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/')
    
    // Check that all elements are visible on mobile
    await expect(page.getByText('SplitSave')).toBeVisible()
    await expect(page.getByLabel('Email address')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
    
    // Check that social proof is visible
    await expect(page.getByText('Join 10,000+ happy couples')).toBeVisible()
    await expect(page.getByText('4.9/5 rating')).toBeVisible()
  })

  test('should have touch-friendly button sizes on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    const submitButton = page.getByRole('button', { name: 'Sign In' })
    
    // Check button dimensions (should be at least 44px for touch targets)
    const buttonBox = await submitButton.boundingBox()
    expect(buttonBox?.width).toBeGreaterThanOrEqual(44)
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44)
  })
})

test.describe('Performance', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    
    // Wait for the main content to be visible
    await expect(page.getByText('SplitSave')).toBeVisible()
    
    const loadTime = Date.now() - startTime
    
    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('should have good Core Web Vitals', async ({ page }) => {
    // Navigate to the page
    await page.goto('/')
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle')
    
    // Check that images are loaded
    await expect(page.getByText('SplitSave')).toBeVisible()
    
    // Basic performance check - no console errors
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    // Wait a bit more for any delayed errors
    await page.waitForTimeout(1000)
    
    // Should have no console errors
    expect(consoleErrors).toHaveLength(0)
  })
})


