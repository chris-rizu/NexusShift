/**
 * Settings API — local (browser) preferences.
 *
 * These are dashboard-side preferences persisted in localStorage. The shape is
 * FLAT to match what Settings.jsx reads (settings.companyName, etc.).
 *
 * NOTE: these do not yet control the agents. Each agent reads its own capture
 * interval / idle threshold from its local store; pushing settings to agents
 * would require a settings table the agents poll. Tracked as a future step.
 */
import { apiResponse, storage } from './index'

const defaultSettings = {
  // General
  companyName: 'Nexus Shift',
  timezone: 'America/New_York',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12-hour',
  // Monitoring
  screenshotInterval: 5,
  screenshotQuality: 75,
  idleThreshold: 10,
  activeThreshold: 5,
  // Alerts
  enablePreShiftAlerts: true,
  preShiftBufferMinutes: 15,
  enableIdleAlerts: true,
  excessiveIdleThreshold: 20,
  enableAppBlocking: false,
  // Data retention
  screenshotRetentionDays: 30,
  activityLogsRetentionDays: 90,
  automaticCleanup: true,
  // Notifications
  emailAlerts: true,
  alertEmail: 'admin@nexusshift.com',
  realTimeNotifications: true,
  weeklyReports: true,
  // Security
  twoFactorAuth: false,
  sessionTimeout: 30,
  auditLogging: true,
}

const load = () => {
  const stored = storage.get('settings')
  if (!stored || typeof stored !== 'object' || Array.isArray(stored) || Object.keys(stored).length === 0) {
    return { ...defaultSettings }
  }
  // Merge over defaults so new keys always have a value.
  return { ...defaultSettings, ...stored }
}

export async function getSettings() {
  try {
    return apiResponse(load())
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

export async function updateSettings(updates) {
  try {
    const merged = { ...load(), ...updates }
    storage.set('settings', merged)
    return apiResponse(merged)
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

export async function resetSettings() {
  try {
    storage.set('settings', defaultSettings)
    return apiResponse({ ...defaultSettings })
  } catch (error) {
    return apiResponse(null, error.message)
  }
}
