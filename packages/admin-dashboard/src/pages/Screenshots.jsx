import { useState, useEffect } from 'react'
import { useT } from '../lib/i18n'
import { supabase } from '../lib/supabase'

function Screenshots() {
  const t = useT()
  const [screenshots, setScreenshots] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedScreenshot, setSelectedScreenshot] = useState(null)
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [dateRange, setDateRange] = useState('today')

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('screenshots')
        .select('*, workers(name)')
        .order('captured_at', { ascending: false })
        .limit(60)
      if (error || !data) { setLoading(false); return }
      // Batch-sign the private storage paths so images can be displayed.
      const paths = data.map(s => s.file_path)
      let urls = {}
      if (paths.length) {
        const { data: signed } = await supabase.storage.from('screenshots').createSignedUrls(paths, 3600)
        ;(signed || []).forEach((s, i) => { urls[paths[i]] = s.signedUrl })
      }
      setScreenshots(data.map(s => ({
        id: s.id,
        worker: s.workers?.name || 'Unknown',
        timestamp: s.captured_at,
        department: '—',
        label: s.label || '',
        url: urls[s.file_path] || '',
      })))
      setLoading(false)
    })()
  }, [])

  const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'Support']

  const filteredScreenshots = screenshots.filter(ss => {
    const matchesDepartment = departmentFilter === 'all' || ss.department === departmentFilter
    return matchesDepartment
  })

  return (
    <div className="p-6 space-y-6 bg-neutral-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">{t('pg.screenshots.title')}</h1>
          <p className="text-sm text-neutral-500">{t('pg.screenshots.sub')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:bg-neutral-100 transition">
            Bulk Download
          </button>
          <button className="px-4 py-2 text-sm text-white bg-neutral-900 hover:bg-neutral-700 transition">
            Auto-Capture Settings
          </button>
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
              placeholder="Search by worker name..."
              className="w-full bg-white border border-neutral-300 px-4 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900"
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Total Captures</span>
            <span className="text-2xl">◉</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900">{screenshots.length}</div>
          <div className="text-xs text-neutral-400 mt-1">Today</div>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Storage Used</span>
            <span className="text-2xl">▨</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900">—</div>
          <div className="text-xs text-neutral-400 mt-1">This week</div>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Capture Rate</span>
            <span className="text-2xl">⏱</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900">5 min</div>
          <div className="text-xs text-neutral-400 mt-1">Interval</div>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Quality</span>
            <span className="text-2xl">▴</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900">75%</div>
          <div className="text-xs text-neutral-400 mt-1">Compression</div>
        </div>
      </div>

      {/* Screenshots Grid */}
      <div className="bg-white border border-neutral-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Recent Captures</h2>
          <div className="text-sm text-neutral-500">
            Showing {filteredScreenshots.length} captures
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredScreenshots.map((screenshot) => (
            <div
              key={screenshot.id}
              className="border border-neutral-200 overflow-hidden hover:border-neutral-400 transition cursor-pointer"
              onClick={() => setSelectedScreenshot(screenshot)}
            >
              {/* Screenshot thumbnail */}
              <div className="aspect-video bg-neutral-100 flex items-center justify-center overflow-hidden">
                {screenshot.url ? (
                  <img
                    src={screenshot.url}
                    alt={`Screen capture — ${screenshot.worker}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-neutral-400 text-sm">
                    {new Date(screenshot.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-3 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-900">{screenshot.worker}</p>
                  {screenshot.label && (
                    <span className="text-xs font-medium px-2 py-0.5 bg-neutral-900 text-white rounded">
                      {screenshot.label}
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  {new Date(screenshot.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div
            className="bg-white border border-neutral-200 max-w-4xl w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">{selectedScreenshot.worker}</h3>
                <p className="text-sm text-neutral-500">{selectedScreenshot.label || 'Screen capture'}</p>
              </div>
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="p-2 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition"
              >
                <span className="text-lg">×</span>
              </button>
            </div>

            {/* Image */}
            <div className="aspect-video bg-neutral-100 flex items-center justify-center overflow-hidden">
              {selectedScreenshot.url ? (
                <img
                  src={selectedScreenshot.url}
                  alt={`Screen capture — ${selectedScreenshot.worker}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-neutral-400">Screenshot captured at {new Date(selectedScreenshot.timestamp).toLocaleString()}</span>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-200 flex items-center justify-between">
              <div className="text-sm text-neutral-500">
                Captured: {new Date(selectedScreenshot.timestamp).toLocaleString()}
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:bg-neutral-100 transition">
                  Download
                </button>
                <button className="px-4 py-2 text-sm text-white bg-neutral-900 hover:bg-neutral-700 transition">
                  Flag Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Screenshots
