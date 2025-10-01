import { FullConfig } from '@playwright/test'

async function globalTeardown(_config: FullConfig) {
  try {
    console.log('🧹 Cleaning up test environment...')
    // Add any environment cleanup here when needed
    console.log('✅ Test environment cleanup completed')
  } catch (error) {
    console.error('❌ Failed to clean up test environment:', error)
  }
}

export default globalTeardown
