import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { TrendingUp, TrendingDown, Minus, Download, Zap, Users, Calendar } from 'lucide-react'
import { exportToCSV, generateFilename } from '../utils/export'

// Mock performance data
const mockPerformanceData = [
  { id: '1', worker: 'Sarah Chen', department: 'Engineering', productivity: 92, efficiency: 88, quality: 95, attendance: 98, trend: 'up' },
  { id: '2', worker: 'Michael Park', department: 'Design', productivity: 78, efficiency: 85, quality: 82, attendance: 90, trend: 'stable' },
  { id: '3', worker: 'Emma Wilson', department: 'Marketing', productivity: 88, efficiency: 90, quality: 85, attendance: 95, trend: 'up' },
  { id: '4', worker: 'James Rodriguez', department: 'Engineering', productivity: 65, efficiency: 70, quality: 68, attendance: 75, trend: 'down' },
  { id: '5', worker: 'Lisa Anderson', department: 'Sales', productivity: 82, efficiency: 88, quality: 80, attendance: 92, trend: 'up' },
  { id: '6', worker: 'David Kim', department: 'Support', productivity: 45, efficiency: 50, quality: 55, attendance: 60, trend: 'down' },
]

const departmentAverages = [
  { department: 'Engineering', productivity: 78, efficiency: 79, quality: 81, attendance: 86 },
  { department: 'Design', productivity: 78, efficiency: 85, quality: 82, attendance: 90 },
  { department: 'Marketing', productivity: 88, efficiency: 90, quality: 85, attendance: 95 },
  { department: 'Sales', productivity: 82, efficiency: 88, quality: 80, attendance: 92 },
  { department: 'Support', productivity: 45, efficiency: 50, quality: 55, attendance: 60 },
]

function Performance() {
  const [performanceData] = useState([])
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [sortBy, setSortBy] = useState('productivity')
  const [timeRange, setTimeRange] = useState('month')

  const departments = ['all', 'Engineering', 'Design', 'Marketing', 'Sales', 'Support']

  const handleExport = () => {
    try {
      toast.loading('Preparing export...', { id: 'export' })
      const exportData = performanceData.map(worker => ({
        Worker: worker.worker,
        Department: worker.department,
        Productivity: `${worker.productivity}%`,
        Efficiency: `${worker.efficiency}%`,
        Quality: `${worker.quality}%`,
        Attendance: `${worker.attendance}%`,
        Trend: worker.trend
      }))
      const result = exportToCSV(exportData, generateFilename('performance', 'csv'))

      if (result.success) {
        toast.success('Performance data exported successfully!', { id: 'export' })
      } else {
        toast.error('Export failed. Please try again.', { id: 'export' })
      }
    } catch (error) {
      toast.error('Export failed. Please try again.', { id: 'export' })
      console.error('Export error:', error)
    }
  }

  const filteredData = performanceData.filter(worker => {
    const matchesDepartment = departmentFilter === 'all' || worker.department === departmentFilter
    return matchesDepartment
  }).sort((a, b) => b[sortBy] - a[sortBy])

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4" />
      case 'down': return <TrendingDown className="w-4 h-4" />
      case 'stable': return <Minus className="w-4 h-4" />
      default: return <Minus className="w-4 h-4" />
    }
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-neutral-900'
      case 'down': return 'text-neutral-400'
      case 'stable': return 'text-neutral-600'
      default: return 'text-neutral-300'
    }
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-neutral-100 text-neutral-900'
    if (score >= 80) return 'bg-neutral-200 text-neutral-700'
    if (score >= 70) return 'bg-neutral-300 text-neutral-600'
    return 'bg-neutral-400 text-neutral-700'
  }

  return (
    <div className="p-6 space-y-6 bg-neutral-50 dark:bg-neutral-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">Performance Metrics</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Track and analyze workforce productivity and efficiency</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 px-4 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm text-white bg-neutral-900 dark:bg-neutral-700 hover:bg-neutral-700 dark:hover:bg-neutral-600 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 dark:text-neutral-400 text-sm">Avg Productivity</span>
            <TrendingUp className="w-8 h-8 text-neutral-500 dark:text-neutral-400" />
          </div>
          <div className="text-3xl font-bold text-neutral-900 dark:text-white">75%</div>
          <div className="text-xs text-neutral-400 mt-1">+5% from last month</div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 dark:text-neutral-400 text-sm">Avg Efficiency</span>
            <Zap className="w-8 h-8 text-neutral-500 dark:text-neutral-400" />
          </div>
          <div className="text-3xl font-bold text-neutral-900 dark:text-white">78%</div>
          <div className="text-xs text-neutral-400 mt-1">+3% from last month</div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 dark:text-neutral-400 text-sm">Avg Quality</span>
            <TrendingUp className="w-8 h-8 text-neutral-500 dark:text-neutral-400" />
          </div>
          <div className="text-3xl font-bold text-neutral-900 dark:text-white">82%</div>
          <div className="text-xs text-neutral-400 mt-1">+2% from last month</div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 dark:text-neutral-400 text-sm">Avg Attendance</span>
            <Users className="w-8 h-8 text-neutral-500 dark:text-neutral-400" />
          </div>
          <div className="text-3xl font-bold text-neutral-900 dark:text-white">90%</div>
          <div className="text-xs text-neutral-400 mt-1">No change</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-neutral-200 p-4">
        <div className="flex items-center gap-4">
          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-white border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
          >
            <option value="productivity">Sort by Productivity</option>
            <option value="efficiency">Sort by Efficiency</option>
            <option value="quality">Sort by Quality</option>
            <option value="attendance">Sort by Attendance</option>
          </select>
        </div>
      </div>

      {/* Department Performance Overview */}
      <div className="bg-white border border-neutral-200 p-5">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Department Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Department</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase">Productivity</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase">Efficiency</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase">Quality</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase">Attendance</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase">Overall</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {departmentAverages.map((dept) => {
                const overall = Math.round((dept.productivity + dept.efficiency + dept.quality + dept.attendance) / 4)
                return (
                  <tr key={dept.department} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-sm text-neutral-900 font-medium">{dept.department}</td>
                    <td className="px-4 py-3 text-sm text-neutral-900 text-center">{dept.productivity}%</td>
                    <td className="px-4 py-3 text-sm text-neutral-900 text-center">{dept.efficiency}%</td>
                    <td className="px-4 py-3 text-sm text-neutral-900 text-center">{dept.quality}%</td>
                    <td className="px-4 py-3 text-sm text-neutral-900 text-center">{dept.attendance}%</td>
                    <td className="px-4 py-3 text-sm text-neutral-900 text-center font-semibold">{overall}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Performance */}
      <div className="bg-white border border-neutral-200 p-5">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Individual Performance</h2>
        <div className="space-y-3">
          {filteredData.map((worker) => {
            const overall = Math.round((worker.productivity + worker.efficiency + worker.quality + worker.attendance) / 4)
            return (
              <div
                key={worker.id}
                className="border border-neutral-200 p-4 hover:bg-neutral-100 transition cursor-pointer"
                onClick={() => setSelectedWorker(selectedWorker === worker.id ? null : worker.id)}
              >
                <div className="flex items-center gap-4">
                  {/* Worker Info */}
                  <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{worker.worker.charAt(0)}</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-medium text-neutral-900">{worker.worker}</p>
                      <p className="text-xs text-neutral-500">{worker.department}</p>
                      <span className={`text-lg ${getTrendColor(worker.trend)}`}>
                        {getTrendIcon(worker.trend)}
                      </span>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-neutral-500">Productivity</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-neutral-200 h-2">
                            <div
                              className="bg-neutral-900 h-2"
                              style={{ width: `${worker.productivity}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-neutral-900">{worker.productivity}%</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-neutral-500">Efficiency</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-neutral-200 h-2">
                            <div
                              className="bg-neutral-900 h-2"
                              style={{ width: `${worker.efficiency}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-neutral-900">{worker.efficiency}%</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-neutral-500">Quality</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-neutral-200 h-2">
                            <div
                              className="bg-neutral-900 h-2"
                              style={{ width: `${worker.quality}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-neutral-900">{worker.quality}%</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-neutral-500">Attendance</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-neutral-200 h-2">
                            <div
                              className="bg-neutral-900 h-2"
                              style={{ width: `${worker.attendance}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-neutral-900">{worker.attendance}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Overall Score */}
                  <div className="text-right">
                    <div className={`px-4 py-2 ${getScoreColor(overall)} text-center mb-2`}>
                      <p className="text-2xl font-bold">{overall}%</p>
                      <p className="text-xs">Overall</p>
                    </div>
                    <button className="px-3 py-1 text-xs text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:bg-neutral-100 transition">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Worker Details */}
      {selectedWorker && (
        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Performance Details</h2>
            <button
              onClick={() => setSelectedWorker(null)}
              className="p-2 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition"
            >
              <span className="text-lg">×</span>
            </button>
          </div>

          {(() => {
            const worker = performanceData.find(w => w.id === selectedWorker)
            if (!worker) return null

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Worker</p>
                    <p className="text-sm font-medium text-neutral-900">{worker.worker}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Department</p>
                    <p className="text-sm text-neutral-600">{worker.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Trend</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg ${getTrendColor(worker.trend)}`}>
                        {getTrendIcon(worker.trend)}
                      </span>
                      <span className="text-sm text-neutral-600 capitalize">{worker.trend}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Productivity Score</p>
                    <p className="text-2xl font-bold text-neutral-900">{worker.productivity}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Efficiency Score</p>
                    <p className="text-2xl font-bold text-neutral-900">{worker.efficiency}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Quality Score</p>
                    <p className="text-2xl font-bold text-neutral-900">{worker.quality}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Attendance Score</p>
                    <p className="text-2xl font-bold text-neutral-900">{worker.attendance}%</p>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

export default Performance
