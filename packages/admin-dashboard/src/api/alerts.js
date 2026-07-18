/**
 * Alerts API - Mock implementation
 */

import { delay, generateId, now, apiResponse, storage } from './index'

// Mock alert data
const mockAlerts = [
  { id: '1', worker: 'James Rodriguez', type: 'Pre-shift activity', time: '8:47 AM', date: '2025-01-15', message: 'Screen change detected before shift', status: 'active', severity: 'medium', resolvedAt: null },
  { id: '2', worker: 'Michael Park', type: 'Excessive idle', time: '9:15 AM', date: '2025-01-15', message: 'Idle for 25 minutes', status: 'active', severity: 'high', resolvedAt: null },
  { id: '3', worker: 'Sarah Chen', type: 'App blocked', time: '9:30 AM', date: '2025-01-15', message: 'Accessed restricted application', status: 'active', severity: 'high', resolvedAt: null },
]

// Initialize alerts in storage
const getAlertsFromStorage = () => {
  const stored = storage.get('alerts')
  if (!stored || stored.length === 0) {
    storage.set('alerts', mockAlerts)
    return mockAlerts
  }
  return stored
}

/**
 * Get all alerts
 */
export async function getAlerts() {
  // No alerts backend yet — return empty so the dashboard shows no placeholder alerts.
  return apiResponse([])
}

/**
 * Get alerts by status
 */
export async function getAlertsByStatus(status) {
  await delay(600)
  try {
    const alerts = getAlertsFromStorage()
    const filtered = alerts.filter(alert => alert.status === status)
    return apiResponse(filtered)
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Create new alert
 */
export async function createAlert(alertData) {
  await delay(700)
  try {
    const alerts = getAlertsFromStorage()
    const newAlert = {
      id: generateId(),
      ...alertData,
      status: 'active',
      createdAt: now(),
      resolvedAt: null
    }
    alerts.unshift(newAlert)
    storage.set('alerts', alerts)
    return apiResponse(newAlert)
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Mark alert as resolved
 */
export async function resolveAlert(id, notes = '') {
  await delay(600)
  try {
    const alerts = getAlertsFromStorage()
    const index = alerts.findIndex(alert => alert.id === id)
    if (index === -1) {
      return apiResponse(null, 'Alert not found')
    }
    alerts[index] = {
      ...alerts[index],
      status: 'resolved',
      resolvedAt: now(),
      resolutionNotes: notes
    }
    storage.set('alerts', alerts)
    return apiResponse(alerts[index])
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Bulk resolve alerts
 */
export async function bulkResolveAlerts(alertIds, notes = '') {
  await delay(800)
  try {
    const alerts = getAlertsFromStorage()
    const updatedAlerts = alerts.map(alert => {
      if (alertIds.includes(alert.id)) {
        return {
          ...alert,
          status: 'resolved',
          resolvedAt: now(),
          resolutionNotes: notes
        }
      }
      return alert
    })
    storage.set('alerts', updatedAlerts)
    return apiResponse(updatedAlerts.filter(a => alertIds.includes(a.id)))
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Delete alert
 */
export async function deleteAlert(id) {
  await delay(500)
  try {
    const alerts = getAlertsFromStorage()
    const index = alerts.findIndex(alert => alert.id === id)
    if (index === -1) {
      return apiResponse(null, 'Alert not found')
    }
    alerts.splice(index, 1)
    storage.set('alerts', alerts)
    return apiResponse({ message: 'Alert deleted successfully' })
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Get alert statistics
 */
export async function getAlertStats() {
  await delay(400)
  try {
    const alerts = getAlertsFromStorage()
    const stats = {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'active').length,
      resolved: alerts.filter(a => a.status === 'resolved').length,
      bySeverity: {
        high: alerts.filter(a => a.severity === 'high' && a.status === 'active').length,
        medium: alerts.filter(a => a.severity === 'medium' && a.status === 'active').length,
        low: alerts.filter(a => a.severity === 'low' && a.status === 'active').length
      }
    }
    return apiResponse(stats)
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

/**
 * Contact worker about alert
 */
export async function contactWorker(alertId, message) {
  await delay(1000)
  try {
    const alerts = getAlertsFromStorage()
    const alert = alerts.find(a => a.id === alertId)
    if (!alert) {
      return apiResponse(null, 'Alert not found')
    }
    return apiResponse({
      message: 'Contact message sent successfully',
      worker: alert.worker,
      alertId,
      timestamp: now()
    })
  } catch (error) {
    return apiResponse(null, error.message)
  }
}
