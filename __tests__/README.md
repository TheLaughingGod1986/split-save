# SplitSave Testing Guide

This document provides comprehensive information about testing the SplitSave application, including unit tests, integration tests, E2E tests, and performance testing.

## 🧪 Testing Overview

SplitSave uses a multi-layered testing approach to ensure quality and reliability:

- **Unit Tests**: Component and function-level testing with Jest
- **Integration Tests**: API and database interaction testing
- **E2E Tests**: Full user workflow testing with Playwright
- **Performance Tests**: Core Web Vitals and Lighthouse testing
- **Accessibility Tests**: WCAG compliance and usability testing

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Run all tests with coverage
npm run test:all

# Run performance tests
npm run test:performance
```

## 📋 Test Scripts

| Script | Description |
|--------|-------------|
| `npm run test` | Run unit tests in watch mode |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:ci` | Run tests for CI/CD pipeline |
| `npm run test:e2e` | Run E2E tests with Playwright |
| `npm run test:e2e:ui` | Run E2E tests with UI |
| `npm run test:performance` | Run Lighthouse performance tests |
| `npm run test:accessibility` | Run accessibility tests |
| `npm run test:unit` | Run only unit tests |
| `npm run test:integration` | Run only integration tests |
| `npm run test:all` | Run all test suites |

## 🧩 Unit Testing

### Test Structure

```
__tests__/
├── components/          # Component tests
│   ├── LoginForm.test.tsx
│   ├── ErrorBoundary.test.tsx
│   └── ...
├── lib/                # Utility function tests
├── api/                # API route tests
└── utils/              # Test utilities
```

### Running Unit Tests

```bash
# Run all unit tests
npm run test

# Run specific test file
npm run test LoginForm.test.tsx

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Writing Unit Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { LoginForm } from '@/components/LoginForm'

describe('LoginForm', () => {
  it('renders login form by default', () => {
    render(<LoginForm />)
    
    expect(screen.getByText('SplitSave')).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
  })
})
```

## 🌐 E2E Testing

### Test Structure

```
__tests__/e2e/
├── auth-flow.spec.ts    # Authentication tests
├── dashboard.spec.ts    # Dashboard tests
├── goals.spec.ts        # Goals management tests
├── expenses.spec.ts     # Expense tracking tests
├── global-setup.ts      # Global setup
└── global-teardown.ts   # Global cleanup
```

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test auth-flow.spec.ts

# Run tests with UI
npm run test:e2e:ui

# Run tests in headed mode
npx playwright test --headed
```

### Writing E2E Tests

```typescript
import { test, expect } from '@playwright/test'

test('should display login form', async ({ page }) => {
  await page.goto('/')
  
  await expect(page.getByText('SplitSave')).toBeVisible()
  await expect(page.getByLabel('Email address')).toBeVisible()
})
```

## 📊 Performance Testing

### Lighthouse Testing

```bash
# Run Lighthouse performance test
npm run test:performance

# View results
open lighthouse-report.html
```

### Core Web Vitals

The application is optimized for:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

## ♿ Accessibility Testing

### WCAG Compliance

```bash
# Run accessibility tests
npm run test:accessibility

# Manual testing checklist
# - Keyboard navigation
# - Screen reader compatibility
# - Color contrast
# - Focus management
```

## 🔧 Test Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

### Playwright Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
})
```

## 🎯 Test Coverage Goals

| Metric | Target |
|--------|--------|
| **Statements** | 80%+ |
| **Branches** | 80%+ |
| **Functions** | 80%+ |
| **Lines** | 80%+ |

## 🚨 Common Testing Patterns

### Mocking External Dependencies

```typescript
// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
    },
  },
}))

// Mock API client
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}))
```

### Testing Async Operations

```typescript
test('should handle async operations', async () => {
  const user = userEvent.setup()
  
  await user.type(emailInput, 'test@example.com')
  await user.click(submitButton)
  
  await waitFor(() => {
    expect(screen.getByText('Success')).toBeInTheDocument()
  })
})
```

### Testing Error States

```typescript
test('should display error messages', async () => {
  // Mock error response
  jest.spyOn(apiClient, 'post').mockRejectedValue(new Error('API Error'))
  
  fireEvent.click(submitButton)
  
  await waitFor(() => {
    expect(screen.getByText('API Error')).toBeInTheDocument()
  })
})
```

## 🔍 Debugging Tests

### Jest Debug Mode

```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Use console.log for debugging
console.log('Debug info:', { data, state })
```

### Playwright Debug Mode

```bash
# Run tests in debug mode
npx playwright test --debug

# Use page.pause() for debugging
await page.pause()
```

### Visual Debugging

```bash
# Take screenshots on failure
npx playwright test --screenshot=only-on-failure

# Record video
npx playwright test --video=retain-on-failure
```

## 📈 Continuous Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:ci
      - run: npm run test:e2e
```

### Pre-commit Hooks

```bash
# Install husky
npm install --save-dev husky

# Set up pre-commit hook
npx husky install
npx husky add .husky/pre-commit "npm run test:ci"
```

## 🐛 Troubleshooting

### Common Issues

1. **Tests failing due to missing mocks**
   - Ensure all external dependencies are properly mocked
   - Check jest.setup.js for global mocks

2. **E2E tests timing out**
   - Increase timeout values in playwright.config.ts
   - Check if the dev server is running

3. **Coverage not meeting thresholds**
   - Add tests for uncovered code paths
   - Check if coverage exclusions are correct

4. **Performance tests failing**
   - Ensure the application is running
   - Check network conditions and server performance

### Getting Help

- Check the test output for detailed error messages
- Review the test configuration files
- Consult the testing documentation
- Check GitHub Issues for known problems

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🎉 Contributing

When adding new features, please ensure:

1. **Unit tests** cover the new functionality
2. **E2E tests** verify the user workflow
3. **Accessibility tests** ensure usability
4. **Performance tests** verify no regressions
5. **Test coverage** meets the 80% threshold

Happy testing! 🧪✨

This document provides comprehensive information about testing the SplitSave application, including unit tests, integration tests, E2E tests, and performance testing.

## 🧪 Testing Overview

SplitSave uses a multi-layered testing approach to ensure quality and reliability:

- **Unit Tests**: Component and function-level testing with Jest
- **Integration Tests**: API and database interaction testing
- **E2E Tests**: Full user workflow testing with Playwright
- **Performance Tests**: Core Web Vitals and Lighthouse testing
- **Accessibility Tests**: WCAG compliance and usability testing

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Run all tests with coverage
npm run test:all

# Run performance tests
npm run test:performance
```

## 📋 Test Scripts

| Script | Description |
|--------|-------------|
| `npm run test` | Run unit tests in watch mode |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:ci` | Run tests for CI/CD pipeline |
| `npm run test:e2e` | Run E2E tests with Playwright |
| `npm run test:e2e:ui` | Run E2E tests with UI |
| `npm run test:performance` | Run Lighthouse performance tests |
| `npm run test:accessibility` | Run accessibility tests |
| `npm run test:unit` | Run only unit tests |
| `npm run test:integration` | Run only integration tests |
| `npm run test:all` | Run all test suites |

## 🧩 Unit Testing

### Test Structure

```
__tests__/
├── components/          # Component tests
│   ├── LoginForm.test.tsx
│   ├── ErrorBoundary.test.tsx
│   └── ...
├── lib/                # Utility function tests
├── api/                # API route tests
└── utils/              # Test utilities
```

### Running Unit Tests

```bash
# Run all unit tests
npm run test

# Run specific test file
npm run test LoginForm.test.tsx

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Writing Unit Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { LoginForm } from '@/components/LoginForm'

describe('LoginForm', () => {
  it('renders login form by default', () => {
    render(<LoginForm />)
    
    expect(screen.getByText('SplitSave')).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
  })
})
```

## 🌐 E2E Testing

### Test Structure

```
__tests__/e2e/
├── auth-flow.spec.ts    # Authentication tests
├── dashboard.spec.ts    # Dashboard tests
├── goals.spec.ts        # Goals management tests
├── expenses.spec.ts     # Expense tracking tests
├── global-setup.ts      # Global setup
└── global-teardown.ts   # Global cleanup
```

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test auth-flow.spec.ts

# Run tests with UI
npm run test:e2e:ui

# Run tests in headed mode
npx playwright test --headed
```

### Writing E2E Tests

```typescript
import { test, expect } from '@playwright/test'

test('should display login form', async ({ page }) => {
  await page.goto('/')
  
  await expect(page.getByText('SplitSave')).toBeVisible()
  await expect(page.getByLabel('Email address')).toBeVisible()
})
```

## 📊 Performance Testing

### Lighthouse Testing

```bash
# Run Lighthouse performance test
npm run test:performance

# View results
open lighthouse-report.html
```

### Core Web Vitals

The application is optimized for:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

## ♿ Accessibility Testing

### WCAG Compliance

```bash
# Run accessibility tests
npm run test:accessibility

# Manual testing checklist
# - Keyboard navigation
# - Screen reader compatibility
# - Color contrast
# - Focus management
```

## 🔧 Test Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

### Playwright Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
})
```

## 🎯 Test Coverage Goals

| Metric | Target |
|--------|--------|
| **Statements** | 80%+ |
| **Branches** | 80%+ |
| **Functions** | 80%+ |
| **Lines** | 80%+ |

## 🚨 Common Testing Patterns

### Mocking External Dependencies

```typescript
// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
    },
  },
}))

// Mock API client
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}))
```

### Testing Async Operations

```typescript
test('should handle async operations', async () => {
  const user = userEvent.setup()
  
  await user.type(emailInput, 'test@example.com')
  await user.click(submitButton)
  
  await waitFor(() => {
    expect(screen.getByText('Success')).toBeInTheDocument()
  })
})
```

### Testing Error States

```typescript
test('should display error messages', async () => {
  // Mock error response
  jest.spyOn(apiClient, 'post').mockRejectedValue(new Error('API Error'))
  
  fireEvent.click(submitButton)
  
  await waitFor(() => {
    expect(screen.getByText('API Error')).toBeInTheDocument()
  })
})
```

## 🔍 Debugging Tests

### Jest Debug Mode

```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Use console.log for debugging
console.log('Debug info:', { data, state })
```

### Playwright Debug Mode

```bash
# Run tests in debug mode
npx playwright test --debug

# Use page.pause() for debugging
await page.pause()
```

### Visual Debugging

```bash
# Take screenshots on failure
npx playwright test --screenshot=only-on-failure

# Record video
npx playwright test --video=retain-on-failure
```

## 📈 Continuous Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:ci
      - run: npm run test:e2e
```

### Pre-commit Hooks

```bash
# Install husky
npm install --save-dev husky

# Set up pre-commit hook
npx husky install
npx husky add .husky/pre-commit "npm run test:ci"
```

## 🐛 Troubleshooting

### Common Issues

1. **Tests failing due to missing mocks**
   - Ensure all external dependencies are properly mocked
   - Check jest.setup.js for global mocks

2. **E2E tests timing out**
   - Increase timeout values in playwright.config.ts
   - Check if the dev server is running

3. **Coverage not meeting thresholds**
   - Add tests for uncovered code paths
   - Check if coverage exclusions are correct

4. **Performance tests failing**
   - Ensure the application is running
   - Check network conditions and server performance

### Getting Help

- Check the test output for detailed error messages
- Review the test configuration files
- Consult the testing documentation
- Check GitHub Issues for known problems

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🎉 Contributing

When adding new features, please ensure:

1. **Unit tests** cover the new functionality
2. **E2E tests** verify the user workflow
3. **Accessibility tests** ensure usability
4. **Performance tests** verify no regressions
5. **Test coverage** meets the 80% threshold

Happy testing! 🧪✨


