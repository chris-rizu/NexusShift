import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Workers from './pages/Workers'
import Alerts from './pages/Alerts'
import ShiftSchedules from './pages/ShiftSchedules'
import Settings from './pages/Settings'
import WorkerDetail from './pages/WorkerDetail'
import Analytics from './pages/Analytics'
import Performance from './pages/Performance'
import Departments from './pages/Departments'
import Screenshots from './pages/Screenshots'
import ActivityLogs from './pages/ActivityLogs'
import Timeline from './pages/Timeline'
import ShiftManagement from './pages/ShiftManagement'
import Reports from './pages/Reports'
import ExportData from './pages/ExportData'
import UserManagement from './pages/UserManagement'
import Login from './pages/Login'
import { supabase } from './lib/supabase'

function AppContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentView, setCurrentView] = useState('dashboard')
  const [alertsCount, setAlertsCount] = useState(0)
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize dark mode from localStorage or default to true
    const stored = localStorage.getItem('darkMode')
    return stored !== null ? JSON.parse(stored) : true
  })
  const navigate = useNavigate()
  const location = useLocation()

  // Persist dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

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

  const handleNavigation = (viewId, path) => {
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

function App() {
  const [session, setSession] = useState(undefined) // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-neutral-400">Loading…</div>
  }

  if (!session) {
    return <Login />
  }

  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
