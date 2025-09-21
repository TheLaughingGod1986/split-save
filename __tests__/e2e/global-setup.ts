import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use

  if (!baseURL) {
    throw new Error('Base URL is not defined in Playwright config')
  }

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    await page.goto(baseURL)
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('text=SplitSave', { timeout: 10000 })
    console.log('✅ Application is accessible and ready for testing')
  } catch (error) {
    console.error('❌ Failed to set up test environment:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup
