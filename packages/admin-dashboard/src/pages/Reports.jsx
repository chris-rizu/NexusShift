import { useState } from 'react'
import { useT } from '../lib/i18n'

// Mock reports data
const mockReports = [
  {
    id: '1',
    name: 'Weekly Productivity Report',
    type: 'productivity',
    createdAt: '2026-06-03T08:00:00',
    createdBy: 'System',
    schedule: 'Weekly',
    lastRun: '2026-06-03T08:00:00',
    status: 'completed'
  },
  {
    id: '2',
    name: 'Shift Attendance Summary',
    type: 'attendance',
    createdAt: '2026-06-01T09:00:00',
    createdBy: 'Admin User',
    schedule: 'Daily',
    lastRun: '2026-06-03T09:00:00',
    status: 'completed'
  },
  {
    id: '3',
    name: 'Department Performance Analysis',
    type: 'performance',
    createdAt: '2026-05-28T10:00:00',
    createdBy: 'Admin User',
    schedule: 'Monthly',
    lastRun: '2026-06-01T10:00:00',
    status: 'pending'
  },
  {
    id: '4',
    name: 'Screen Activity Summary',
    type: 'activity',
    createdAt: '2026-06-02T14:00:00',
    createdBy: 'System',
    schedule: 'On-demand',
    lastRun: null,
    status: 'completed'
  },
]

const reportTemplates = [
  { id: 'productivity', name: 'Productivity Report', icon: '▴', description: 'Worker productivity metrics and trends' },
  { id: 'attendance', name: 'Attendance Report', icon: '▤', description: 'Shift attendance and punctuality analysis' },
  { id: 'performance', name: 'Performance Report', icon: '▴', description: 'Department and individual performance' },
  { id: 'activity', name: 'Activity Report', icon: '⚡', description: 'Screen changes and activity patterns' },
  { id: 'time', name: 'Time Logs Report', icon: '⏱', description: 'Detailed time tracking and logs' },
  { id: 'compliance', name: 'Compliance Report', icon: '▨', description: 'Policy compliance and violations' },
]

function Reports() {
  const t = useT()
  const [reports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-neutral-100 text-neutral-900'
      case 'pending': return 'bg-neutral-200 text-neutral-600'
      case 'failed': return 'bg-neutral-300 text-neutral-700'
      default: return 'bg-neutral-50 text-neutral-500'
    }
  }

  return (
    <div className="p-6 space-y-6 bg-neutral-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">{t('pg.reports.title')}</h1>
          <p className="text-sm text-neutral-500">{t('pg.reports.sub')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:bg-neutral-100 transition">
            Schedule Report
          </button>
          <button className="px-4 py-2 text-sm text-white bg-neutral-900 hover:bg-neutral-700 transition">
            + Create New Report
          </button>
        </div>
      </div>

      {/* Report Templates */}
      <div className="bg-white border border-neutral-200 p-5">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Generate</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {reportTemplates.map((template) => (
            <button
              key={template.id}
              className="p-4 border border-neutral-200 hover:bg-neutral-100 hover:border-neutral-400 transition text-left"
            >
              <span className="text-2xl block mb-2">{template.icon}</span>
              <p className="text-sm font-medium text-neutral-900">{template.name}</p>
              <p className="text-xs text-neutral-500 mt-1">{template.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white border border-neutral-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Recent Reports</h2>
          <button className="text-sm text-neutral-600 hover:text-neutral-900 transition">
            View All →
          </button>
        </div>

        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center gap-4 p-4 border border-neutral-200 hover:bg-neutral-100 transition cursor-pointer"
              onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
            >
              {/* Icon */}
              <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center">
                <span className="text-xl">▨</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">{report.name}</p>
                    <p className="text-xs text-neutral-500">{report.type}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`px-2 py-1 text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>By: {report.createdBy}</span>
                  <span>•</span>
                  <span>Schedule: {report.schedule}</span>
                  {report.lastRun && (
                    <>
                      <span>•</span>
                      <span>Last run: {new Date(report.lastRun).toLocaleString()}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 transition">
                  <span>▤</span>
                </button>
                <button className="p-2 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 transition">
                  <span>⚙</span>
                </button>
                <button className="p-2 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 transition">
                  <span>⋮</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Total Reports</span>
            <span className="text-2xl">▨</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900">{reports.length}</div>
          <div className="text-xs text-neutral-400 mt-1">All time</div>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Active Schedules</span>
            <span className="text-2xl">⏱</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900">3</div>
          <div className="text-xs text-neutral-400 mt-1">Auto-generated</div>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Completed Today</span>
            <span className="text-2xl">▴</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900">5</div>
          <div className="text-xs text-neutral-400 mt-1">Successfully generated</div>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Storage Used</span>
            <span className="text-2xl">▤</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900">1.2 GB</div>
          <div className="text-xs text-neutral-400 mt-1">Report archives</div>
        </div>
      </div>

      {/* Report Builder */}
      <div className="bg-white border border-neutral-200 p-5">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Custom Report Builder</h2>
        <div className="bg-neutral-50 border border-neutral-200 p-8 text-center">
          <span className="text-4xl block mb-4">▨</span>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Create Custom Reports</h3>
          <p className="text-sm text-neutral-600 mb-4">
            Build customized reports with specific metrics, filters, and data ranges
          </p>
          <button className="px-6 py-2 text-sm text-white bg-neutral-900 hover:bg-neutral-700 transition">
            Launch Report Builder
          </button>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-white border border-neutral-200 p-5">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Report Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-900 mb-3">Auto-Generation</h3>
            <div className="space-y-2">
              <label className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Daily summary at 6 PM</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </label>
              <label className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Weekly analytics on Monday</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </label>
              <label className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Monthly compliance review</span>
                <input type="checkbox" className="rounded" />
              </label>
            </div>
          </div>

          <div className="p-4 border border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-900 mb-3">Report Retention</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Keep reports for</span>
                <select className="border border-neutral-300 px-2 py-1 text-xs">
                  <option>30 days</option>
                  <option>60 days</option>
                  <option selected>90 days</option>
                  <option>1 year</option>
                </select>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Auto-archive older reports</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
