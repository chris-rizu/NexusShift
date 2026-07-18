import { useState } from 'react'
import { useT } from '../lib/i18n'

// Mock export history
const mockExportHistory = [
  { id: '1', type: 'Worker Data', format: 'CSV', date: '2026-06-03T10:30:00', records: 24, size: '2.4 MB', status: 'completed' },
  { id: '2', type: 'Activity Logs', format: 'JSON', date: '2026-06-03T09:15:00', records: 156, size: '8.7 MB', status: 'completed' },
  { id: '3', type: 'Screenshots', format: 'ZIP', date: '2026-06-02T16:45:00', records: 480, size: '125 MB', status: 'completed' },
  { id: '4', type: 'Time Logs', format: 'CSV', date: '2026-06-02T14:20:00', records: 96, size: '1.8 MB', status: 'completed' },
]

const exportOptions = [
  { id: 'workers', name: 'Worker Data', icon: '▤', description: 'Complete worker profiles and status', formats: ['CSV', 'JSON', 'XML'] },
  { id: 'activity', name: 'Activity Logs', icon: '⚡', description: 'Detailed activity tracking data', formats: ['CSV', 'JSON', 'XLSX'] },
  { id: 'screenshots', name: 'Screenshots', icon: '◉', description: 'Screen capture archives', formats: ['ZIP', 'PDF'] },
  { id: 'time_logs', name: 'Time Logs', icon: '⏱', description: 'Shift and time tracking records', formats: ['CSV', 'JSON', 'XLSX'] },
  { id: 'reports', name: 'Reports', icon: '▨', description: 'Performance and compliance reports', formats: ['PDF', 'XLSX', 'CSV'] },
  { id: 'alerts', name: 'Alerts Data', icon: '△', description: 'Alert history and resolutions', formats: ['CSV', 'JSON'] },
]

function ExportData() {
  const t = useT()
  const [exportHistory] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [selectedFormat, setSelectedFormat] = useState('CSV')
  const [dateRange, setDateRange] = useState('today')
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    if (!selectedOption) return
    setIsExporting(true)
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false)
      alert('Export completed successfully!')
    }, 2000)
  }

  return (
    <div className="p-6 space-y-6 bg-neutral-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">{t('pg.export.title')}</h1>
          <p className="text-sm text-neutral-500">{t('pg.export.sub')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:bg-neutral-100 transition">
            View API Docs
          </button>
          <button className="px-4 py-2 text-sm text-white bg-neutral-900 hover:bg-neutral-700 transition">
            Scheduled Exports
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Data Selection */}
          <div className="bg-white border border-neutral-200 p-5">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Select Data to Export</h2>
            <div className="grid grid-cols-2 gap-4">
              {exportOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(selectedOption === option.id ? null : option.id)}
                  className={`p-4 border text-left transition ${
                    selectedOption === option.id
                      ? 'border-neutral-900 bg-neutral-50'
                      : 'border-neutral-200 hover:bg-neutral-100 hover:border-neutral-400'
                  }`}
                >
                  <span className="text-2xl block mb-2">{option.icon}</span>
                  <p className="text-sm font-medium text-neutral-900">{option.name}</p>
                  <p className="text-xs text-neutral-500 mt-1">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Export Configuration */}
          {selectedOption && (
            <div className="bg-white border border-neutral-200 p-5">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Configure Export</h2>

              <div className="space-y-4">
                {/* Format Selection */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Export Format</label>
                  <div className="flex items-center gap-3">
                    {exportOptions.find(o => o.id === selectedOption)?.formats.map((format) => (
                      <button
                        key={format}
                        onClick={() => setSelectedFormat(format)}
                        className={`px-4 py-2 text-sm border transition ${
                          selectedFormat === format
                            ? 'border-neutral-900 bg-neutral-900 text-white'
                            : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Date Range</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
                  >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                {/* Filters */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Additional Filters</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="filter-active" className="rounded" />
                      <label htmlFor="filter-active" className="text-sm text-neutral-600">Only active workers</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="filter-dept" className="rounded" />
                      <label htmlFor="filter-dept" className="text-sm text-neutral-600">Filter by department</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="filter-status" className="rounded" />
                      <label htmlFor="filter-status" className="text-sm text-neutral-600">Include only completed shifts</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className={`px-6 py-2.5 text-sm font-medium transition ${
                    isExporting
                      ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                      : 'bg-neutral-900 text-white hover:bg-neutral-700'
                  }`}
                >
                  {isExporting ? 'Exporting...' : `Export as ${selectedFormat}`}
                </button>
                <button className="px-6 py-2.5 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:bg-neutral-100 transition">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Export Statistics */}
          <div className="bg-white border border-neutral-200 p-5">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Export Statistics</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Total Exports</span>
                <span className="text-lg font-bold text-neutral-900">{exportHistory.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">This Week</span>
                <span className="text-lg font-bold text-neutral-900">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Data Exported</span>
                <span className="text-lg font-bold text-neutral-900">1.8 GB</span>
              </div>
            </div>
          </div>

          {/* Recent Exports */}
          <div className="bg-white border border-neutral-200 p-5">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recent Exports</h2>
            <div className="space-y-3">
              {exportHistory.slice(0, 4).map((exportItem) => (
                <div key={exportItem.id} className="p-3 bg-neutral-50 border border-neutral-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-neutral-900">{exportItem.type}</p>
                    <span className="text-xs text-neutral-500">{exportItem.format}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span>{exportItem.records} records</span>
                    <span>•</span>
                    <span>{exportItem.size}</span>
                    <span>•</span>
                    <span>{new Date(exportItem.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Export Templates */}
          <div className="bg-white border border-neutral-200 p-5">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Templates</h2>
            <div className="space-y-2">
              <button className="w-full p-3 text-left border border-neutral-200 hover:bg-neutral-100 transition">
                <p className="text-sm font-medium text-neutral-900">Daily Summary</p>
                <p className="text-xs text-neutral-500">All data from today</p>
              </button>
              <button className="w-full p-3 text-left border border-neutral-200 hover:bg-neutral-100 transition">
                <p className="text-sm font-medium text-neutral-900">Weekly Report</p>
                <p className="text-xs text-neutral-500">Complete week data</p>
              </button>
              <button className="w-full p-3 text-left border border-neutral-200 hover:bg-neutral-100 transition">
                <p className="text-sm font-medium text-neutral-900">Compliance Pack</p>
                <p className="text-xs text-neutral-500">Audit-ready exports</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export History Table */}
      <div className="bg-white border border-neutral-200 overflow-hidden">
        <div className="p-5 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Export History</h2>
        </div>
        <table className="w-full">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Format</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Records</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {exportHistory.map((exportItem) => (
              <tr key={exportItem.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4 text-sm text-neutral-900 font-medium">{exportItem.type}</td>
                <td className="px-6 py-4 text-sm text-neutral-600">{exportItem.format}</td>
                <td className="px-6 py-4 text-sm text-neutral-600">{exportItem.records}</td>
                <td className="px-6 py-4 text-sm text-neutral-600">{exportItem.size}</td>
                <td className="px-6 py-4 text-sm text-neutral-600">{new Date(exportItem.date).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium ${
                    exportItem.status === 'completed' ? 'bg-neutral-100 text-neutral-900' : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {exportItem.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition">
                      <span>⬇</span>
                    </button>
                    <button className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition">
                      <span>🗑</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ExportData
