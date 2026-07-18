import { useState } from 'react'

// Mock shift schedules data
const mockSchedules = [
  {
    id: '1',
    worker: 'Sarah Chen',
    department: 'Engineering',
    shifts: [
      { day: 'Monday', start: '09:00', end: '18:00', type: 'regular' },
      { day: 'Tuesday', start: '09:00', end: '18:00', type: 'regular' },
      { day: 'Wednesday', start: '09:00', end: '18:00', type: 'regular' },
      { day: 'Thursday', start: '09:00', end: '18:00', type: 'regular' },
      { day: 'Friday', start: '09:00', end: '18:00', type: 'regular' },
    ]
  },
  {
    id: '2',
    worker: 'Michael Park',
    department: 'Design',
    shifts: [
      { day: 'Monday', start: '10:00', end: '19:00', type: 'regular' },
      { day: 'Tuesday', start: '10:00', end: '19:00', type: 'regular' },
      { day: 'Wednesday', start: '10:00', end: '19:00', type: 'regular' },
      { day: 'Thursday', start: '10:00', end: '19:00', type: 'regular' },
      { day: 'Friday', start: '10:00', end: '19:00', type: 'regular' },
    ]
  },
  {
    id: '3',
    worker: 'Emma Wilson',
    department: 'Marketing',
    shifts: [
      { day: 'Monday', start: '08:30', end: '17:30', type: 'regular' },
      { day: 'Tuesday', start: '08:30', end: '17:30', type: 'regular' },
      { day: 'Wednesday', start: '08:30', end: '17:30', type: 'regular' },
      { day: 'Thursday', start: '08:30', end: '17:30', type: 'regular' },
      { day: 'Friday', start: '08:30', end: '17:30', type: 'regular' },
    ]
  },
]

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function ShiftSchedules() {
  const [schedules] = useState([])
  const [viewMode, setViewMode] = useState('weekly')
  const [selectedWeek, setSelectedWeek] = useState('current')
  const [departmentFilter, setDepartmentFilter] = useState('all')

  const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'Support']

  const filteredSchedules = schedules.filter((schedule) => {
    return departmentFilter === 'all' || schedule.department === departmentFilter
  })

  return (
    <div className="p-6 space-y-6 bg-neutral-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Shift Schedules</h1>
          <p className="text-sm text-neutral-500">Manage and monitor workforce shift schedules</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm text-white bg-neutral-900 hover:bg-neutral-700 transition">
            + Add New Schedule
          </button>
          <button className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:bg-neutral-100 transition">
            Export Calendar
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border border-neutral-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-neutral-100 border border-neutral-300 p-1">
              <button
                onClick={() => setViewMode('weekly')}
                className={`px-4 py-2 text-sm font-medium transition ${
                  viewMode === 'weekly' ? 'bg-white text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-4 py-2 text-sm font-medium transition ${
                  viewMode === 'monthly' ? 'bg-white text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Monthly
              </button>
            </div>

            {/* Week Selector */}
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition">
                <span>‹</span>
              </button>
              <span className="px-4 py-2 text-sm text-neutral-900 bg-white border border-neutral-300">
                {selectedWeek === 'current' ? 'This Week' : 'Previous Week'}
              </span>
              <button className="p-2 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition">
                <span>›</span>
              </button>
            </div>

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
          </div>

          {/* Pre-shift Buffer Setting */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-500">Pre-shift buffer:</span>
            <div className="flex items-center bg-white border border-neutral-300 px-3 py-1">
              <button
                onClick={() => {}}
                className="p-1 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition"
              >
                <span>-</span>
              </button>
              <span className="px-3 py-1 text-sm text-neutral-900">15 min</span>
              <button
                onClick={() => {}}
                className="p-1 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition"
              >
                <span>+</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'weekly' ? (
        <div className="bg-white border border-neutral-200 overflow-hidden">
          {/* Calendar Header */}
          <div className="grid grid-cols-8 border-b border-neutral-200">
            <div className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Worker
            </div>
            {days.map((day) => (
              <div key={day} className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">
                {day.substring(0, 3)}
              </div>
            ))}
          </div>

          {/* Calendar Body */}
          <div className="divide-y divide-neutral-200">
            {filteredSchedules.map((schedule) => (
              <div key={schedule.id} className="grid grid-cols-8">
                <div className="px-4 py-3 border-r border-neutral-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-neutral-900 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {schedule.worker.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{schedule.worker}</p>
                      <p className="text-xs text-neutral-500">{schedule.department}</p>
                    </div>
                  </div>
                </div>

                {days.map((day) => {
                  const shift = schedule.shifts.find((s) => s.day === day)
                  return (
                    <div key={`${schedule.id}-${day}`} className="px-2 py-3 border-r border-neutral-200 last:border-r-0">
                      {shift ? (
                        <div className="bg-neutral-100 border border-neutral-300 px-2 py-1.5 text-center">
                          <p className="text-xs text-neutral-900 font-medium">{shift.start}</p>
                          <p className="text-xs text-neutral-500">{shift.end}</p>
                        </div>
                      ) : (
                        <div className="text-neutral-400 text-xs text-center py-1.5">
                          Off
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 p-6">
          <p className="text-center text-neutral-500 text-sm">Monthly calendar view would be displayed here</p>
        </div>
      )}

      {/* Schedule Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-neutral-900 mb-1">24</div>
          <div className="text-xs text-neutral-500">Total Workers</div>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-neutral-900 mb-1">120</div>
          <div className="text-xs text-neutral-500">Hours Scheduled This Week</div>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-neutral-600 mb-1">8</div>
          <div className="text-xs text-neutral-500">Shift Conflicts</div>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-neutral-900 mb-1">96%</div>
          <div className="text-xs text-neutral-500">Schedule Adherence</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-neutral-200 p-4">
        <h3 className="text-sm font-medium text-neutral-900 mb-3">Quick Actions</h3>
    <div className="grid grid-cols-3 gap-3">
      <button className="px-4 py-3 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:bg-neutral-100 transition text-left">
        <span className="block text-xs text-neutral-500 mb-1">Batch Update</span>
        <span className="font-medium">Apply shift to multiple workers</span>
      </button>
      <button className="px-4 py-3 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:bg-neutral-100 transition text-left">
        <span className="block text-xs text-neutral-500 mb-1">Import Schedule</span>
        <span className="font-medium">Import from CSV or calendar</span>
      </button>
      <button className="px-4 py-3 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:bg-neutral-100 transition text-left">
        <span className="block text-xs text-neutral-500 mb-1">Conflict Detection</span>
        <span className="font-medium">Find scheduling conflicts</span>
      </button>
    </div>
      </div>
    </div>
  )
}

export default ShiftSchedules
