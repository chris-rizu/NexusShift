/**
 * Shifts API - Mock implementation
 */

import { delay, generateId, now, apiResponse, storage } from './index'

// Mock shift templates
const mockShiftTemplates = [
  { id: '1', name: 'Morning Shift', startTime: '09:00', endTime: '17:00', breakDuration: 60, recurringDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { id: '2', name: 'Afternoon Shift', startTime: '12:00', endTime: '20:00', breakDuration: 60, recurringDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { id: '3', name: 'Night Shift', startTime: '20:00', endTime: '08:00', breakDuration: 60, recurringDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
]

// Mock shift assignments
const mockShiftAssignments = [
  { id: '1', workerId: '1', templateId: '1', date: '2025-01-15', status: 'completed' },
  { id: '2', workerId: '2', templateId: '2', date: '2025-01-15', status: 'active' },
  { id: '3', workerId: '3', templateId: '1', date: '2025-01-15', status: 'scheduled' },
]

// Mock shift overrides
const mockShiftOverrides = [
  { id: '1', workerId: '1', date: '2025-01-16', type: 'time_off', reason: 'Personal leave', status: 'approved' },
]

// Initialize in storage
const getShiftTemplatesFromStorage = () => {
  const stored = storage.get('shiftTemplates')
  if (!stored || stored.length === 0) {
    storage.set('shiftTemplates', mockShiftTemplates)
    return mockShiftTemplates
  }
  return stored
}

const getShiftAssignmentsFromStorage = () => {
  const stored = storage.get('shiftAssignments')
  if (!stored || stored.length === 0) {
    storage.set('shiftAssignments', mockShiftAssignments)
    return mockShiftAssignments
  }
  return stored
}

const getShiftOverridesFromStorage = () => {
  const stored = storage.get('shiftOverrides')
  if (!stored || stored.length === 0) {
    storage.set('shiftOverrides', mockShiftOverrides)
    return mockShiftOverrides
  }
  return stored
}

/**
 * Get all shift templates
 */
export async function getShiftTemplates() {
  await delay(600)
  try {
    const templates = getShiftTemplatesFromStorage()
    return apiResponse(templates)
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Create shift template
 */
export async function createShiftTemplate(templateData) {
  await delay(700)
  try {
    const templates = getShiftTemplatesFromStorage()
    const newTemplate = {
      id: generateId(),
      ...templateData,
      createdAt: now()
    }
    templates.push(newTemplate)
    storage.set('shiftTemplates', templates)
    return apiResponse(newTemplate)
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Update shift template
 */
export async function updateShiftTemplate(id, updates) {
  await delay(600)
  try {
    const templates = getShiftTemplatesFromStorage()
    const index = templates.findIndex(t => t.id === id)
    if (index === -1) {
      return apiResponse(null, 'Template not found')
    }
    templates[index] = { ...templates[index], ...updates, updatedAt: now() }
    storage.set('shiftTemplates', templates)
    return apiResponse(templates[index])
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Delete shift template
 */
export async function deleteShiftTemplate(id) {
  await delay(500)
  try {
    const templates = getShiftTemplatesFromStorage()
    const index = templates.findIndex(t => t.id === id)
    if (index === -1) {
      return apiResponse(null, 'Template not found')
    }
    templates.splice(index, 1)
    storage.set('shiftTemplates', templates)
    return apiResponse({ message: 'Template deleted successfully' })
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Get shift assignments
 */
export async function getShiftAssignments(filters = {}) {
  await delay(700)
  try {
    let assignments = getShiftAssignmentsFromStorage()
    if (filters.workerId) {
      assignments = assignments.filter(a => a.workerId === filters.workerId)
    }
    if (filters.date) {
      assignments = assignments.filter(a => a.date === filters.date)
    }
    if (filters.status) {
      assignments = assignments.filter(a => a.status === filters.status)
    }
    return apiResponse(assignments)
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Create shift assignment
 */
export async function createShiftAssignment(assignmentData) {
  await delay(700)
  try {
    const assignments = getShiftAssignmentsFromStorage()
    const newAssignment = {
      id: generateId(),
      ...assignmentData,
      status: 'scheduled',
      createdAt: now()
    }
    assignments.push(newAssignment)
    storage.set('shiftAssignments', assignments)
    return apiResponse(newAssignment)
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Bulk assign shifts
 */
export async function bulkAssignShifts(workerIds, templateId, startDate, endDate) {
  await delay(1000)
  try {
    const assignments = getShiftAssignmentsFromStorage()
    const newAssignments = []
    const template = getShiftTemplatesFromStorage().find(t => t.id === templateId)
    if (!template) {
      return apiResponse(null, 'Template not found')
    }
    // Generate assignments for each worker and day in date range
    // This is a simplified version - real implementation would need proper date iteration
    for (const workerId of workerIds) {
      const newAssignment = {
        id: generateId(),
        workerId,
        templateId,
        date: startDate,
        status: 'scheduled',
        createdAt: now()
      }
      assignments.push(newAssignment)
      newAssignments.push(newAssignment)
    }
    storage.set('shiftAssignments', assignments)
    return apiResponse(newAssignments)
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Get shift overrides
 */
export async function getShiftOverrides() {
  await delay(600)
  try {
    const overrides = getShiftOverridesFromStorage()
    return apiResponse(overrides)
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Create shift override
 */
export async function createShiftOverride(overrideData) {
  await delay(700)
  try {
    const overrides = getShiftOverridesFromStorage()
    const newOverride = {
      id: generateId(),
      ...overrideData,
      status: 'pending',
      createdAt: now()
    }
    overrides.push(newOverride)
    storage.set('shiftOverrides', overrides)
    return apiResponse(newOverride)
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Import schedule from CSV
 */
export async function importSchedule(scheduleData) {
  await delay(1000)
  try {
    const assignments = getShiftAssignmentsFromStorage()
    const imported = []
    const failed = []
    for (const row of scheduleData) {
      try {
        const newAssignment = {
          id: generateId(),
          workerId: row.workerId,
          templateId: row.templateId,
          date: row.date,
          status: 'scheduled',
          createdAt: now()
        }
        assignments.push(newAssignment)
        imported.push(newAssignment)
      } catch (error) {
        failed.push({ row, error: error.message })
      }
    }
    storage.set('shiftAssignments', assignments)
    return apiResponse({ imported, failed })
  } catch (error) {
    return apiResponse(null, error.message)
  }
}
