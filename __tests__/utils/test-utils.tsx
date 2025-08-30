import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/components/AuthProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Mock data for testing
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

export const mockGoals = [
  {
    id: 'goal-1',
    name: 'Emergency Fund',
    description: 'Save for unexpected expenses',
    target_amount: 5000,
    current_amount: 2500,
    monthly_contribution: 500,
    target_date: '2024-12-31',
    priority: 'high',
    category: 'emergency',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'goal-2',
    name: 'Holiday Fund',
    description: 'Save for summer vacation',
    target_amount: 2000,
    current_amount: 800,
    monthly_contribution: 200,
    target_date: '2024-06-30',
    priority: 'medium',
    category: 'leisure',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

export const mockContributions = [
  {
    id: 'contribution-1',
    goal_id: 'goal-1',
    amount: 500,
    description: 'Monthly contribution',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'contribution-2',
    goal_id: 'goal-2',
    amount: 200,
    description: 'Monthly contribution',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

export const mockExpenses = [
  {
    id: 'expense-1',
    description: 'Groceries',
    amount: 150,
    category: 'Food',
    date: '2024-01-01',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'expense-2',
    description: 'Gas',
    amount: 80,
    category: 'Transportation',
    date: '2024-01-01',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

export const mockPartnerships = [
  {
    id: 'partnership-1',
    partner_name: 'John Doe',
    partner_email: 'john@example.com',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

export const mockAchievements = [
  {
    id: 'achievement-1',
    name: 'First Steps',
    description: 'Complete your first contribution',
    icon: '🎯',
    points: 10,
    unlocked_at: '2024-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'achievement-2',
    name: 'Goal Setter',
    description: 'Create your first savings goal',
    icon: '🎯',
    points: 20,
    unlocked_at: '2024-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z'
  }
]

// Mock API responses
export const mockApiResponses = {
  goals: {
    data: mockGoals,
    status: 200,
    message: 'Goals retrieved successfully'
  },
  contributions: {
    data: mockContributions,
    status: 200,
    message: 'Contributions retrieved successfully'
  },
  expenses: {
    data: mockExpenses,
    status: 200,
    message: 'Expenses retrieved successfully'
  },
  partnerships: {
    data: mockPartnerships,
    status: 200,
    message: 'Partnerships retrieved successfully'
  },
  achievements: {
    data: mockAchievements,
    status: 200,
    message: 'Achievements retrieved successfully'
  }
}

// Mock functions
export const mockFunctions = {
  onGoalCreate: jest.fn(),
  onGoalUpdate: jest.fn(),
  onGoalDelete: jest.fn(),
  onContributionCreate: jest.fn(),
  onContributionUpdate: jest.fn(),
  onContributionDelete: jest.fn(),
  onExpenseCreate: jest.fn(),
  onExpenseUpdate: jest.fn(),
  onExpenseDelete: jest.fn(),
  onNotificationAction: jest.fn(),
  onCelebrationClose: jest.fn(),
  onInsightAction: jest.fn(),
  onRecommendationAction: jest.fn()
}

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything from testing-library/react
export * from '@testing-library/react'
export { customRender as render }

// Test data generators
export const generateMockGoal = (overrides: Partial<typeof mockGoals[0]> = {}) => ({
  id: `goal-${Date.now()}-${Math.random()}`,
  name: 'Test Goal',
  description: 'Test goal description',
  target_amount: 1000,
  current_amount: 0,
  monthly_contribution: 100,
  target_date: '2024-12-31',
  priority: 'medium',
  category: 'general',
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

export const generateMockContribution = (overrides: Partial<typeof mockContributions[0]> = {}) => ({
  id: `contribution-${Date.now()}-${Math.random()}`,
  goal_id: 'goal-1',
  amount: 100,
  description: 'Test contribution',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

export const generateMockExpense = (overrides: Partial<typeof mockExpenses[0]> = {}) => ({
  id: `expense-${Date.now()}-${Math.random()}`,
  description: 'Test expense',
  amount: 50,
  category: 'General',
  date: new Date().toISOString().split('T')[0],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

// Test helpers
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

export const mockApiCall = (response: any, delay = 100) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(response), delay)
  })
}

export const createMockApiError = (message: string, status = 500) => {
  return {
    error: true,
    message,
    status,
    timestamp: new Date().toISOString()
  }
}

// Mock Intersection Observer
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  })
  window.IntersectionObserver = mockIntersectionObserver
}

// Mock Resize Observer
export const mockResizeObserver = () => {
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))
}

// Mock matchMedia
export const mockMatchMedia = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

// Mock localStorage
export const mockLocalStorage = () => {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  }
  global.localStorage = localStorageMock
}

// Mock sessionStorage
export const mockSessionStorage = () => {
  const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  }
  global.sessionStorage = sessionStorageMock
}

// Mock fetch
export const mockFetch = (response: any, status = 200) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    })
  ) as jest.Mock
}

// Mock console methods
export const mockConsole = () => {
  const originalConsole = { ...console }
  
  beforeAll(() => {
    console.log = jest.fn()
    console.warn = jest.fn()
    console.error = jest.fn()
  })
  
  afterAll(() => {
    console.log = originalConsole.log
    console.warn = originalConsole.warn
    console.error = originalConsole.error
  })
}

// Test environment setup
export const setupTestEnvironment = () => {
  beforeAll(() => {
    mockIntersectionObserver()
    mockResizeObserver()
    mockMatchMedia()
    mockLocalStorage()
    mockSessionStorage()
  })
  
  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })
}

// Custom matchers
export const expectElementToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument()
  expect(element).toBeVisible()
}

export const expectElementToHaveText = (element: HTMLElement, text: string) => {
  expect(element).toHaveTextContent(text)
}

export const expectElementToHaveClass = (element: HTMLElement, className: string) => {
  expect(element).toHaveClass(className)
}

export const expectElementToBeDisabled = (element: HTMLElement) => {
  expect(element).toBeDisabled()
}

export const expectElementToBeEnabled = (element: HTMLElement) => {
  expect(element).toBeEnabled()
}

// Async test helpers
export const waitForElementToBeRemoved = async (element: HTMLElement) => {
  await new Promise(resolve => {
    const observer = new MutationObserver(() => {
      if (!document.contains(element)) {
        observer.disconnect()
        resolve(undefined)
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
  })
}

export const waitForCondition = async (condition: () => boolean, timeout = 5000) => {
  const startTime = Date.now()
  
  while (!condition() && Date.now() - startTime < timeout) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  if (!condition()) {
    throw new Error(`Condition not met within ${timeout}ms`)
  }
}

// Snapshot testing helpers
export const expectComponentToMatchSnapshot = (component: ReactElement) => {
  const { container } = render(component)
  expect(container.firstChild).toMatchSnapshot()
}

// Accessibility testing helpers
export const expectComponentToBeAccessible = async (component: ReactElement) => {
  const { container } = render(component)
  
  // Basic accessibility checks
  const buttons = container.querySelectorAll('button')
  buttons.forEach(button => {
    if (!button.getAttribute('aria-label') && !button.textContent?.trim()) {
      console.warn('Button without accessible label:', button)
    }
  })
  
  const images = container.querySelectorAll('img')
  images.forEach(img => {
    if (!img.getAttribute('alt')) {
      console.warn('Image without alt text:', img)
    }
  })
}

// Performance testing helpers
export const measureRenderTime = async (component: ReactElement) => {
  const startTime = performance.now()
  const { container } = render(component)
  const endTime = performance.now()
  
  const renderTime = endTime - startTime
  
  // Performance assertions
  expect(renderTime).toBeLessThan(100) // Should render in less than 100ms
  
  return {
    renderTime,
    container
  }
}

// Mock data cleanup
export const cleanupMockData = () => {
  jest.clearAllMocks()
  jest.clearAllTimers()
  
  // Clear any stored mock data
  if (global.localStorage) {
    global.localStorage.clear()
  }
  
  if (global.sessionStorage) {
    global.sessionStorage.clear()
  }
}


