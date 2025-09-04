/**
 * Safe storage utilities that work in Safari private mode
 * Provides fallbacks when localStorage/sessionStorage are blocked
 */

interface SafeStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  clear(): void
}

class SafeLocalStorage implements SafeStorage {
  private fallback: Map<string, string> = new Map()

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key)
    } catch {
      // Fallback to in-memory storage for private mode
      return this.fallback.get(key) || null
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value)
    } catch {
      // Fallback to in-memory storage for private mode
      this.fallback.set(key, value)
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch {
      // Fallback to in-memory storage for private mode
      this.fallback.delete(key)
    }
  }

  clear(): void {
    try {
      localStorage.clear()
    } catch {
      // Fallback to in-memory storage for private mode
      this.fallback.clear()
    }
  }
}

class SafeSessionStorage implements SafeStorage {
  private fallback: Map<string, string> = new Map()

  getItem(key: string): string | null {
    try {
      return sessionStorage.getItem(key)
    } catch {
      // Fallback to in-memory storage for private mode
      return this.fallback.get(key) || null
    }
  }

  setItem(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value)
    } catch {
      // Fallback to in-memory storage for private mode
      this.fallback.set(key, value)
    }
  }

  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key)
    } catch {
      // Fallback to in-memory storage for private mode
      this.fallback.delete(key)
    }
  }

  clear(): void {
    try {
      sessionStorage.clear()
    } catch {
      // Fallback to in-memory storage for private mode
      this.fallback.clear()
    }
  }
}

// Export safe storage instances
export const safeLocalStorage = new SafeLocalStorage()
export const safeSessionStorage = new SafeSessionStorage()

// Utility function to check if we're in private mode
export function isPrivateMode(): boolean {
  try {
    localStorage.setItem('test', 'test')
    localStorage.removeItem('test')
    return false
  } catch {
    return true
  }
}

// Utility function to get a safe storage instance
export function getSafeStorage(type: 'local' | 'session' = 'local'): SafeStorage {
  return type === 'local' ? safeLocalStorage : safeSessionStorage
}