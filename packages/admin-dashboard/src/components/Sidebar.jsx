import { NavLink } from 'react-router-dom'
import { useUserEmail } from '../lib/useUser'
import {
  Menu,
  LayoutDashboard,
  Users,
  TrendingUp,
  Camera,
  Zap,
  Clock,
  AlertTriangle,
  Settings,
  FileText,
  Download,
  Calendar,
  Layers,
  ChevronLeft
} from 'lucide-react'

// Icon mapping component
const Icon = ({ iconName, size = 20 }) => {
  const icons = {
    '≣': LayoutDashboard, // Dashboard
    '▦': LayoutDashboard, // Analytics (will use same icon)
    '▤': Users, // Workers
    '▴': TrendingUp, // Performance
    '◉': Camera, // Screenshots
    '⚡': Zap, // Activity Logs
    '⏱': Clock, // Timeline
    '△': AlertTriangle, // Alerts
    '⚙': Settings, // Settings
    '▨': FileText, // Reports
    '⬇': Download, // Export
  }

  const IconComponent = icons[iconName] || Menu

  return <IconComponent size={size} />
}

function Sidebar({ collapsed, navigationSections, currentView, onNavigate, onToggle, darkMode = false }) {
  const userEmail = useUserEmail()
  return (
    <aside
      className={`flex flex-col border-r transition-all duration-300 ${
        darkMode ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-neutral-200'
      } ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Header */}
      <div className={`p-4 ${darkMode ? 'border-neutral-700' : 'border-neutral-200'} border-b`}>
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex-1">
              <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>Nexus Shift</h1>
              <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Workforce Management</p>
            </div>
          )}
          <button
            onClick={onToggle}
            className={`p-2 hover:bg-neutral-100 transition ${
              darkMode
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            {collapsed ? (
              <Menu size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {navigationSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 px-3 ${
                darkMode ? 'text-neutral-500' : 'text-neutral-400'
              }`}>
                {section.title}
              </h3>
            )}

            {section.items.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id, item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all mb-1 ${
                  currentView === item.id
                    ? darkMode
                      ? 'bg-neutral-700 text-white'
                      : 'bg-neutral-900 text-white'
                    : darkMode
                      ? 'text-neutral-300 hover:bg-neutral-800'
                      : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Icon iconName={item.icon} size={18} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge > 0 && (
                      <span className="bg-neutral-900 text-white text-xs px-2 py-0.5">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* User Section */}
      <div className={`p-3 ${darkMode ? 'border-neutral-700' : 'border-neutral-200'} border-t`}>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className={`w-8 h-8 flex items-center justify-center ${
            darkMode ? 'bg-neutral-800' : 'bg-neutral-100'
          }`}>
            <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>A</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-neutral-900'}`}>{userEmail ? userEmail.split('@')[0] : 'Admin'}</p>
              <p className={`text-xs truncate ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>{userEmail || '—'}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
