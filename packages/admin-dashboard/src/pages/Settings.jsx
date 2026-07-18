import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Settings as SettingsIcon, Camera, AlertTriangle, Database, Bell, Shield } from 'lucide-react'
import { updateSettings, getSettings } from '../api'
import { useT } from '../lib/i18n'

function Settings() {
  const t = useT()
  const [settings, setSettings] = useState({
    // General Settings
    companyName: 'Acme Corporation',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour',

    // Monitoring Settings
    screenshotInterval: 5,
    screenshotQuality: 75,
    idleThreshold: 10,
    activeThreshold: 5,

    // Alert Settings
    enablePreShiftAlerts: true,
    preShiftBufferMinutes: 15,
    enableIdleAlerts: true,
    excessiveIdleThreshold: 20,
    enableAppBlocking: false,

    // Data Retention
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
  })

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await getSettings()
      if (response.success && response.data) {
        setSettings(response.data)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const handleSave = async () => {
    try {
      toast.loading('Saving settings...', { id: 'settings' })
      const response = await updateSettings(settings)
      if (response.success) {
        toast.success('Settings saved successfully!', { id: 'settings' })
      } else {
        toast.error('Failed to save settings', { id: 'settings' })
      }
    } catch (error) {
      toast.error('Failed to save settings', { id: 'settings' })
      console.error('Save error:', error)
    }
  }

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      try {
        toast.loading('Resetting settings...', { id: 'reset' })
        // Reset to defaults
        const defaults = {
          companyName: 'Acme Corporation',
          timezone: 'America/New_York',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12-hour',
          screenshotInterval: 5,
          screenshotQuality: 75,
          idleThreshold: 10,
          activeThreshold: 5,
          enablePreShiftAlerts: true,
          preShiftBufferMinutes: 15,
          enableIdleAlerts: true,
          excessiveIdleThreshold: 20,
          enableAppBlocking: false,
          screenshotRetentionDays: 30,
          activityLogsRetentionDays: 90,
          automaticCleanup: true,
          emailAlerts: true,
          alertEmail: 'admin@nexusshift.com',
          realTimeNotifications: true,
          weeklyReports: true,
          twoFactorAuth: false,
          sessionTimeout: 30,
          auditLogging: true,
        }
        setSettings(defaults)
        const response = await updateSettings(defaults)
        if (response.success) {
          toast.success('Settings reset to defaults!', { id: 'reset' })
        } else {
          toast.error('Failed to reset settings', { id: 'reset' })
        }
      } catch (error) {
        toast.error('Failed to reset settings', { id: 'reset' })
        console.error('Reset error:', error)
      }
    }
  }

  return (
    <div className="p-6 space-y-6 bg-neutral-50 dark:bg-neutral-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">{t('pg.settings.title')}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('pg.settings.sub')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
          >
            {t('set.reset')}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 text-sm text-white bg-neutral-900 dark:bg-neutral-700 hover:bg-neutral-700 dark:hover:bg-neutral-600 transition"
          >
            {t('set.save')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-5">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" /> {t('set.general')}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">Company Name</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full bg-white border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full bg-white border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">Date Format</label>
              <select
                value={settings.dateFormat}
                onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                className="w-full bg-white border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">Time Format</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
                  <input
                    type="radio"
                    checked={settings.timeFormat === '12-hour'}
                    onChange={() => setSettings({ ...settings, timeFormat: '12-hour' })}
                  />
                  <span>12-hour</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
                  <input
                    type="radio"
                    checked={settings.timeFormat === '24-hour'}
                    onChange={() => setSettings({ ...settings, timeFormat: '24-hour' })}
                  />
                  <span>24-hour</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Monitoring Settings */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-5">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5" /> {t('set.monitoring')}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">
                Screenshot Interval: <span className="text-neutral-900">{settings.screenshotInterval} minutes</span>
              </label>
              <input
                type="range"
                min="1"
                max="30"
                value={settings.screenshotInterval}
                onChange={(e) => setSettings({ ...settings, screenshotInterval: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>1 min</span>
                <span>30 min</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">
                Screenshot Quality: <span className="text-neutral-900">{settings.screenshotQuality}%</span>
              </label>
              <input
                type="range"
                min="50"
                max="100"
                value={settings.screenshotQuality}
                onChange={(e) => setSettings({ ...settings, screenshotQuality: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">
                Idle Threshold: <span className="text-neutral-600">{settings.idleThreshold} minutes</span>
              </label>
              <input
                type="range"
                min="1"
                max="30"
                value={settings.idleThreshold}
                onChange={(e) => setSettings({ ...settings, idleThreshold: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>1 min</span>
                <span>30 min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Settings */}
        <div className="bg-white border border-neutral-200 p-5">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> {t('set.alerts')}
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-900">Enable Pre-shift Alerts</p>
                <p className="text-xs text-neutral-500">Alert when activity detected before shift start</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, enablePreShiftAlerts: !settings.enablePreShiftAlerts })}
                className={`w-12 h-6 transition ${
                  settings.enablePreShiftAlerts ? 'bg-neutral-900' : 'bg-white border border-neutral-300'
                }`}
              >
                <span
                  className={`block w-5 h-5 bg-white transition-transform ${
                    settings.enablePreShiftAlerts ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">Pre-shift Buffer (minutes)</label>
              <input
                type="number"
                min="0"
                max="60"
                value={settings.preShiftBufferMinutes}
                onChange={(e) => setSettings({ ...settings, preShiftBufferMinutes: parseInt(e.target.value) })}
                className="w-full bg-white border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-900">Enable Idle Alerts</p>
                <p className="text-xs text-neutral-500">Alert when worker exceeds idle threshold</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, enableIdleAlerts: !settings.enableIdleAlerts })}
                className={`w-12 h-6 transition ${
                  settings.enableIdleAlerts ? 'bg-neutral-900' : 'bg-white border border-neutral-300'
                }`}
              >
                <span
                  className={`block w-5 h-5 bg-white transition-transform ${
                    settings.enableIdleAlerts ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">Excessive Idle Threshold (minutes)</label>
              <input
                type="number"
                min="5"
                max="60"
                value={settings.excessiveIdleThreshold}
                onChange={(e) => setSettings({ ...settings, excessiveIdleThreshold: parseInt(e.target.value) })}
                className="w-full bg-white border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-900">Enable App Blocking</p>
                <p className="text-xs text-neutral-500">Block restricted applications during work hours</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, enableAppBlocking: !settings.enableAppBlocking })}
                className={`w-12 h-6 transition ${
                  settings.enableAppBlocking ? 'bg-neutral-900' : 'bg-white border border-neutral-300'
                }`}
              >
                <span
                  className={`block w-5 h-5 bg-white transition-transform ${
                    settings.enableAppBlocking ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-white border border-neutral-200 p-5">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" /> {t('set.retention')}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">Screenshot Retention (days)</label>
              <select
                value={settings.screenshotRetentionDays}
                onChange={(e) => setSettings({ ...settings, screenshotRetentionDays: parseInt(e.target.value) })}
                className="w-full bg-white border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
              >
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">Activity Logs Retention (days)</label>
              <select
                value={settings.activityLogsRetentionDays}
                onChange={(e) => setSettings({ ...settings, activityLogsRetentionDays: parseInt(e.target.value) })}
                className="w-full bg-white border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
              >
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
                <option value="365">1 year</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-900">Automatic Cleanup</p>
                <p className="text-xs text-neutral-500">Automatically delete old data</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, automaticCleanup: !settings.automaticCleanup })}
                className={`w-12 h-6 transition ${
                  settings.automaticCleanup ? 'bg-neutral-900' : 'bg-white border border-neutral-300'
                }`}
              >
                <span
                  className={`block w-5 h-5 bg-white transition-transform ${
                    settings.automaticCleanup ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-neutral-200 p-5">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" /> {t('set.notifications')}
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-900">Email Alerts</p>
                <p className="text-xs text-neutral-500">Receive alerts via email</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, emailAlerts: !settings.emailAlerts })}
                className={`w-12 h-6 transition ${
                  settings.emailAlerts ? 'bg-neutral-900' : 'bg-white border border-neutral-300'
                }`}
              >
                <span
                  className={`block w-5 h-5 bg-white transition-transform ${
                    settings.emailAlerts ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">Alert Email</label>
              <input
                type="email"
                value={settings.alertEmail}
                onChange={(e) => setSettings({ ...settings, alertEmail: e.target.value })}
                className="w-full bg-white border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-900">Real-time Notifications</p>
                <p className="text-xs text-neutral-500">Show live notifications in dashboard</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, realTimeNotifications: !settings.realTimeNotifications })}
                className={`w-12 h-6 transition ${
                  settings.realTimeNotifications ? 'bg-neutral-900' : 'bg-white border border-neutral-300'
                }`}
              >
                <span
                  className={`block w-5 h-5 bg-white transition-transform ${
                    settings.realTimeNotifications ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-900">Weekly Reports</p>
                <p className="text-xs text-neutral-500">Auto-generate weekly summary reports</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, weeklyReports: !settings.weeklyReports })}
                className={`w-12 h-6 transition ${
                  settings.weeklyReports ? 'bg-neutral-900' : 'bg-white border border-neutral-300'
                }`}
              >
                <span
                  className={`block w-5 h-5 bg-white transition-transform ${
                    settings.weeklyReports ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white border border-neutral-200 p-5">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" /> {t('set.security')}
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-900">Two-Factor Authentication</p>
                <p className="text-xs text-neutral-500">Add extra security to your account</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, twoFactorAuth: !settings.twoFactorAuth })}
                className={`w-12 h-6 transition ${
                  settings.twoFactorAuth ? 'bg-neutral-900' : 'bg-white border border-neutral-300'
                }`}
              >
                <span
                  className={`block w-5 h-5 bg-white transition-transform ${
                    settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                min="5"
                max="120"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                className="w-full bg-white border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-900">Audit Logging</p>
                <p className="text-xs text-neutral-500">Log all admin actions for compliance</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, auditLogging: !settings.auditLogging })}
                className={`w-12 h-6 transition ${
                  settings.auditLogging ? 'bg-neutral-900' : 'bg-white border border-neutral-300'
                }`}
              >
                <span
                  className={`block w-5 h-5 bg-white transition-transform ${
                    settings.auditLogging ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset to Defaults */}
      <div className="bg-white border border-neutral-200 p-5">
        <h3 className="text-sm font-medium text-neutral-900 mb-4">Reset to Defaults</h3>
        <button
          onClick={() => {
            // Reset settings logic
            alert('Settings reset to default values')
          }}
          className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:bg-neutral-100 transition"
        >
          Reset All Settings to Default
        </button>
      </div>
    </div>
  )
}

export default Settings
