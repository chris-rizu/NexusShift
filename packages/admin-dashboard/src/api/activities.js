/**
 * Activities API - Mock implementation
 */

import { delay, generateId, now, apiResponse, storage } from './index'

// Mock activity data
const mockActivities = [
  { id: '1', worker: 'Sarah Chen', type: 'Screen change', timestamp: '2025-01-15T14:30:00.000Z', details: 'Switched from VS Code to Chrome', duration: null, department: 'Engineering' },
  { id: '2', worker: 'Michael Park', type: 'Idle detected', timestamp: '2025-01-15T14:25:00.000Z', details: 'No activity for 10 minutes', duration: '10 min', department: 'Design' },
  { id: '3', worker: 'Emma Wilson', type: 'App blocked', timestamp: '2025-01-15T14:20:00.000Z', details: 'Attempted to access restricted app', duration: null, department: 'Marketing' },
  { id: '4', worker: 'James Rodriguez', type: 'Screen change', timestamp: '2025-01-15T14:15:00.000Z', details: 'Switched from Slack to Teams', duration: null, department: 'Engineering' },
  { id: '5', worker: 'Lisa Anderson', type: 'Activity resumed', timestamp: '2025-01-15T14:10:00.000Z', details: 'Returned from break', duration: null, department: 'Sales' },
]

// Initialize activities in storage
const getActivitiesFromStorage = () => {
  const stored = storage.get('activities')
  if (!stored || stored.length === 0) {
    storage.set('activities', mockActivities)
    return mockActivities
  }
  return stored
}

/**
 * Get all activities
 */
export async function getActivities(filters = {}) {
  await delay(800)
  try {
    let activities = getActivitiesFromStorage()
    if (filters.worker) {
      activities = activities.filter(a => a.worker === filters.worker)
    }
    if (filters.type) {
      activities = activities.filter(a => a.type === filters.type)
    }
    if (filters.department) {
      activities = activities.filter(a => a.department === filters.department)
    }
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate)
      const end = new Date(filters.endDate)
      activities = activities.filter(a => {
        const date = new Date(a.timestamp)
        return date >= start && date <= end
      })
    }
    return apiResponse(activities)
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Get activities paginated
 */
export async function getActivitiesPaginated(page = 1, limit = 20, filters = {}) {
  await delay(800)
  try {
    const result = await getActivities(filters)
    const activities = result.data
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginated = activities.slice(startIndex, endIndex)
    return apiResponse({
      activities: paginated,
      total: activities.length,
      page,
      limit,
      totalPages: Math.ceil(activities.length / limit)
    })
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Create activity log
 */
export async function createActivity(activityData) {
  await delay(600)
  try {
    const activities = getActivitiesFromStorage()
    const newActivity = {
      id: generateId(),
      ...activityData,
      timestamp: activityData.timestamp || now()
    }
    activities.unshift(newActivity)
    storage.set('activities', activities)
    return apiResponse(newActivity)
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Get activity statistics
 */
export async function getActivityStats(filters = {}) {
  await delay(500)
  try {
    const result = await getActivities(filters)
    const activities = result.data
    const stats = {
      total: activities.length,
      byType: {},
      byDepartment: {},
      today: activities.filter(a => {
        const today = new Date().toDateString()
        return new Date(a.timestamp).toDateString() === today
      }).length
    }
    activities.forEach(activity => {
      stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1
      stats.byDepartment[activity.department] = (stats.byDepartment[activity.department] || 0) + 1
    })
    return apiResponse(stats)
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Update tracking settings
 */
export async function updateTrackingSettings(settings) {
  await delay(700)
  try {
    const current = storage.get('trackingSettings') || {
      activitiesToTrack: ['screen_change', 'idle', 'app_blocked'],
      samplingRate: 60,
      alertThresholds: { idle: 10, screenChanges: 20 }
    }
    const updated = { ...current, ...settings }
    storage.set('trackingSettings', updated)
    return apiResponse(updated)
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Get tracking settings
 */
export async function getTrackingSettings() {
  await delay(500)
  try {
    const settings = storage.get('trackingSettings') || {
      activitiesToTrack: ['screen_change', 'idle', 'app_blocked'],
      samplingRate: 60,
      alertThresholds: { idle: 10, screenChanges: 20 }
    }
    return apiResponse(settings)
  } catch (error) {
    return apiResponse(null, error.message)
  }
}
