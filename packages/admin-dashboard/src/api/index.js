/**
 * Mock API - Main exports and utilities
 */

// Re-export all API modules
export * from './alerts'
export * from './workers'
export * from './departments'
export * from './shifts'
export * from './activities'
export * from './users'
export * from './settings'

// Simulated delay to mimic network requests
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Generate unique IDs
export const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Get current timestamp
export const now = () => new Date().toISOString()

// Format date for display
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Simulate API response structure
export const apiResponse = (data, error = null) => ({
  data,
  error,
  success: !error,
  timestamp: now()
})

// LocalStorage helpers
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error)
      return defaultValue
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error)
      return false
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error)
      return false
    }
  }
}

// Initialize mock data in localStorage if not exists
export const initializeMockData = () => {
  const keys = ['workers', 'departments', 'alerts', 'activities', 'shifts', 'users', 'settings']
  keys.forEach(key => {
    if (!localStorage.getItem(key)) {
      storage.set(key, [])
    }
  })
}
