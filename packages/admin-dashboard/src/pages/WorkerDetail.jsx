import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const eventDetails = {
  active: 'Activity detected at keyboard/mouse',
  idle_start: 'No keyboard/mouse activity detected',
  idle_end: 'Activity resumed after idle period',
}

function WorkerDetail() {
  const { workerId } = useParams()
  const navigate = useNavigate()
  const [worker, setWorker] = useState(null)
  const [loading, setLoading] = useState(true)
  const [screenshots, setScreenshots] = useState([])
  const [activityLogs, setActivityLogs] = useState([])
  const [timeLogs, setTimeLogs] = useState([])

  useEffect(() => {
    (async () => {
      const { data: w } = await supabase.from('workers').select('*').eq('id', workerId).single()
      if (w) {
        setWorker({ ...w, status: w.is_active ? 'online' : 'offline', department: '—', activeTime: '—', idlePercent: 0 })
      }

      const { data: ss } = await supabase
        .from('screenshots').select('*')
        .eq('worker_id', workerId).order('captured_at', { ascending: false }).limit(12)
      if (ss && ss.length) {
        const { data: signed } = await supabase.storage.from('screenshots').createSignedUrls(ss.map(s => s.file_path), 3600)
        setScreenshots(ss.map((s, i) => ({ id: s.id, timestamp: s.captured_at, label: s.label || '', url: signed?.[i]?.signedUrl || '' })))
      }

      const { data: al } = await supabase
        .from('activity_logs').select('id,event_type,timestamp')
        .eq('worker_id', workerId).order('timestamp', { ascending: false }).limit(20)
      setActivityLogs((al || []).map(a => ({
        id: a.id, type: a.event_type,
        time: new Date(a.timestamp).toLocaleTimeString(),
        details: eventDetails[a.event_type] || a.event_type,
      })))

      const { data: tl } = await supabase
        .from('time_logs').select('*')
        .eq('worker_id', workerId).order('clock_in', { ascending: false }).limit(20)
      setTimeLogs(tl || [])

      setLoading(false)
    })()
  }, [workerId])

  if (loading) {
    return <div className="min-h-screen bg-neutral-50 flex items-center justify-center text-neutral-500">Loading…</div>
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="bg-white border border-neutral-200 p-8 text-center">
          <p className="text-neutral-600 mb-4">Worker not found</p>
          <button
            onClick={() => navigate('/workers')}
            className="px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-700 transition"
          >
            Back to Workers
          </button>
        </div>
      </div>
    )
  }

  const totalActiveSeconds = timeLogs.reduce((acc, log) => acc + (log.total_active_seconds || 0), 0)
  const totalIdleSeconds = timeLogs.reduce((acc, log) => acc + (log.total_idle_seconds || 0), 0)

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="px-6">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/workers')}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition"
            >
              <span className="text-lg">←</span>
              <span className="font-medium">Back to Workers</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-2xl">▤</span>
              <span className="font-semibold text-neutral-900">Nexus Shift</span>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        {/* Worker Info Card */}
        <div className="bg-white border border-neutral-200 p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">{worker.name}</h1>
              <p className="text-neutral-600">{worker.email}</p>
              <p className="text-sm text-neutral-500 mt-1">
                Device ID: <code className="bg-neutral-100 border border-neutral-200 px-2 py-1">{worker.device_id}</code>
              </p>
            </div>
            <div className="text-right">
              <div className={`px-3 py-1 text-sm font-medium ${
                worker.is_active ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-600'
              }`}>
                {worker.is_active ? 'Active' : 'Inactive'}
              </div>
              <p className="text-sm text-neutral-500 mt-2">
                Registered: {new Date(worker.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-neutral-200">
            <div>
              <p className="text-sm text-neutral-600">Total Sessions</p>
              <p className="text-2xl font-bold text-neutral-900">{timeLogs.length}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Total Active Time</p>
              <p className="text-2xl font-bold text-neutral-900">
                {Math.floor(totalActiveSeconds / 3600)}h {Math.floor((totalActiveSeconds % 3600) / 60)}m
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Total Idle Time</p>
              <p className="text-2xl font-bold text-neutral-600">
                {Math.floor(totalIdleSeconds / 3600)}h {Math.floor((totalIdleSeconds % 3600) / 60)}m
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Screenshots */}
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Recent Screenshots</h2>
            <div className="space-y-3">
              {screenshots.length === 0 && (
                <p className="text-sm text-neutral-400">No screenshots yet.</p>
              )}
              {screenshots.map((screenshot) => (
                <div
                  key={screenshot.id}
                  className="relative bg-neutral-100 border border-neutral-200 aspect-video flex items-center justify-center overflow-hidden"
                >
                  {screenshot.label && (
                    <span className="absolute top-1 left-1 z-10 text-xs font-medium px-2 py-0.5 bg-neutral-900 text-white rounded">
                      {screenshot.label}
                    </span>
                  )}
                  {screenshot.url ? (
                    <img src={screenshot.url} alt="Screen capture" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span className="text-neutral-400 text-sm">
                      {new Date(screenshot.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Activity Timeline</h2>
            <div className="bg-white border border-neutral-200">
              <div className="divide-y divide-neutral-200">
                {activityLogs.map((log) => (
                  <div key={log.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-neutral-900">△</span>
                      <div className="flex-1">
                        <p className="text-sm text-neutral-500">{log.time}</p>
                        <p className="text-sm font-medium text-neutral-900">{log.details}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Time Logs */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Recent Sessions</h2>
          <div className="bg-white border border-neutral-200 overflow-hidden">
            {timeLogs.length === 0 ? (
              <div className="p-8 text-center text-neutral-600">No sessions recorded yet</div>
            ) : (
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Clock In</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Clock Out</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Active</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Idle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {timeLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 text-sm text-neutral-900">
                        {new Date(log.clock_in).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {log.clock_out ? new Date(log.clock_out).toLocaleString() : 'Active'}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-900 font-medium">
                        {Math.floor(log.total_active_seconds / 60)}m
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {Math.floor(log.total_idle_seconds / 60)}m
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default WorkerDetail
