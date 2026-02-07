import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { Files, Clock, Settings, Activity, MessageSquare, Wrench, LogOut } from 'lucide-react'
import FileBrowser from './pages/FileBrowser'
import CronJobs from './pages/CronJobs'
import Sessions from './pages/Sessions'
import Tools from './pages/Tools'
import Status from './pages/Status'
import SettingsPage from './pages/Settings'
import { useAuth } from './useAuth'
import { signInWithGoogle, logOut } from './firebase'
import { useState } from 'react'

const NAV_ITEMS = [
  { to: '/', icon: Files, label: 'Files' },
  { to: '/cron', icon: Clock, label: 'Cron Jobs' },
  { to: '/sessions', icon: MessageSquare, label: 'Sessions' },
  { to: '/tools', icon: Wrench, label: 'Tools' },
  { to: '/status', icon: Activity, label: 'Status' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

function LoginScreen() {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/logo.png" 
            alt="RhinoBoy" 
            className="w-20 h-20 mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-semibold text-gray-900">RhinoBoy</h1>
          <p className="text-gray-500 mt-1">Dashboard</p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 text-center">
              {error}
            </div>
          )}

          <p className="mt-4 text-xs text-gray-400 text-center">
            Restricted access — authorized users only
          </p>
        </div>
      </div>
    </div>
  )
}

function Sidebar({ user }) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="RhinoBoy" 
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="font-semibold text-gray-900">RhinoBoy</h1>
            <p className="text-xs text-gray-500">Dashboard</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* User / Logout */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
              ME
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.displayName || 'User'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logOut}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <img src="/logo.png" alt="RhinoBoy" className="w-16 h-16 mx-auto mb-4 object-contain animate-pulse" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen />
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50">
        <Sidebar user={user} />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<FileBrowser />} />
            <Route path="/cron" element={<CronJobs />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/status" element={<Status />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
