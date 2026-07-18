import { useState } from 'react'
import { useT } from '../lib/i18n'

// Mock shift templates
const mockShiftTemplates = [
  { id: '1', name: 'Standard 9-5', startTime: '09:00', endTime: '17:00', breakDuration: 60, workers: 12 },
  { id: '2', name: 'Early Shift', startTime: '06:00', endTime: '14:00', breakDuration: 30, workers: 4 },
  { id: '3', name: 'Late Shift', startTime: '14:00', endTime: '22:00', breakDuration: 45, workers: 6 },
  { id: '4', name: 'Night Shift', startTime: '22:00', endTime: '06:00', breakDuration: 60, workers: 2 },
]

// Mock shift assignments
const mockShiftAssignments = [
  { id: '1', worker: 'Sarah Chen', shift: 'Standard 9-5', startDate: '2026-06-01', endDate: '2026-12-31', pattern: 'Mon-Fri' },
  { id: '2', worker: 'Michael Park', shift: 'Early Shift', startDate: '2026-06-01', endDate: '2026-12-31', pattern: 'Mon-Fri' },
  { id: '3', worker: 'Emma Wilson', shift: 'Standard 9-5', startDate: '2026-06-01', endDate: '2026-12-31', pattern: 'Mon-Fri' },
  { id: '4', worker: 'James Rodriguez', shift: 'Late Shift', startDate: '2026-06-01', endDate: '2026-12-31', pattern: 'Tue-Sat' },
]

function ShiftManagement() {
  const t = useT()
  const [shiftTemplates] = useState([])
  const [shiftAssignments] = useState([])
  const [activeTab, setActiveTab] = useState('templates')

  return (
    <div className="p-6 space-y-6 bg-neutral-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">{t('pg.shiftmgmt.title')}</h1>
          <p className="text-sm text-neutral-500">{t('pg.shiftmgmt.sub')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:bg-neutral-100 transition">
            Import Schedule
          </button>
          <button className="px-4 py-2 text-sm text-white bg-neutral-900 hover:bg-neutral-700 transition">
            + New Shift Template
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-neutral-200">
        <div className="flex border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'templates'
                ? 'text-neutral-900 border-b-2 border-neutral-900'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Shift Templates
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'assignments'
                ? 'text-neutral-900 border-b-2 border-neutral-900'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Worker Assignments
          </button>
          <button
            onClick={() => setActiveTab('overrides')}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'overrides'
                ? 'text-neutral-900 border-b-2 border-neutral-900'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Shift Overrides
          </button>
        </div>

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shiftTemplates.map((template) => (
                <div key={template.id} className="border border-neutral-200 p-5 hover:border-neutral-400 transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-1">{template.name}</h3>
                      <p className="text-xs text-neutral-500">Template ID: {template.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition">
                        <span>⚙</span>
                      </button>
                      <button className="p-2 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition">
                        <span>⋮</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Start Time</p>
                      <p className="text-sm font-medium text-neutral-900">{template.startTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">End Time</p>
                      <p className="text-sm font-medium text-neutral-900">{template.endTime}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-neutral-500">
                        <span className="font-medium text-neutral-900">{template.breakDuration}</span> min break
                      </span>
                      <span className="text-neutral-500">
                        <span className="font-medium text-neutral-900">{template.workers}</span> workers
                      </span>
                    </div>
                    <button className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:bg-neutral-100 transition">
                      Assign Workers
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Worker</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Shift</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Pattern</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Valid From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Valid Until</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {shiftAssignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 text-sm text-neutral-900 font-medium">{assignment.worker}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{assignment.shift}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{assignment.pattern}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{new Date(assignment.startDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{new Date(assignment.endDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition">
                            <span>⚙</span>
                          </button>
                          <button className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition">
                            <span>⋮</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Overrides Tab */}
        {activeTab === 'overrides' && (
          <div className="p-5">
            <div className="bg-neutral-50 border border-neutral-200 p-8 text-center">
              <span className="text-4xl block mb-4">⏱</span>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Shift Overrides</h3>
              <p className="text-sm text-neutral-600 mb-4">Create temporary shift changes for specific dates</p>
              <button className="px-4 py-2 text-sm text-white bg-neutral-900 hover:bg-neutral-700 transition">
                + Create Override
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-neutral-200 p-5">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-4">
          <button className="p-4 border border-neutral-200 hover:bg-neutral-100 transition text-left">
            <span className="text-2xl block mb-2">▤</span>
            <p className="text-sm font-medium text-neutral-900">Bulk Assign Shift</p>
            <p className="text-xs text-neutral-500">Assign multiple workers to a shift</p>
          </button>
          <button className="p-4 border border-neutral-200 hover:bg-neutral-100 transition text-left">
            <span className="text-2xl block mb-2">📅</span>
            <p className="text-sm font-medium text-neutral-900">Copy Week Schedule</p>
            <p className="text-xs text-neutral-500">Duplicate schedule to another week</p>
          </button>
          <button className="p-4 border border-neutral-200 hover:bg-neutral-100 transition text-left">
            <span className="text-2xl block mb-2">⚙</span>
            <p className="text-sm font-medium text-neutral-900">Auto-Generate</p>
            <p className="text-xs text-neutral-500">Create optimized shift schedule</p>
          </button>
        </div>
      </div>

      {/* Shift Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Total Templates</span>
            <span className="text-2xl">▨</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900">{shiftTemplates.length}</div>
          <div className="text-xs text-neutral-400 mt-1">Active shifts</div>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Total Assignments</span>
            <span className="text-2xl">▤</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900">{shiftAssignments.length}</div>
          <div className="text-xs text-neutral-400 mt-1">Workers assigned</div>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Avg Shift Duration</span>
            <span className="text-2xl">⏱</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900">7.5h</div>
          <div className="text-xs text-neutral-400 mt-1">Including breaks</div>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Coverage</span>
            <span className="text-2xl">▴</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900">94%</div>
          <div className="text-xs text-neutral-400 mt-1">Shifts filled</div>
        </div>
      </div>
    </div>
  )
}

export default ShiftManagement
