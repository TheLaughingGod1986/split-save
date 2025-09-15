import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use
  
  // Start browser and create a new context
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  
  try {
    // Navigate to the application
    await page.goto(baseURL!)
    
    // Wait for the application to load
    await page.waitForLoadState('networkidle')
    
    // Verify the application is accessible
    await page.waitForSelector('text=SplitSave', { timeout: 10000 })
    
    console.log('✅ Application is accessible and ready for testing')
    
    // Optional: Set up test data or authentication state here
    // For example, create test users, seed database, etc.
    
  } catch (error) {
    console.error('❌ Failed to set up test environment:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use
  
  // Start browser and create a new context
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  
  try {
    // Navigate to the application
    await page.goto(baseURL!)
    
    // Wait for the application to load
    await page.waitForLoadState('networkidle')
    
    // Verify the application is accessible
    await page.waitForSelector('text=SplitSave', { timeout: 10000 })
    
    console.log('✅ Application is accessible and ready for testing')
    
    // Optional: Set up test data or authentication state here
    // For example, create test users, seed database, etc.
    
  } catch (error) {
    console.error('❌ Failed to set up test environment:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup


