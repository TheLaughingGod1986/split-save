import '@testing-library/jest-dom'
import React from 'react'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock framer-motion - using plain JavaScript instead of JSX
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => React.createElement('div', props, children),
    button: ({ children, ...props }) => React.createElement('button', props, children),
    span: ({ children, ...props }) => React.createElement('span', props, children),
    p: ({ children, ...props }) => React.createElement('p', props, children),
    h1: ({ children, ...props }) => React.createElement('h1', props, children),
    h2: ({ children, ...props }) => React.createElement('h2', props, children),
    h3: ({ children, ...props }) => React.createElement('h3', props, children),
    h4: ({ children, ...props }) => React.createElement('h4', props, children),
    h5: ({ children, ...props }) => React.createElement('h5', props, children),
    h6: ({ children, ...props }) => React.createElement('h6', props, children),
    ul: ({ children, ...props }) => React.createElement('ul', props, children),
    li: ({ children, ...props }) => React.createElement('li', props, children),
    form: ({ children, ...props }) => React.createElement('form', props, children),
    input: (props) => React.createElement('input', props),
    textarea: (props) => React.createElement('textarea', props),
    select: ({ children, ...props }) => React.createElement('select', props, children),
    option: ({ children, ...props }) => React.createElement('option', props, children),
    label: ({ children, ...props }) => React.createElement('label', props, children),
    a: ({ children, ...props }) => React.createElement('a', props, children),
    img: (props) => React.createElement('img', props),
    svg: ({ children, ...props }) => React.createElement('svg', props, children),
    path: (props) => React.createElement('path', props),
    circle: (props) => React.createElement('circle', props),
    rect: (props) => React.createElement('rect', props),
    g: ({ children, ...props }) => React.createElement('g', props, children),
    line: (props) => React.createElement('line', props),
    polyline: (props) => React.createElement('polyline', props),
    polygon: (props) => React.createElement('polygon', props),
    ellipse: (props) => React.createElement('ellipse', props),
    defs: ({ children, ...props }) => React.createElement('defs', props, children),
    use: (props) => React.createElement('use', props),
    symbol: ({ children, ...props }) => React.createElement('symbol', props, children),
    mask: ({ children, ...props }) => React.createElement('mask', props, children),
    filter: ({ children, ...props }) => React.createElement('filter', props, children),
    feGaussianBlur: (props) => React.createElement('feGaussianBlur', props),
    feOffset: (props) => React.createElement('feOffset', props),
    feMerge: ({ children, ...props }) => React.createElement('feMerge', props, children),
    feMergeNode: (props) => React.createElement('feMergeNode', props),
    feBlend: (props) => React.createElement('feBlend', props),
    feColorMatrix: (props) => React.createElement('feColorMatrix', props),
    feComponentTransfer: ({ children, ...props }) => React.createElement('feComponentTransfer', props, children),
    feFuncR: (props) => React.createElement('feFuncR', props),
    feFuncG: (props) => React.createElement('feFuncG', props),
    feFuncB: (props) => React.createElement('feFuncB', props),
    feFuncA: (props) => React.createElement('feFuncA', props),
    feComposite: (props) => React.createElement('feComposite', props),
    feConvolveMatrix: (props) => React.createElement('feConvolveMatrix', props),
    feDiffuseLighting: ({ children, ...props }) => React.createElement('feDiffuseLighting', props, children),
    feDistantLight: (props) => React.createElement('feDistantLight', props),
    fePointLight: (props) => React.createElement('fePointLight', props),
    feSpotLight: (props) => React.createElement('feSpotLight', props),
    feDisplacementMap: (props) => React.createElement('feDisplacementMap', props),
    feDropShadow: (props) => React.createElement('feDropShadow', props),
    feFlood: (props) => React.createElement('feFlood', props),
    feImage: (props) => React.createElement('feImage', props),
    feMorphology: (props) => React.createElement('feMorphology', props),
    feSpecularLighting: ({ children, ...props }) => React.createElement('feSpecularLighting', props, children),
    feTile: (props) => React.createElement('feTile', props),
    feTurbulence: (props) => React.createElement('feTurbulence', props),
    feUnsharpMask: (props) => React.createElement('feUnsharpMask', props ),
  },
  AnimatePresence: ({ children }) => children,
  useMotionValue: (initial) => ({ current: initial }),
  useTransform: (value, transformer) => ({ current: transformer(value.current) }),
  useSpring: (value) => ({ current: value }),
  useMotionTemplate: (template) => template,
  useAnimate: () => [jest.fn(), jest.fn()],
  useInView: () => ({ ref: jest.fn(), inView: true }),
  useReducedMotion: () => false,
  useScroll: () => ({ scrollY: { current: 0 }, scrollX: { current: 0 } }),
  useMotionValueEvent: () => {},
  useCycle: (...args) => [args[0], jest.fn()],
  usePresence: () => [true, jest.fn()],
  useDragControls: () => [jest.fn(), jest.fn()],
  useAnimationControls: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
    play: jest.fn(),
    pause: jest.fn(),
    then: jest.fn(),
  }),
}))

// Mock react-hot-toast
jest.mock('@/lib/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}))

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      like: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      and: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
      unsubscribe: jest.fn().mockReturnThis(),
    })),
  },
}))

// Mock API client
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
}))

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock fetch
global.fetch = jest.fn()

// Mock console methods to reduce noise in tests
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


