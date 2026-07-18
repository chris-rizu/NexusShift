/**
 * Departments API - Mock implementation
 */

import { delay, generateId, now, apiResponse, storage } from './index'

// Mock department data
const mockDepartments = [
  { id: '1', name: 'Engineering', manager: 'Sarah Chen', workersCount: 8, status: 'active', budget: '$150,000', description: 'Software development team' },
  { id: '2', name: 'Design', manager: 'Michael Park', workersCount: 4, status: 'active', budget: '$80,000', description: 'UI/UX design team' },
  { id: '3', name: 'Marketing', manager: 'Emma Wilson', workersCount: 5, status: 'active', budget: '$100,000', description: 'Marketing and communications' },
  { id: '4', name: 'Sales', manager: 'Lisa Anderson', workersCount: 6, status: 'active', budget: '$120,000', description: 'Sales and business development' },
  { id: '5', name: 'Support', manager: 'David Kim', workersCount: 3, status: 'active', budget: '$60,000', description: 'Customer support team' },
]

// Initialize departments in storage
const getDepartmentsFromStorage = () => {
  const stored = storage.get('departments')
  if (!stored || stored.length === 0) {
    storage.set('departments', mockDepartments)
    return mockDepartments
  }
  return stored
}

/**
 * Get all departments
 */
export async function getDepartments() {
  await delay(800)
  try {
    const departments = getDepartmentsFromStorage()
    return apiResponse(departments)
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Get department by ID
 */
export async function getDepartmentById(id) {
  await delay(600)
  try {
    const departments = getDepartmentsFromStorage()
    const department = departments.find(d => d.id === id)
    if (!department) {
      return apiResponse(null, 'Department not found')
    }
    return apiResponse(department)
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Create new department
 */
export async function createDepartment(departmentData) {
  await delay(700)
  try {
    const departments = getDepartmentsFromStorage()
    const newDepartment = {
      id: generateId(),
      ...departmentData,
      workersCount: 0,
      status: 'active',
      createdAt: now()
    }
    departments.push(newDepartment)
    storage.set('departments', departments)
    return apiResponse(newDepartment)
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Update department
 */
export async function updateDepartment(id, updates) {
  await delay(600)
  try {
    const departments = getDepartmentsFromStorage()
    const index = departments.findIndex(d => d.id === id)
    if (index === -1) {
      return apiResponse(null, 'Department not found')
    }
    departments[index] = { ...departments[index], ...updates, updatedAt: now() }
    storage.set('departments', departments)
    return apiResponse(departments[index])
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Delete department
 */
export async function deleteDepartment(id) {
  await delay(500)
  try {
    const departments = getDepartmentsFromStorage()
    const index = departments.findIndex(d => d.id === id)
    if (index === -1) {
      return apiResponse(null, 'Department not found')
    }
    departments.splice(index, 1)
    storage.set('departments', departments)
    return apiResponse({ message: 'Department deleted successfully' })
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Update department workers count
 */
export async function updateDepartmentWorkersCount(id, count) {
  return updateDepartment(id, { workersCount: count })
}
