import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const activityTypes = [
  { value: 'all', label: 'All Activities' },
  { value: 'active', label: 'Active' },
  { value: 'idle_start', label: 'Idle Start' },
  { value: 'idle_end', label: 'Idle End' },
]

const eventDetails = {
  active: 'Activity detected at keyboard/mouse',
  idle_start: 'No keyboard/mouse activity detected',
  idle_end: 'Activity resumed after idle period',
}

function ActivityLogs() {
  const [activityLogs, setActivityLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [dateRange, setDateRange] = useState('today')

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('id, event_type, timestamp, workers(name)')
        .order('timestamp', { ascending: false })
        .limit(100)
      if (error || !data) { setLoading(false); return }
      setActivityLogs(data.map(a => ({
        id: a.id,
        worker: a.workers?.name || 'Unknown',
        type: a.event_type,
        details: eventDetails[a.event_type] || a.event_type,
        timestamp: a.timestamp,
        department: '—',
      })))
      setLoading(false)
    })()
  }, [])

  const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'Support']

  const filteredLogs = activityLogs.filter(log => {
    const matchesType = typeFilter === 'all' || log.type === typeFilter
    const matchesDepartment = departmentFilter === 'all' || log.department === departmentFilter
    return matchesType && matchesDepartment
  })

  const getActivityIcon = (type) => {
    switch (type) {
      case 'screen_change': return '≣'
      case 'idle_start': return '○'
      case 'idle_end': return '●'
      case 'app_open': return '+'
      case 'app_close': return '−'
      case 'copy_paste': return '▤'
      default: return '△'
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'screen_change': return 'text-neutral-900'
      case 'idle_start': return 'text-neutral-400'
      case 'idle_end': return 'text-neutral-900'
      case 'app_open': return 'text-neutral-600'
      case 'app_close': return 'text-neutral-500'
      case 'copy_paste': return 'text-neutral-600'
      default: return 'text-neutral-400'
    }
  }

  return (
    <div className="p-6 space-y-6 bg-neutral-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Activity Logs</h1>
          <p className="text-sm text-neutral-500">Detailed activity tracking for all workers</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:bg-neutral-100 transition">
            Export Logs
          </button>
          <button className="px-4 py-2 text-sm text-white bg-neutral-900 hover:bg-neutral-700 transition">
            Configure Tracking
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-neutral-200 p-4">
        <div className="flex items-center gap-4">
          {/* Activity Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
          >
            {activityTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-white border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>

          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search logs by worker or details..."
              className="w-full bg-white border border-neutral-300 px-4 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900"
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Total Activities</span>
            <span className="text-2xl">⚡</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900">{activityLogs.length}</div>
          <div className="text-xs text-neutral-400 mt-1">Today</div>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Screen Changes</span>
            <span className="text-2xl">≣</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900">2</div>
          <div className="text-xs text-neutral-400 mt-1">25% of total</div>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Idle Periods</span>
            <span className="text-2xl">○</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900">2</div>
          <div className="text-xs text-neutral-400 mt-1">25% of total</div>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">App Activity</span>
            <span className="text-2xl">+</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900">4</div>
          <div className="text-xs text-neutral-400 mt-1">50% of total</div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white border border-neutral-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Activity Timeline</h2>
          <div className="text-sm text-neutral-500">
            Showing {filteredLogs.length} activities
          </div>
        </div>

        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-4 p-4 border border-neutral-200 hover:border-neutral-400 transition"
            >
              {/* Icon */}
              <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <span className={`text-lg ${getActivityColor(log.type)}`}>
                  {getActivityIcon(log.type)}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-neutral-900">{log.worker}</p>
                      <span className="text-xs text-neutral-400">•</span>
                      <p className="text-xs text-neutral-500">{log.department}</p>
                    </div>
                    <p className="text-sm text-neutral-600">{log.details}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-neutral-500">{new Date(log.timestamp).toLocaleString()}</p>
                    <p className="text-xs text-neutral-400 mt-1">{log.type.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-4 text-center">
          <button className="px-6 py-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:bg-neutral-100 transition">
            Load More Activities
          </button>
        </div>
      </div>

      {/* Activity Summary by Type */}
      <div className="bg-white border border-neutral-200 p-5">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Activity Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          {activityTypes.slice(1).map((type) => {
            const count = activityLogs.filter(log => log.type === type.value).length
            const percentage = activityLogs.length > 0 ? Math.round((count / activityLogs.length) * 100) : 0
            return (
              <div key={type.value} className="text-center p-4 bg-neutral-50 border border-neutral-200">
                <span className="text-2xl block mb-2">{getActivityIcon(type.value)}</span>
                <p className="text-sm font-medium text-neutral-900">{type.label}</p>
                <p className="text-2xl font-bold text-neutral-900 my-1">{count}</p>
                <p className="text-xs text-neutral-500">{percentage}% of total</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ActivityLogs
