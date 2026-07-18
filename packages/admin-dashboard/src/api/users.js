/**
 * Users API - Mock implementation
 */

import { delay, generateId, now, apiResponse, storage } from './index'

// Mock user data
const mockUsers = [
  { id: '1', name: 'Admin User', email: 'admin@company.com', role: 'admin', department: 'IT', status: 'active', createdAt: '2025-01-01T00:00:00.000Z', lastLogin: '2025-01-15T09:00:00.000Z' },
  { id: '2', name: 'Sarah Chen', email: 'sarah.chen@company.com', role: 'manager', department: 'Engineering', status: 'active', createdAt: '2025-01-02T00:00:00.000Z', lastLogin: '2025-01-15T08:30:00.000Z' },
  { id: '3', name: 'Michael Park', email: 'michael.park@company.com', role: 'user', department: 'Design', status: 'active', createdAt: '2025-01-03T00:00:00.000Z', lastLogin: '2025-01-15T09:15:00.000Z' },
  { id: '4', name: 'Emma Wilson', email: 'emma.wilson@company.com', role: 'user', department: 'Marketing', status: 'active', createdAt: '2025-01-04T00:00:00.000Z', lastLogin: '2025-01-15T08:45:00.000Z' },
]

// Initialize users in storage
const getUsersFromStorage = () => {
  const stored = storage.get('users')
  if (!stored || stored.length === 0) {
    storage.set('users', mockUsers)
    return mockUsers
  }
  return stored
}

/**
 * Get all users
 */
export async function getUsers() {
  await delay(800)
  try {
    const users = getUsersFromStorage()
    return apiResponse(users)
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id) {
  await delay(600)
  try {
    const users = getUsersFromStorage()
    const user = users.find(u => u.id === id)
    if (!user) {
      return apiResponse(null, 'User not found')
    }
    return apiResponse(user)
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Create new user
 */
export async function createUser(userData) {
  await delay(700)
  try {
    const users = getUsersFromStorage()
    // Check if email already exists
    if (users.find(u => u.email === userData.email)) {
      return apiResponse(null, 'User with this email already exists')
    }
    const newUser = {
      id: generateId(),
      ...userData,
      status: 'active',
      createdAt: now(),
      lastLogin: null
    }
    users.push(newUser)
    storage.set('users', users)
    return apiResponse(newUser)
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Update user
 */
export async function updateUser(id, updates) {
  await delay(600)
  try {
    const users = getUsersFromStorage()
    const index = users.findIndex(u => u.id === id)
    if (index === -1) {
      return apiResponse(null, 'User not found')
    }
    // If updating email, check if it's already taken
    if (updates.email && updates.email !== users[index].email) {
      const emailExists = users.find(u => u.email === updates.email && u.id !== id)
      if (emailExists) {
        return apiResponse(null, 'Email already in use')
      }
    }
    users[index] = { ...users[index], ...updates, updatedAt: now() }
    storage.set('users', users)
    return apiResponse(users[index])
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Delete user
 */
export async function deleteUser(id) {
  await delay(500)
  try {
    const users = getUsersFromStorage()
    const index = users.findIndex(u => u.id === id)
    if (index === -1) {
      return apiResponse(null, 'User not found')
    }
    users.splice(index, 1)
    storage.set('users', users)
    return apiResponse({ message: 'User deleted successfully' })
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Reset user password
 */
export async function resetUserPassword(id) {
  await delay(800)
  try {
    const users = getUsersFromStorage()
    const user = users.find(u => u.id === id)
    if (!user) {
      return apiResponse(null, 'User not found')
    }
    // Simulate password reset with new temporary password
    const tempPassword = Math.random().toString(36).slice(-8)
    return apiResponse({
      message: 'Password reset successfully',
      tempPassword,
      userId: id
    })
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Import users from CSV
 */
export async function importUsers(usersData) {
  await delay(1000)
  try {
    const users = getUsersFromStorage()
    const imported = []
    const failed = []

    for (const userData of usersData) {
      // Check if email already exists
      if (users.find(u => u.email === userData.email)) {
        failed.push({ row: userData, error: 'Email already exists' })
        continue
      }
      const newUser = {
        id: generateId(),
        ...userData,
        status: 'active',
        createdAt: now(),
        lastLogin: null
      }
      users.push(newUser)
      imported.push(newUser)
    }

    storage.set('users', users)
    return apiResponse({
      imported,
      failed,
      total: imported.length + failed.length
    })
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Update user status
 */
export async function updateUserStatus(id, status) {
  return updateUser(id, { status })
}
