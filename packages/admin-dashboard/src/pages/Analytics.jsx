import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Download, TrendingUp, Clock, Users, BarChart3 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts'
import { exportToCSV, generateFilename } from '../utils/export'

// No analytics backend yet — arrays are empty so no placeholder data is shown.
const screenChangeDataToday = []
const screenChangeDataWeek = []
const screenChangeDataMonth = []
const activeTimeDataToday = []
const activeTimeDataWeek = []
const activeTimeDataMonth = []
const shiftCompletionData = []
const dailyTrendData = []
const workers = []

function Analytics() {
  const navigate = useNavigate()
  const [selectedWorkers, setSelectedWorkers] = useState([])
  const [timeRange, setTimeRange] = useState('today')

  const toggleWorker = (workerId) => {
    setSelectedWorkers(prev =>
      prev.includes(workerId)
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    )
  }

  const getWorkerColor = (workerId) => {
    return workers.find(w => w.id === workerId)?.color || '#737373'
  }

  const getScreenChangeData = () => {
    switch (timeRange) {
      case 'today': return screenChangeDataToday
      case 'week': return screenChangeDataWeek
      case 'month': return screenChangeDataMonth
      default: return screenChangeDataToday
    }
  }

  const getActiveTimeData = () => {
    switch (timeRange) {
      case 'today': return activeTimeDataToday
      case 'week': return activeTimeDataWeek
      case 'month': return activeTimeDataMonth
      default: return activeTimeDataToday
    }
  }

  const handleExport = () => {
    try {
      toast.loading('Preparing export...', { id: 'export' })
      // Export current analytics data
      const exportData = currentScreenChangeData.map(row => ({
        Time: row.time,
        ...Object.entries(row).filter(([key]) => key !== 'time').reduce((acc, [key, val]) => ({...acc, [key]: val}), {})
      }))
      const result = exportToCSV(exportData, generateFilename('analytics', 'csv'))

      if (result.success) {
        toast.success('Analytics data exported successfully!', { id: 'export' })
      } else {
        toast.error('Export failed. Please try again.', { id: 'export' })
      }
    } catch (error) {
      toast.error('Export failed. Please try again.', { id: 'export' })
      console.error('Export error:', error)
    }
  }

  const currentScreenChangeData = getScreenChangeData()
  const currentActiveTimeData = getActiveTimeData()

  return (
    <div className="p-6 space-y-6 bg-neutral-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Workforce Analytics</h1>
          <p className="text-sm text-neutral-500">Monitor worker productivity and screen activity patterns</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button onClick={handleExport} className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Worker Selection */}
      <div className="bg-white border border-neutral-200 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-neutral-700 mr-2">Show Workers:</span>
          {workers.map(worker => (
            <button
              key={worker.id}
              onClick={() => toggleWorker(worker.id)}
              className={`px-3 py-1.5 text-sm border transition ${
                selectedWorkers.includes(worker.id)
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-100'
              }`}
            >
              {worker.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 dark:text-neutral-400 text-sm">Total Screen Changes</span>
            <BarChart3 className="w-8 h-8 text-neutral-500 dark:text-neutral-400" />
          </div>
          <div className="text-3xl font-bold text-neutral-900">
            {currentScreenChangeData.reduce((sum, d) => sum + Object.values(d).reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0) - Object.values(d)[0], 0)}
          </div>
          <div className="text-xs text-neutral-400 mt-1">Across {selectedWorkers.length} workers</div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 dark:text-neutral-400 text-sm">Active Hours Today</span>
            <Clock className="w-8 h-8 text-neutral-500 dark:text-neutral-400" />
          </div>
          <div className="text-3xl font-bold text-neutral-900">47.5h</div>
          <div className="text-xs text-neutral-400 mt-1">Across 6 workers</div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 dark:text-neutral-400 text-sm">Avg Shift Completion</span>
            <TrendingUp className="w-8 h-8 text-neutral-500 dark:text-neutral-400" />
          </div>
          <div className="text-3xl font-bold text-neutral-900">77%</div>
          <div className="text-xs textneutral-400 mt-1">4 of 6 on track</div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 dark:text-neutral-400 text-sm">Productivity Score</span>
            <TrendingUp className="w-8 h-8 text-neutral-500 dark:text-neutral-400" />
          </div>
          <div className="text-3xl font-bold text-neutral-900">8.2</div>
          <div className="text-xs text-neutral-400 mt-1">Out of 10</div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Screen Changes Over Time */}
        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Screen Changes Over Time</h2>
              <p className="text-xs text-neutral-500">Number of window/application changes per worker</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={currentScreenChangeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis
                dataKey="time"
                stroke="#737373"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#737373"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '4px'
                }}
              />
              <Legend />
              {selectedWorkers.includes('sarah') && (
                <Line
                  type="monotone"
                  dataKey="sarah"
                  stroke="#171717"
                  strokeWidth={2}
                  name="Sarah Chen"
                  dot={{ r: 3 }}
                />
              )}
              {selectedWorkers.includes('michael') && (
                <Line
                  type="monotone"
                  dataKey="michael"
                  stroke="#404040"
                  strokeWidth={2}
                  name="Michael Park"
                  dot={{ r: 3 }}
                />
              )}
              {selectedWorkers.includes('emma') && (
                <Line
                  type="monotone"
                  dataKey="emma"
                  stroke="#525252"
                  strokeWidth={2}
                  name="Emma Wilson"
                  dot={{ r: 3 }}
                />
              )}
              {selectedWorkers.includes('james') && (
                <Line
                  type="monotone"
                  dataKey="james"
                  stroke="#737373"
                  strokeWidth={2}
                  name="James Rodriguez"
                  dot={{ r: 3 }}
                />
              )}
              {selectedWorkers.includes('lisa') && (
                <Line
                  type="monotone"
                  dataKey="lisa"
                  stroke="#a3a3a3"
                  strokeWidth={2}
                  name="Lisa Anderson"
                  dot={{ r: 3 }}
                />
              )}
              {selectedWorkers.includes('david') && (
                <Line
                  type="monotone"
                  dataKey="david"
                  stroke="#d4d4d4"
                  strokeWidth={2}
                  name="David Kim"
                  dot={{ r: 3 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Active Time Tracking */}
        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Active Time Tracking</h2>
              <p className="text-xs text-neutral-500">Percentage of active time over the period</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={currentActiveTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis
                dataKey="time"
                stroke="#737373"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#737373"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '4px'
                }}
              />
              <Legend />
              {selectedWorkers.includes('sarah') && (
                <Area
                  type="monotone"
                  dataKey="sarah"
                  stroke="#171717"
                  fill="#171717"
                  fillOpacity={0.1}
                  name="Sarah Chen"
                />
              )}
              {selectedWorkers.includes('michael') && (
                <Area
                  type="monotone"
                  dataKey="michael"
                  stroke="#404040"
                  fill="#404040"
                  fillOpacity={0.1}
                  name="Michael Park"
                />
              )}
              {selectedWorkers.includes('emma') && (
                <Area
                  type="monotone"
                  dataKey="emma"
                  stroke="#525252"
                  fill="#525252"
                  fillOpacity={0.1}
                  name="Emma Wilson"
                />
              )}
              {selectedWorkers.includes('james') && (
                <Area
                  type="monotone"
                  dataKey="james"
                  stroke="#737373"
                  fill="#737373"
                  fillOpacity={0.1}
                  name="James Rodriguez"
                />
              )}
              {selectedWorkers.includes('lisa') && (
                <Area
                  type="monotone"
                  dataKey="lisa"
                  stroke="#a3a3a3"
                  fill="#a3a3a3"
                  fillOpacity={0.1}
                  name="Lisa Anderson"
                />
              )}
              {selectedWorkers.includes('david') && (
                <Area
                  type="monotone"
                  dataKey="david"
                  stroke="#d4d4d4"
                  fill="#d4d4d4"
                  fillOpacity={0.1}
                  name="David Kim"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Shift Completion */}
        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Shift Completion Status</h2>
              <p className="text-xs text-neutral-500">Progress towards daily shift requirements</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={shiftCompletionData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis type="number" stroke="#737373" style={{ fontSize: '12px' }} />
              <YAxis type="category" dataKey="name" stroke="#737373" style={{ fontSize: '12px' }} width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '4px'
                }}
              />
              <Legend />
              <Bar dataKey="target" fill="#e5e5e5" name="Target Hours" />
              <Bar dataKey="completed" fill="#171717" name="Completed Hours" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Trends */}
        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Weekly Trends</h2>
              <p className="text-xs text-neutral-500">Screen changes and active hours overview</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="day" stroke="#737373" style={{ fontSize: '12px' }} />
              <YAxis yAxisId="left" stroke="#737373" style={{ fontSize: '12px' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#737373" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '4px'
                }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="screenChanges" stroke="#171717" strokeWidth={2} name="Screen Changes" dot={{ r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="activeHours" stroke="#737373" strokeWidth={2} name="Active Hours" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white border border-neutral-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Performance Insights</h2>
          <button onClick={() => navigate('/performance')} className="text-sm text-neutral-600 hover:text-neutral-900 transition">
            View All →
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-neutral-50 border border-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-neutral-900">△</span>
              <span className="text-sm font-medium text-neutral-900">High Screen Activity</span>
            </div>
            <p className="text-xs text-neutral-600 mb-2">James Rodriguez shows 37% more screen changes than average</p>
            <span className="text-xs text-neutral-500">2 hours ago</span>
          </div>
          <div className="bg-neutral-50 border border-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-neutral-900">▴</span>
              <span className="text-sm font-medium text-neutral-900">Excellent Focus</span>
            </div>
            <p className="text-xs text-neutral-600 mb-2">Emma Wilson maintained 95% active time with minimal screen changes</p>
            <span className="text-xs text-neutral-500">1 hour ago</span>
          </div>
          <div className="bg-neutral-50 border border-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-neutral-900">◉</span>
              <span className="text-sm font-medium text-neutral-900">Shift Behind Schedule</span>
            </div>
            <p className="text-xs text-neutral-600 mb-2">David Kim is 45% through shift with 3 hours remaining</p>
            <span className="text-xs text-neutral-500">30 min ago</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
