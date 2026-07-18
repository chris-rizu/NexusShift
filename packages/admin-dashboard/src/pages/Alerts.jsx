import { useState, useEffect } from 'react'
import { useT } from '../lib/i18n'
import { toast } from 'react-hot-toast'
import { AlertTriangle, Check, Download, Eye, Mail, Search, X } from 'lucide-react'
import Modal from '../components/Modal'
import { exportToCSV, generateFilename, exportFormatters } from '../utils/export'
import { getAlerts, bulkResolveAlerts, resolveAlert, contactWorker } from '../api'

// Mock alerts data
const mockAlerts = [
  {
    id: '1',
    worker: 'James Rodriguez',
    type: 'Pre-shift activity',
    severity: 'high',
    time: '2026-06-03T08:47:00',
    message: 'Screen change detected 15 minutes before shift start',
    screenshot: '',
    resolved: false
  },
  {
    id: '2',
    worker: 'Michael Park',
    type: 'Excessive idle',
    severity: 'medium',
    time: '2026-06-03T09:15:00',
    message: 'No keyboard or mouse activity for 25 minutes',
    screenshot: '',
    resolved: false
  },
  {
    id: '3',
    worker: 'Sarah Chen',
    type: 'App blocked',
    severity: 'high',
    time: '2026-06-03T09:30:00',
    message: 'Attempted to access restricted application: Social Media',
    screenshot: '',
    resolved: true
  },
  {
    id: '4',
    worker: 'Emma Wilson',
    type: 'Late arrival',
    severity: 'low',
    time: '2026-06-03T09:00:00',
    message: 'Clock in 45 minutes after scheduled shift start',
    screenshot: '',
    resolved: true
  },
  {
    id: '5',
    worker: 'David Kim',
    type: 'Network issue',
    severity: 'medium',
    time: '2026-06-03T08:30:00',
    message: 'Lost connection for 15 minutes during active hours',
    screenshot: '',
    resolved: false
  },
]

function Alerts() {
  const t = useT()
  const [alerts, setAlerts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedAlerts, setSelectedAlerts] = useState([])

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [contactMessage, setContactMessage] = useState('')

  // Load alerts on mount
  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    try {
      const response = await getAlerts()
      if (response.success && response.data) {
        setAlerts(response.data)
      }
    } catch (error) {
      console.error('Failed to load alerts:', error)
    }
  }

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = !searchTerm ||
      alert.worker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || alert.type === typeFilter
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter
    return matchesSearch && matchesType && matchesSeverity
  })

  const handleExport = () => {
    try {
      toast.loading('Preparing export...', { id: 'export' })
      const formattedAlerts = alerts.map(alert => ({
        Worker: alert.worker,
        Type: alert.type,
        Severity: alert.severity,
        Time: formatTime(alert.time),
        Date: formatDate(alert.time),
        Message: alert.message,
        Status: alert.resolved ? 'Resolved' : 'Active'
      }))
      const result = exportToCSV(formattedAlerts, generateFilename('alerts', 'csv'))

      if (result.success) {
        toast.success('Alerts exported successfully!', { id: 'export' })
      } else {
        toast.error('Export failed. Please try again.', { id: 'export' })
      }
    } catch (error) {
      toast.error('Export failed. Please try again.', { id: 'export' })
      console.error('Export error:', error)
    }
  }

  const handleMarkResolved = async (alertId) => {
    try {
      const response = await resolveAlert(alertId)
      if (response.success) {
        toast.success('Alert marked as resolved!')
        loadAlerts()
      } else {
        toast.error('Failed to resolve alert')
      }
    } catch (error) {
      toast.error('Failed to resolve alert')
      console.error('Resolve error:', error)
    }
  }

  const handleBulkResolve = async () => {
    if (selectedAlerts.length === 0) return

    try {
      toast.loading('Resolving alerts...', { id: 'resolve' })
      const response = await bulkResolveAlerts(selectedAlerts)
      if (response.success) {
        toast.success(`${selectedAlerts.length} alerts resolved!`, { id: 'resolve' })
        setSelectedAlerts([])
        loadAlerts()
      } else {
        toast.error('Failed to resolve alerts', { id: 'resolve' })
      }
    } catch (error) {
      toast.error('Failed to resolve alerts', { id: 'resolve' })
      console.error('Bulk resolve error:', error)
    }
  }

  const handleViewDetails = (alert) => {
    setSelectedAlert(alert)
    setShowDetailsModal(true)
  }

  const handleContactWorker = (alert) => {
    setSelectedAlert(alert)
    setShowContactModal(true)
  }

  const handleSendMessage = async () => {
    if (!contactMessage.trim()) {
      toast.error('Please enter a message')
      return
    }

    try {
      toast.loading('Sending message...', { id: 'contact' })
      const response = await contactWorker(selectedAlert.id, contactMessage)
      if (response.success) {
        toast.success('Message sent successfully!', { id: 'contact' })
        setShowContactModal(false)
        setContactMessage('')
      } else {
        toast.error('Failed to send message', { id: 'contact' })
      }
    } catch (error) {
      toast.error('Failed to send message', { id: 'contact' })
      console.error('Contact error:', error)
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-neutral-900 dark:text-white'
      case 'medium': return 'text-neutral-600 dark:text-neutral-300'
      case 'low': return 'text-neutral-400 dark:text-neutral-500'
      default: return 'text-neutral-300 dark:text-neutral-600'
    }
  }

  const getSeverityBg = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 dark:bg-red-900'
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900'
      case 'low': return 'bg-neutral-100 dark:bg-neutral-800'
      default: return 'bg-neutral-50 dark:bg-neutral-900'
    }
  }

  const markAsResolved = (alertId) => {
    handleMarkResolved(alertId)
  }

  const formatTime = (timeString) => {
    const date = new Date(timeString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (timeString) => {
    const date = new Date(timeString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="p-6 space-y-6 bg-neutral-50 dark:bg-neutral-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">{t('pg.alerts.title')}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Monitor and respond to workforce alerts and incidents</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedAlerts.length > 0 && (
            <button
              onClick={handleBulkResolve}
              className="px-4 py-2 text-sm text-white bg-neutral-900 dark:bg-neutral-700 hover:bg-neutral-700 dark:hover:bg-neutral-600 transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Mark Selected as Resolved ({selectedAlerts.length})
            </button>
          )}
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Alerts Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search alerts by worker, type, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 px-4 py-2 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 px-4 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-500"
          >
            <option value="all">All Types</option>
            <option value="Pre-shift activity">Pre-shift activity</option>
            <option value="Excessive idle">Excessive idle</option>
            <option value="App blocked">App blocked</option>
            <option value="Late arrival">Late arrival</option>
            <option value="Network issue">Network issue</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 px-4 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-500"
          >
            <option value="all">All Severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 px-4 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid gap-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white dark:bg-neutral-900 border p-5 transition ${
              alert.resolved
                ? 'border-neutral-200 dark:border-neutral-700 opacity-60'
                : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedAlerts.includes(alert.id)}
                onChange={() => {
                  setSelectedAlerts((prev) =>
                    prev.includes(alert.id) ? prev.filter((id) => id !== alert.id) : [...prev, alert.id]
                  )
                }}
                className="mt-1 rounded"
              />

              {/* Alert Icon */}
              <div className={`w-10 h-10 flex items-center justify-center ${getSeverityBg(alert.severity)} rounded-lg`}>
                <AlertTriangle className={`w-5 h-5 ${getSeverityColor(alert.severity)}`} />
              </div>

              {/* Alert Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">{alert.worker}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs font-medium ${getSeverityBg(alert.severity)} ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </span>
                      <span className="text-xs text-neutral-400 dark:text-neutral-500">•</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{alert.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">{formatDate(alert.time)}</span>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">{formatTime(alert.time)}</span>
                  </div>
                </div>

                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">{alert.message}</p>

                {/* Screenshot Preview */}
                {alert.screenshot && (
                  <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 aspect-video mb-3 flex items-center justify-center">
                    <span className="text-neutral-400 dark:text-neutral-500 text-sm">Screenshot attached</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!alert.resolved ? (
                    <>
                      <button
                        onClick={() => markAsResolved(alert.id)}
                        className="px-3 py-1.5 text-xs text-white bg-neutral-900 dark:bg-neutral-700 hover:bg-neutral-700 dark:hover:bg-neutral-600 transition flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Mark as Resolved
                      </button>
                      <button
                        onClick={() => handleViewDetails(alert)}
                        className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View Details
                      </button>
                    </>
                  ) : (
                    <span className="px-3 py-1.5 text-xs text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Resolved
                    </span>
                  )}
                  <button
                    onClick={() => handleContactWorker(alert)}
                    className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3" />
                    Contact Worker
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAlerts.length === 0 && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-12 text-center">
          <Check className="w-16 h-16 mx-auto mb-4 text-neutral-400 dark:text-neutral-600" />
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">No Alerts Found</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">No alerts match your current filters</p>
          <button
            onClick={() => {
              setTypeFilter('all')
              setSeverityFilter('all')
              setDateFilter('all')
              setSearchTerm('')
            }}
            className="px-4 py-2 text-sm text-white bg-neutral-900 dark:bg-neutral-700 hover:bg-neutral-700 dark:hover:bg-neutral-600 transition"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Alert Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedAlert(null)
        }}
        title="Alert Details"
        size="lg"
      >
        {selectedAlert && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Worker</p>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{selectedAlert.worker}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Type</p>
                <p className="text-sm text-neutral-900 dark:text-white">{selectedAlert.type}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Severity</p>
                <span className={`px-2 py-1 text-xs font-medium ${getSeverityBg(selectedAlert.severity)} ${getSeverityColor(selectedAlert.severity)}`}>
                  {selectedAlert.severity.charAt(0).toUpperCase() + selectedAlert.severity.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Time</p>
                <p className="text-sm text-neutral-900 dark:text-white">{formatDate(selectedAlert.time)} at {formatTime(selectedAlert.time)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Message</p>
              <p className="text-sm text-neutral-900 dark:text-white">{selectedAlert.message}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Status</p>
              <span className={`px-2 py-1 text-xs font-medium ${selectedAlert.resolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {selectedAlert.resolved ? 'Resolved' : 'Active'}
              </span>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              {!selectedAlert.resolved && (
                <button
                  onClick={() => {
                    handleMarkResolved(selectedAlert.id)
                    setShowDetailsModal(false)
                  }}
                  className="px-4 py-2 text-sm text-white bg-neutral-900 dark:bg-neutral-700 hover:bg-neutral-700 dark:hover:bg-neutral-600 transition"
                >
                  Mark as Resolved
                </button>
              )}
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Contact Worker Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => {
          setShowContactModal(false)
          setSelectedAlert(null)
          setContactMessage('')
        }}
        title="Contact Worker"
        size="md"
      >
        {selectedAlert && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                Sending message to <span className="font-medium text-neutral-900 dark:text-white">{selectedAlert.worker}</span>
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">Regarding: {selectedAlert.type}</p>
            </div>
            <div>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Enter your message..."
                className="w-full border border-neutral-300 dark:border-neutral-600 rounded-lg px-4 py-3 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-500 bg-white dark:bg-neutral-800"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowContactModal(false)
                  setContactMessage('')
                }}
                className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 text-sm text-white bg-neutral-900 dark:bg-neutral-700 hover:bg-neutral-700 dark:hover:bg-neutral-600 transition flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Send Message
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Alerts
