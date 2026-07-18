import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Users, Clock, AlertTriangle } from 'lucide-react'
import { exportToCSV, generateFilename, exportFormatters } from '../utils/export'
import { getWorkers, getAlerts } from '../api'
import { useT } from '../lib/i18n'

function Dashboard() {
  const navigate = useNavigate()
  const t = useT()
  const [stats, setStats] = useState({
    totalWorkers: 0,
    activeWorkers: 0,
    idleWorkers: 0,
    alertsToday: 0,
  })
  const [workers, setWorkers] = useState([])
  const [alerts, setAlerts] = useState([])

  // Load data on mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [workersRes, alertsRes] = await Promise.all([
        getWorkers(),
        getAlerts()
      ])

      if (workersRes.success && workersRes.data) {
        setWorkers(workersRes.data)
        setStats(prev => ({
          ...prev,
          totalWorkers: workersRes.data.length,
          activeWorkers: workersRes.data.filter(w => w.status === 'online').length,
          idleWorkers: workersRes.data.filter(w => w.status === 'idle').length
        }))
      }

      if (alertsRes.success && alertsRes.data) {
        const activeAlerts = alertsRes.data.filter(a => a.status === 'active' || a.status === undefined)
        setAlerts(activeAlerts.slice(0, 3))
        setStats(prev => ({ ...prev, alertsToday: activeAlerts.length }))
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-neutral-900 dark:text-white'
      case 'idle': return 'text-neutral-600 dark:text-neutral-300'
      case 'alert': return 'text-neutral-400 dark:text-neutral-500'
      case 'offline': return 'text-neutral-300 dark:text-neutral-600'
      default: return 'text-neutral-300 dark:text-neutral-600'
    }
  }

  const getStatusBg = (status) => {
    switch (status) {
      case 'online': return 'bg-neutral-100 dark:bg-neutral-800'
      case 'idle': return 'bg-neutral-200 dark:bg-neutral-700'
      case 'alert': return 'bg-neutral-300 dark:bg-neutral-600'
      case 'offline': return 'bg-neutral-50 dark:bg-neutral-900'
      default: return 'bg-neutral-50 dark:bg-neutral-900'
    }
  }

  const handleExport = async () => {
    try {
      toast.loading(t('toast.preparingExport'), { id: 'export' })
      const formattedWorkers = workers.map(exportFormatters.workers)
      const result = exportToCSV(formattedWorkers, generateFilename('workers', 'csv'))

      if (result.success) {
        toast.success(t('toast.exportSuccess'), { id: 'export' })
      } else {
        toast.error(t('toast.exportFail'), { id: 'export' })
      }
    } catch (error) {
      toast.error(t('toast.exportFail'), { id: 'export' })
      console.error('Export error:', error)
    }
  }

  return (
    <div className="p-6 space-y-6 bg-neutral-50 dark:bg-neutral-800">
      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 dark:text-neutral-400 text-sm">{t('dash.totalWorkers')}</span>
            <Users className="w-8 h-8 text-neutral-500 dark:text-neutral-400" />
          </div>
          <div className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.totalWorkers}</div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 dark:text-neutral-400 text-sm">{t('dash.currentlyActive')}</span>
            <div className="w-8 h-8 flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full pulse-live"></div>
            </div>
          </div>
          <div className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.activeWorkers}</div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 dark:text-neutral-400 text-sm">{t('dash.totalIdle')}</span>
            <Clock className="w-8 h-8 text-neutral-500 dark:text-neutral-400" />
          </div>
          <div className="text-3xl font-bold text-neutral-600 dark:text-neutral-300">{stats.idleWorkers}</div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 dark:text-neutral-400 text-sm">{t('dash.alertsToday')}</span>
            <AlertTriangle className="w-8 h-8 text-neutral-500 dark:text-neutral-400" />
          </div>
          <div className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.alertsToday}</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Workers Grid */}
        <div className="col-span-2">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{t('dash.liveStatus')}</h2>
              <button onClick={handleExport} className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition">
                {t('common.exportArrow')}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {workers.map((worker) => (
                <div
                  key={worker.id}
                  className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-600 transition cursor-pointer"
                  onClick={() => navigate(`/workers/${worker.id}`)}
                >
                  {/* Worker Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">{worker.name}</h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{worker.department}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium ${getStatusBg(worker.status)} ${getStatusColor(worker.status)}`}>
                      {t('status.' + worker.status)}
                    </span>
                  </div>

                  {/* Thumbnail */}
                  <div className="bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 aspect-video mb-3 flex items-center justify-center">
                    <span className="text-neutral-400 dark:text-neutral-500 text-sm">{t('dash.latestScreenshot')}</span>
                  </div>

                  {/* Shift Progress */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-neutral-500 dark:text-neutral-400">{t('dash.shiftProgress')}</span>
                      <span className="text-neutral-600 dark:text-neutral-300">{worker.shiftProgress}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-1.5">
                      <div
                        className={`h-1.5 transition-all ${
                          worker.status === 'online' ? 'bg-neutral-900 dark:bg-white' : worker.status === 'alert' ? 'bg-neutral-600 dark:bg-neutral-500' : 'bg-neutral-400 dark:bg-neutral-600'
                        }`}
                        style={{ width: `${worker.shiftProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Last Active */}
                  <div className="text-xs text-neutral-400 dark:text-neutral-500">
                    {t('dash.lastActive')} {worker.lastActive}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts Feed */}
        <div>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{t('dash.recentAlerts')}</h2>
              <button onClick={() => navigate('/alerts')} className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition">
                {t('common.viewAll')}
              </button>
            </div>

            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-3 hover:border-neutral-400 dark:hover:border-neutral-600 transition cursor-pointer"
                  onClick={() => navigate('/alerts')}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-neutral-900 dark:text-white flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">{alert.worker}</p>
                        <span className="text-xs text-neutral-400 dark:text-neutral-500">{alert.time}</span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{alert.type}</p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">{alert.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => navigate('/alerts')} className="w-full mt-4 py-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
              {t('dash.viewAllAlerts')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
