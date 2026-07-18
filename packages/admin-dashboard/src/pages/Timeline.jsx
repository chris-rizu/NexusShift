import { useState } from 'react'

// Mock timeline data
const mockTimelineEvents = [
  { id: '1', worker: 'Sarah Chen', event: 'Shift Started', timestamp: '2026-06-03T09:00:00', type: 'shift', duration: null },
  { id: '2', worker: 'Michael Park', event: 'Shift Started', timestamp: '2026-06-03T09:00:00', type: 'shift', duration: null },
  { id: '3', worker: 'Emma Wilson', event: 'Shift Started', timestamp: '2026-06-03T09:00:00', type: 'shift', duration: null },
  { id: '4', worker: 'Sarah Chen', event: 'Break Started', timestamp: '2026-06-03T10:30:00', type: 'break', duration: '15 min' },
  { id: '5', worker: 'James Rodriguez', event: 'Shift Started', timestamp: '2026-06-03T09:00:00', type: 'shift', duration: null },
  { id: '6', worker: 'Sarah Chen', event: 'Break Ended', timestamp: '2026-06-03T10:45:00', type: 'break', duration: null },
  { id: '7', worker: 'Lisa Anderson', event: 'Shift Started', timestamp: '2026-06-03T09:00:00', type: 'shift', duration: null },
  { id: '8', worker: 'Michael Park', event: 'Break Started', timestamp: '2026-06-03T11:00:00', type: 'break', duration: '30 min' },
  { id: '9', worker: 'David Kim', event: 'Shift Started', timestamp: '2026-06-03T09:30:00', type: 'shift', duration: null },
  { id: '10', worker: 'Michael Park', event: 'Break Ended', timestamp: '2026-06-03T11:30:00', type: 'break', duration: null },
]

function Timeline() {
  const [timelineEvents] = useState([])
  const [selectedWorker, setSelectedWorker] = useState('all')
  const [viewMode, setViewMode] = useState('timeline')
  const [dateRange, setDateRange] = useState('today')

  const workers = ['all', 'Sarah Chen', 'Michael Park', 'Emma Wilson', 'James Rodriguez', 'Lisa Anderson', 'David Kim']

  const filteredEvents = timelineEvents.filter(event => {
    const matchesWorker = selectedWorker === 'all' || event.worker === selectedWorker
    return matchesWorker
  })

  const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

  const getEventIcon = (type) => {
    switch (type) {
      case 'shift': return '▤'
      case 'break': return '○'
      case 'meeting': return '⚙'
      case 'alert': return '△'
      default: return '◉'
    }
  }

  const getEventColor = (type) => {
    switch (type) {
      case 'shift': return 'bg-neutral-900 text-white'
      case 'break': return 'bg-neutral-200 text-neutral-600'
      case 'meeting': return 'bg-neutral-100 text-neutral-900'
      case 'alert': return 'bg-neutral-300 text-neutral-900'
      default: return 'bg-neutral-100 text-neutral-600'
    }
  }

  return (
    <div className="p-6 space-y-6 bg-neutral-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Timeline View</h1>
          <p className="text-sm text-neutral-500">Chronological view of workforce activities and events</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:bg-neutral-100 transition">
            Export Timeline
          </button>
          <button className="px-4 py-2 text-sm text-white bg-neutral-900 hover:bg-neutral-700 transition">
            Schedule Event
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border border-neutral-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Worker Filter */}
            <select
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
              className="bg-white border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
            >
              {workers.map((worker) => (
                <option key={worker} value={worker}>
                  {worker === 'all' ? 'All Workers' : worker}
                </option>
              ))}
            </select>

            {/* View Mode */}
            <div className="flex items-center bg-neutral-100 border border-neutral-300 p-1">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-2 text-sm font-medium transition ${
                  viewMode === 'timeline' ? 'bg-white text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium transition ${
                  viewMode === 'list' ? 'bg-white text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                List View
              </button>
            </div>

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
          </div>

          {/* Stats Summary */}
          <div className="text-sm text-neutral-500">
            Showing {filteredEvents.length} events
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Total Events</span>
            <span className="text-2xl">⏱</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900">{timelineEvents.length}</div>
          <div className="text-xs text-neutral-400 mt-1">Today</div>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Shift Started</span>
            <span className="text-2xl">▤</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900">{timelineEvents.filter(e => e.event === 'Shift Started').length}</div>
          <div className="text-xs text-neutral-400 mt-1">Workers clocked in</div>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Active Breaks</span>
            <span className="text-2xl">○</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900">{timelineEvents.filter(e => e.type === 'break').length / 2}</div>
          <div className="text-xs text-neutral-400 mt-1">Currently on break</div>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Total Hours</span>
            <span className="text-2xl">⚙</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900">42.5h</div>
          <div className="text-xs text-neutral-400 mt-1">Tracked today</div>
        </div>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' ? (
        <div className="bg-white border border-neutral-200 p-5">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Event Timeline</h2>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-neutral-200"></div>

            {/* Events */}
            <div className="space-y-4">
              {sortedEvents.map((event, index) => (
                <div key={event.id} className="relative flex items-start gap-4">
                  {/* Timeline Dot */}
                  <div className="relative z-10 w-12 h-12 flex items-center justify-center">
                    <div className={`w-8 h-8 ${getEventColor(event.type)} flex items-center justify-center`}>
                      <span className="text-sm">{getEventIcon(event.type)}</span>
                    </div>
                  </div>

                  {/* Event Card */}
                  <div className="flex-1 bg-neutral-50 border border-neutral-200 p-4 hover:bg-neutral-100 transition">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-neutral-900">{event.worker}</p>
                          <span className={`px-2 py-0.5 text-xs ${getEventColor(event.type)}`}>
                            {event.type}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600">{event.event}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-neutral-900">{new Date(event.timestamp).toLocaleTimeString()}</p>
                        {event.duration && (
                          <p className="text-xs text-neutral-500 mt-1">{event.duration}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white border border-neutral-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Worker</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {sortedEvents.map((event) => (
                <tr key={event.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 text-sm text-neutral-900">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{event.worker}</td>
                  <td className="px-6 py-4 text-sm text-neutral-900 font-medium">{event.event}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs ${getEventColor(event.type)}`}>
                      {event.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{event.duration || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Worker Timeline Summary */}
      <div className="bg-white border border-neutral-200 p-5">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Worker Timeline Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {workers.slice(1).map((worker) => {
            const workerEvents = timelineEvents.filter(e => e.worker === worker)
            const shiftStart = workerEvents.find(e => e.event === 'Shift Started')
            return (
              <div key={worker} className="p-4 bg-neutral-50 border border-neutral-200">
                <p className="text-sm font-medium text-neutral-900 mb-2">{worker}</p>
                <div className="space-y-1 text-xs text-neutral-600">
                  <p>Events: {workerEvents.length}</p>
                  {shiftStart && (
                    <p>Started: {new Date(shiftStart.timestamp).toLocaleTimeString()}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Timeline
