import { useState, useEffect } from 'react'
import { useT } from '../lib/i18n'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Eye, Settings, MoreVertical, Download, MessageSquare } from 'lucide-react'
import Modal from '../components/Modal'
import { exportToCSV, generateFilename, exportFormatters } from '../utils/export'
import { getWorkers, bulkUpdateWorkers, messageWorkers } from '../api'

function Workers() {
  const t = useT()
  const navigate = useNavigate()
  const [workers, setWorkers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [selectedWorkers, setSelectedWorkers] = useState([])

  // Modal states
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showBulkActionModal, setShowBulkActionModal] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [bulkActionType, setBulkActionType] = useState('')

  // Load workers on mount
  useEffect(() => {
    loadWorkers()
  }, [])

  const loadWorkers = async () => {
    try {
      const response = await getWorkers()
      if (response.success && response.data) {
        setWorkers(response.data)
      }
    } catch (error) {
      console.error('Failed to load workers:', error)
    }
  }

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch =
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.deviceId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || worker.status === statusFilter
    const matchesDepartment =
      departmentFilter === 'all' || worker.department === departmentFilter
    return matchesSearch && matchesStatus && matchesDepartment
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-neutral-900 dark:text-white'
      case 'idle': return 'text-neutral-600 dark:text-neutral-300'
      case 'alert': return 'text-neutral-400 dark:text-neutral-500'
      case 'offline': return 'text-neutral-300 dark:text-neutral-600'
      default: return 'text-neutral-300 dark:text-neutral-600'
    }
  }

  const getStatusBg = (status) => {
    switch (status) {
      case 'online': return 'bg-neutral-100 dark:bg-neutral-800'
      case 'idle': return 'bg-neutral-200 dark:bg-neutral-700'
      case 'alert': return 'bg-neutral-300 dark:bg-neutral-600'
      case 'offline': return 'bg-neutral-50 dark:bg-neutral-900'
      default: return 'bg-neutral-50 dark:bg-neutral-900'
    }
  }

  const toggleWorkerSelection = (workerId) => {
    setSelectedWorkers((prev) =>
      prev.includes(workerId) ? prev.filter((id) => id !== workerId) : [...prev, workerId]
    )
  }

  const handleExport = async () => {
    try {
      toast.loading('Preparing export...', { id: 'export' })
      const formattedWorkers = workers.map(w => ({
        'Name': w.name,
        'Device ID': w.deviceId,
        'Status': w.status,
        'Active Time': w.activeTime,
        'Idle %': w.idlePercent,
        'Department': w.department,
        'Last Screenshot': w.lastScreenshot
      }))
      const result = exportToCSV(formattedWorkers, generateFilename('workers', 'csv'))

      if (result.success) {
        toast.success('Worker data exported successfully!', { id: 'export' })
      } else {
        toast.error('Export failed. Please try again.', { id: 'export' })
      }
    } catch (error) {
      toast.error('Export failed. Please try again.', { id: 'export' })
      console.error('Export error:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast.error('Please enter a message')
      return
    }

    try {
      toast.loading('Sending messages...', { id: 'message' })
      const response = await messageWorkers(selectedWorkers, messageText)

      if (response.success) {
        toast.success(`Messages sent to ${selectedWorkers.length} workers!`, { id: 'message' })
        setShowMessageModal(false)
        setMessageText('')
        setSelectedWorkers([])
      } else {
        toast.error('Failed to send messages. Please try again.', { id: 'message' })
      }
    } catch (error) {
      toast.error('Failed to send messages. Please try again.', { id: 'message' })
      console.error('Message error:', error)
    }
  }

  const handleBulkAction = async () => {
    if (!bulkActionType) {
      toast.error('Please select an action')
      return
    }

    try {
      toast.loading('Applying bulk action...', { id: 'bulk' })

      let updates = {}
      if (bulkActionType === 'online') updates = { status: 'online' }
      else if (bulkActionType === 'offline') updates = { status: 'offline' }
      else if (bulkActionType === 'idle') updates = { status: 'idle' }

      const response = await bulkUpdateWorkers(selectedWorkers, updates)

      if (response.success) {
        toast.success(`Bulk action applied to ${selectedWorkers.length} workers!`, { id: 'bulk' })
        setShowBulkActionModal(false)
        setSelectedWorkers([])
        loadWorkers()
      } else {
        toast.error('Failed to apply bulk action. Please try again.', { id: 'bulk' })
      }
    } catch (error) {
      toast.error('Failed to apply bulk action. Please try again.', { id: 'bulk' })
      console.error('Bulk action error:', error)
    }
  }

  const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'Support']

  return (
    <div className="p-6 space-y-6 bg-neutral-50 dark:bg-neutral-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">{t('pg.workers.title')}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Monitor and manage your workforce</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedWorkers.length > 0 && (
            <>
              <button
                onClick={() => setShowMessageModal(true)}
                className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Message Selected ({selectedWorkers.length})
              </button>
              <button
                onClick={() => setShowBulkActionModal(true)}
                className="px-4 py-2 text-sm text-white bg-neutral-900 dark:bg-neutral-700 hover:bg-neutral-700 dark:hover:bg-neutral-600 transition"
              >
                Apply Bulk Action
              </button>
            </>
          )}
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search workers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 px-4 py-2 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 px-4 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-500"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="idle">Idle</option>
            <option value="alert">Alert</option>
            <option value="offline">Offline</option>
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 px-4 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-500"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Workers Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedWorkers.length === filteredWorkers.length && filteredWorkers.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedWorkers(filteredWorkers.map((w) => w.id))
                    } else {
                      setSelectedWorkers([])
                    }
                  }}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Device ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Active Time Today
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Idle %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Last Screenshot
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {filteredWorkers.map((worker) => (
              <tr key={worker.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedWorkers.includes(worker.id)}
                    onChange={() => toggleWorkerSelection(worker.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-neutral-900 dark:bg-neutral-700 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {worker.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{worker.name}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{worker.department}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-neutral-600 dark:text-neutral-400 font-mono">{worker.deviceId}</td>
                <td className="px-4 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium ${getStatusBg(worker.status)} ${getStatusColor(
                      worker.status
                    )}`}
                  >
                    {worker.status.charAt(0).toUpperCase() + worker.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-neutral-900 dark:text-white">{worker.activeTime}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-neutral-200 dark:bg-neutral-700 h-1.5 max-w-[60px]">
                      <div
                        className={`h-1.5 ${
                          worker.idlePercent > 20 ? 'bg-neutral-600 dark:bg-neutral-500' : worker.idlePercent > 10 ? 'bg-neutral-400 dark:bg-neutral-600' : 'bg-neutral-900 dark:bg-white'
                        }`}
                        style={{ width: `${worker.idlePercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">{worker.idlePercent}%</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-neutral-500 dark:text-neutral-400">{worker.lastScreenshot}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/workers/${worker.id}`)}
                      className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
                      title="Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
                      title="More"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          Showing {filteredWorkers.length} of {workers.length} workers
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition">
            Previous
          </button>
          <button className="px-3 py-1.5 text-sm text-white bg-neutral-900 dark:bg-neutral-700 hover:bg-neutral-700 dark:hover:bg-neutral-600 transition">
            1
          </button>
          <button className="px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition">
            Next
          </button>
        </div>
      </div>

      {/* Message Modal */}
      <Modal
        isOpen={showMessageModal}
        onClose={() => {
          setShowMessageModal(false)
          setMessageText('')
        }}
        title="Send Message to Workers"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              Sending message to {selectedWorkers.length} worker(s)
            </p>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Enter your message..."
              className="w-full border border-neutral-300 dark:border-neutral-600 rounded-lg px-4 py-3 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-500 bg-white dark:bg-neutral-800"
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowMessageModal(false)
                setMessageText('')
              }}
              className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 text-sm text-white bg-neutral-900 dark:bg-neutral-700 hover:bg-neutral-700 dark:hover:bg-neutral-600 transition"
            >
              Send Message
            </button>
          </div>
        </div>
      </Modal>

      {/* Bulk Action Modal */}
      <Modal
        isOpen={showBulkActionModal}
        onClose={() => {
          setShowBulkActionModal(false)
          setBulkActionType('')
        }}
        title="Apply Bulk Action"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Applying action to {selectedWorkers.length} worker(s)
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-neutral-200 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer">
                <input
                  type="radio"
                  name="bulkAction"
                  value="online"
                  onChange={(e) => setBulkActionType(e.target.value)}
                  className="rounded"
                />
                <span className="text-sm text-neutral-900 dark:text-white">Set Status to Online</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-neutral-200 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer">
                <input
                  type="radio"
                  name="bulkAction"
                  value="offline"
                  onChange={(e) => setBulkActionType(e.target.value)}
                  className="rounded"
                />
                <span className="text-sm text-neutral-900 dark:text-white">Set Status to Offline</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-neutral-200 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer">
                <input
                  type="radio"
                  name="bulkAction"
                  value="idle"
                  onChange={(e) => setBulkActionType(e.target.value)}
                  className="rounded"
                />
                <span className="text-sm text-neutral-900 dark:text-white">Set Status to Idle</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowBulkActionModal(false)
                setBulkActionType('')
              }}
              className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkAction}
              className="px-4 py-2 text-sm text-white bg-neutral-900 dark:bg-neutral-700 hover:bg-neutral-700 dark:hover:bg-neutral-600 transition"
            >
              Apply Action
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Workers
