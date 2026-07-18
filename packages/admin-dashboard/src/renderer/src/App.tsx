import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard.tsx'
import Workers from './pages/Workers.tsx'
import Alerts from './pages/Alerts.tsx'
import ShiftSchedules from './pages/ShiftSchedules.tsx'
import Settings from './pages/Settings.tsx'
import WorkerDetail from './pages/WorkerDetail.tsx'
import Analytics from './pages/Analytics.tsx'
import Performance from './pages/Performance.tsx'
import Departments from './pages/Departments.tsx'
import Screenshots from './pages/Screenshots.tsx'
import ActivityLogs from './pages/ActivityLogs.tsx'
import Timeline from './pages/Timeline.tsx'
import ShiftManagement from './pages/ShiftManagement.tsx'
import Reports from './pages/Reports.tsx'
import ExportData from './pages/ExportData.tsx'
import UserManagement from './pages/UserManagement.tsx'
import { initializeMockData } from './api'

function AppContent(): React.ReactElement {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false)
  const [currentView, setCurrentView] = useState<string>('dashboard')
  const [alertsCount, setAlertsCount] = useState<number>(3)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('darkMode')
    return stored !== null ? JSON.parse(stored) : true
  })
  const navigate = useNavigate()
  const location = useLocation()

  // Initialize mock data on mount
  useEffect(() => {
    initializeMockData()
  }, [])

  // Update current view based on location
  useEffect(() => {
    const path = location.pathname
    if (path === '/') setCurrentView('dashboard')
    else if (path === '/analytics') setCurrentView('analytics')
    else if (path === '/performance') setCurrentView('performance')
    else if (path.startsWith('/workers')) setCurrentView('workers')
    else if (path === '/alerts') setCurrentView('alerts')
    else if (path === '/schedules') setCurrentView('schedules')
    else if (path === '/settings') setCurrentView('settings')
    else if (path === '/departments') setCurrentView('departments')
    else if (path === '/screenshots') setCurrentView('screenshots')
    else if (path === '/activity') setCurrentView('activity')
    else if (path === '/timeline') setCurrentView('timeline')
    else if (path === '/shift-management') setCurrentView('shift-management')
    else if (path === '/reports') setCurrentView('reports')
    else if (path === '/export') setCurrentView('export')
    else if (path === '/users') setCurrentView('users')
  }, [location.pathname])

  // Persist dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const navigationSections = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', path: '/', icon: '≣' },
        { id: 'analytics', label: 'Analytics', path: '/analytics', icon: '▦' },
      ]
    },
    {
      title: 'Workforce',
      items: [
        { id: 'workers', label: 'Workers', path: '/workers', icon: '▤' },
        { id: 'performance', label: 'Performance', path: '/performance', icon: '▴' },
        { id: 'departments', label: 'Departments', path: '/departments', icon: '▦' },
      ]
    },
    {
      title: 'Monitoring',
      items: [
        { id: 'screenshots', label: 'Screenshots', path: '/screenshots', icon: '◉' },
        { id: 'activity', label: 'Activity Logs', path: '/activity', icon: '⚡' },
        { id: 'timeline', label: 'Timeline', path: '/timeline', icon: '⏱' },
      ]
    },
    {
      title: 'Alerts & Scheduling',
      items: [
        { id: 'alerts', label: 'Alerts', path: '/alerts', icon: '△', badge: alertsCount },
        { id: 'schedules', label: 'Shift Schedules', path: '/schedules', icon: '▦' },
        { id: 'shift-management', label: 'Shift Management', path: '/shift-management', icon: '◉' },
      ]
    },
    {
      title: 'Administration',
      items: [
        { id: 'reports', label: 'Reports', path: '/reports', icon: '▨' },
        { id: 'export', label: 'Export Data', path: '/export', icon: '⬇' },
        { id: 'settings', label: 'Settings', path: '/settings', icon: '⚙' },
        { id: 'users', label: 'User Management', path: '/users', icon: '▤' },
      ]
    },
  ]

  const handleNavigation = (viewId: string, path: string) => {
    setCurrentView(viewId)
    navigate(path)
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900'}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        navigationSections={navigationSections}
        currentView={currentView}
        onNavigate={handleNavigation}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        darkMode={darkMode}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          alertsCount={alertsCount}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />
        <main className={`flex-1 overflow-y-auto ${darkMode ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/workers" element={<Workers />} />
            <Route path="/workers/:workerId" element={<WorkerDetail />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/screenshots" element={<Screenshots />} />
            <Route path="/activity" element={<ActivityLogs />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/schedules" element={<ShiftSchedules />} />
            <Route path="/shift-management" element={<ShiftManagement />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/export" element={<ExportData />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: darkMode ? '#262626' : '#ffffff',
            color: darkMode ? '#ffffff' : '#000000',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </div>
  )
}

function App(): React.ReactElement {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
