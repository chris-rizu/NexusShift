import { Bell, Sun, Moon, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  onToggleSidebar?: () => void
  alertsCount?: number
  darkMode?: boolean
  onToggleDarkMode?: () => void
}

function Header({
  onToggleSidebar,
  alertsCount = 0,
  darkMode = false,
  onToggleDarkMode
}: HeaderProps) {
  const navigate = useNavigate()

  return (
    <header className={`border-b px-6 py-4 ${
      darkMode ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-neutral-200'
    }`}>
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className={`p-2 hover:bg-neutral-100 transition ${
              darkMode ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span className="text-lg">≡</span>
          </button>

          <div className="relative">
            <input
              type="text"
              placeholder="Search workers, alerts, schedules..."
              className={`w-80 border px-4 py-2 pl-10 text-sm focus:outline-none ${
                darkMode
                  ? 'bg-neutral-800 border-neutral-600 text-neutral-100 placeholder-neutral-500 focus:border-neutral-500'
                  : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-neutral-900'
              }`}
            />
            <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              darkMode ? 'text-neutral-500' : 'text-neutral-400'
            }`} />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Alerts Badge */}
          <button
            onClick={() => navigate('/alerts')}
            className={`relative p-2 hover:bg-neutral-100 transition ${
              darkMode ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Bell className="w-5 h-5" />
            {alertsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {/* Light/Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className={`flex items-center gap-2 px-3 py-2 hover:bg-neutral-100 transition rounded-lg ${
              darkMode ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            {darkMode ? (
              <>
                <Sun className="w-5 h-5" />
                <span className="text-sm">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5" />
                <span className="text-sm">Dark</span>
              </>
            )}
          </button>

          {/* User Profile */}
          <div className={`flex items-center gap-3 pl-3 border-l ${
            darkMode ? 'border-neutral-700' : 'border-neutral-200'
          }`}>
            <div className="text-right">
              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                Admin User
              </p>
              <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Administrator
              </p>
            </div>
            <div className={`w-8 h-8 flex items-center justify-center ${
              darkMode ? 'bg-neutral-700' : 'bg-neutral-900'
            }`}>
              <span className="text-white text-xs font-medium">A</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
