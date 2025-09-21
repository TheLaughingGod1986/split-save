import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/auth/LoginForm'

// Mock the toast module
jest.mock('@/lib/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
    },
  },
}))

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders login form by default', () => {
      render(<LoginForm />)
      
      expect(screen.getByText('SplitSave')).toBeInTheDocument()
      expect(screen.getByText('Welcome back')).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /email address/i })).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('renders signup form when toggled', () => {
      render(<LoginForm />)
      
      const toggleButton = screen.getByRole('button', { name: /sign up/i })
      fireEvent.click(toggleButton)
      
      expect(screen.getByText('Create your account')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    it('displays hero section with social proof', () => {
      render(<LoginForm />)
      
      expect(screen.getByText('Join 10,000+ happy couples')).toBeInTheDocument()
      expect(screen.getByText('4.9/5 rating')).toBeInTheDocument()
      expect(screen.getByText('★★★★★')).toBeInTheDocument()
    })

    it('shows trust indicators', () => {
      render(<LoginForm />)
      
      expect(screen.getByText('🔒 Your data is encrypted and secure')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('validates email format', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)
      
      const emailInput = screen.getByRole('textbox', { name: /email address/i })
      const passwordInput = screen.getByPlaceholderText(/password/i)
      
      // Test invalid email
      await user.type(emailInput, 'invalid-email')
      await user.type(passwordInput, 'password123')
      
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })

    it('validates password length for signup', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)
      
      // Switch to signup mode
      const toggleButton = screen.getByRole('button', { name: /sign up/i })
      fireEvent.click(toggleButton)
      
      const emailInput = screen.getByRole('textbox', { name: /email address/i })
      const passwordInput = screen.getByPlaceholderText(/password/i)
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'short')
      
      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument()
      expect(screen.getByText('Weak')).toBeInTheDocument()
    })

    it('shows password strength indicator', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)
      
      // Switch to signup mode
      const toggleButton = screen.getByRole('button', { name: /sign up/i })
      fireEvent.click(toggleButton)
      
      const passwordInput = screen.getByPlaceholderText(/password/i)
      
      // Weak password
      await user.type(passwordInput, 'short')
      expect(screen.getByText('Weak')).toBeInTheDocument()
      
      // Strong password
      await user.clear(passwordInput)
      await user.type(passwordInput, 'StrongPassword123!')
      expect(screen.getByText('Strong')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('toggles between login and signup modes', () => {
      render(<LoginForm />)
      
      // Initially in login mode
      expect(screen.getByText('Welcome back')).toBeInTheDocument()
      
      // Switch to signup
      const signupButton = screen.getByRole('button', { name: /sign up/i })
      fireEvent.click(signupButton)
      
      expect(screen.getByText('Create your account')).toBeInTheDocument()
      expect(screen.getByText('Start your financial journey together')).toBeInTheDocument()
      
      // Switch back to login
      const signinButton = screen.getByRole('button', { name: /sign in/i })
      fireEvent.click(signinButton)
      
      expect(screen.getByText('Welcome back')).toBeInTheDocument()
    })

    it('toggles password visibility', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)
      
      const passwordInput = screen.getByPlaceholderText(/password/i)
      const toggleButton = screen.getByRole('button', { name: /show password/i })
      
      // Password should be hidden by default
      expect(passwordInput).toHaveAttribute('type', 'password')
      
      // Click to show password
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')
      
      // Click to hide password again
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('shows loading state during form submission', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)
      
      const emailInput = screen.getByRole('textbox', { name: /email address/i })
      const passwordInput = screen.getByPlaceholderText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      
      // Mock async operation
      jest.spyOn(require('@/lib/supabase').supabase.auth, 'signInWithPassword')
        .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      fireEvent.click(submitButton)
      
      expect(screen.getByText('Processing...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })
  })

  describe('CRO Elements', () => {
    it('displays value proposition clearly', () => {
      render(<LoginForm />)
      
      expect(screen.getByText(/The smart way for couples and partners to manage shared expenses and build financial harmony together/)).toBeInTheDocument()
    })

    it('shows benefits for signup users', () => {
      render(<LoginForm />)
      
      // Switch to signup mode
      const toggleButton = screen.getByRole('button', { name: /sign up/i })
      fireEvent.click(toggleButton)
      
      expect(screen.getByText('✨ What you\'ll get:')).toBeInTheDocument()
      expect(screen.getByText('• Free shared expense tracking')).toBeInTheDocument()
      expect(screen.getByText('• Collaborative savings goals')).toBeInTheDocument()
      expect(screen.getByText('• Real-time partner notifications')).toBeInTheDocument()
      expect(screen.getByText('• Financial insights and reports')).toBeInTheDocument()
    })

    it('includes social proof elements', () => {
      render(<LoginForm />)
      
      expect(screen.getByText('Join 10,000+ happy couples')).toBeInTheDocument()
      expect(screen.getByText('4.9/5 rating')).toBeInTheDocument()
    })

    it('has clear call-to-action buttons', () => {
      render(<LoginForm />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      expect(submitButton).toBeInTheDocument()
      expect(submitButton).toHaveClass('bg-purple-600')
      expect(submitButton).toHaveClass('text-white')
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      render(<LoginForm />)
      
      expect(screen.getByRole('textbox', { name: /email address/i })).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
    })

    it('has proper button labels', () => {
      render(<LoginForm />)
      
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
    })

    it('shows validation errors clearly', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)
      
      const emailInput = screen.getByRole('textbox', { name: /email address/i })
      await user.type(emailInput, 'invalid-email')
      
      // Trigger validation by blurring the input
      fireEvent.blur(emailInput)
      
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })
  })

  describe('Mobile Optimization', () => {
    it('auto-focuses email field on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      
      render(<LoginForm />)
      
      const emailInput = screen.getByRole('textbox', { name: /email address/i })
      expect(emailInput).toHaveFocus()
    })

    it('has touch-friendly button sizes', () => {
      render(<LoginForm />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      expect(submitButton).toHaveClass('py-3', 'px-4')
    })
  })

  describe('Error Handling', () => {
    it('displays authentication errors', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)
      
      const emailInput = screen.getByRole('textbox', { name: /email address/i })
      const passwordInput = screen.getByPlaceholderText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      
      // Mock error response
      const mockError = { message: 'Invalid credentials' }
      jest.spyOn(require('@/lib/supabase').supabase.auth, 'signInWithPassword')
        .mockRejectedValue(mockError)
      
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })
    })

    it('clears errors when switching modes', () => {
      render(<LoginForm />)
      
      // Switch to signup mode
      const toggleButton = screen.getByRole('button', { name: /sign up/i })
      fireEvent.click(toggleButton)
      
      // Switch back to login
      const signinButton = screen.getByRole('button', { name: /sign in/i })
      fireEvent.click(signinButton)
      
      // Error should be cleared
      expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument()
    })
  })

  describe('Form State Management', () => {
    it('clears form when switching modes', () => {
      render(<LoginForm />)
      
      const emailInput = screen.getByRole('textbox', { name: /email address/i })
      const passwordInput = screen.getByPlaceholderText(/password/i)
      
      // Fill form
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      
      // Switch modes
      const toggleButton = screen.getByRole('button', { name: /sign up/i })
      fireEvent.click(toggleButton)
      
      // Form should be cleared
      expect(emailInput).toHaveValue('')
      expect(passwordInput).toHaveValue('')
    })

    it('maintains form state during validation', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)
      
      const emailInput = screen.getByRole('textbox', { name: /email address/i })
      const passwordInput = screen.getByPlaceholderText(/password/i)
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      
      // Trigger validation
      fireEvent.blur(emailInput)
      
      // Form values should remain
      expect(emailInput).toHaveValue('test@example.com')
      expect(passwordInput).toHaveValue('password123')
    })
  })
})
