export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

export function showToast(message: string, type: ToastType = 'info', options: ToastOptions = {}) {
  const {
    duration = 5000,
    position = 'top-right'
  } = options

  // Create toast element
  const toast = document.createElement('div')
  toast.className = `toast toast-${type} show`
  toast.textContent = message
  
  // Add position classes
  toast.classList.add(`toast-${position.replace('-', '-')}`)
  
  // Add to document
  document.body.appendChild(toast)
  
  // Remove toast after duration
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast)
      }
    }, 300)
  }, duration)
  
  // Return toast element for manual control if needed
  return toast
}

// Convenience functions for common toast types
export const toast = {
  success: (message: string, options?: ToastOptions) => showToast(message, 'success', options),
  error: (message: string, options?: ToastOptions) => showToast(message, 'error', options),
  warning: (message: string, options?: ToastOptions) => showToast(message, 'warning', options),
  info: (message: string, options?: ToastOptions) => showToast(message, 'info', options)
}

// Auto-remove toasts when clicking on them
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement
  if (target.classList.contains('toast')) {
    target.classList.remove('show')
    setTimeout(() => {
      if (document.body.contains(target)) {
        document.body.removeChild(target)
      }
    }, 300)
  }
})
