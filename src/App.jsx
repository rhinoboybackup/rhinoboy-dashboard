import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { Files, Clock, Settings, Activity, MessageSquare, Wrench, LogOut, Menu, X } from 'lucide-react'
import FileBrowser from './pages/FileBrowser'
import CronJobs from './pages/CronJobs'
import Sessions from './pages/Sessions'
import Tools from './pages/Tools'
import Status from './pages/Status'
import SettingsPage from './pages/Settings'
import { useAuth } from './useAuth'
import { signInWithGoogle, logOut } from './firebase'
import { useState, useEffect } from 'react'

const NAV_ITEMS = [
  { to: '/', icon: Files, label: 'Files' },
  { to: '/cron', icon: Clock, label: 'Cron' },
  { to: '/sessions', icon: MessageSquare, label: 'Chat' },
  { to: '/tools', icon: Wrench, label: 'Tools' },
  { to: '/status', icon: Activity, label: 'Status' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

// Bottom 5 items for mobile nav (skip settings, access via status page or swipe)
const MOBILE_NAV = NAV_ITEMS.slice(0, 5)

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
    <div className="min-h-screen flex items-center justify-center p-4 safe-top safe-bottom">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <img 
            src="/logo.png" 
            alt="RhinoBoy" 
            className="w-24 h-24 mx-auto mb-6 object-contain drop-shadow-2xl"
          />
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">RhinoBoy</h1>
          <p className="text-gray-500 mt-2 text-sm">Dashboard</p>
        </div>

        <div className="glass rounded-3xl p-8 shadow-2xl">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gray-900/90 text-white font-medium rounded-xl hover:bg-gray-800 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all shadow-lg min-h-[52px]"
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
            <div className="mt-4 p-3 bg-red-50/80 text-red-700 text-sm rounded-xl border border-red-100/50 text-center">
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

function DesktopSidebar({ user }) {
  return (
    <aside className="hidden lg:flex w-64 glass-strong rounded-2xl m-3 flex-col flex-shrink-0">
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="RhinoBoy" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="font-semibold text-gray-900">RhinoBoy</h1>
            <p className="text-xs text-gray-500">Dashboard</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gray-900/10 text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
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
      
      <div className="p-4 border-t border-white/20">
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
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}

function TabletSidebar({ user }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <aside 
      className={`hidden md:flex lg:hidden flex-col glass-strong m-3 rounded-2xl flex-shrink-0 transition-all duration-300 ${
        expanded ? 'w-64' : 'w-[64px]'
      }`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="p-3 border-b border-white/20 flex items-center justify-center">
        <img src="/logo.png" alt="RhinoBoy" className="w-9 h-9 object-contain" />
        {expanded && (
          <div className="ml-3 overflow-hidden">
            <h1 className="font-semibold text-gray-900 text-sm whitespace-nowrap">RhinoBoy</h1>
          </div>
        )}
      </div>
      
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                    isActive
                      ? 'bg-gray-900/10 text-gray-900'
                      : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                  } ${expanded ? '' : 'justify-center'}`
                }
              >
                <Icon size={20} />
                {expanded && <span className="whitespace-nowrap">{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-2 border-t border-white/20">
        <button
          onClick={logOut}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-white/50 hover:text-gray-700 transition-colors min-h-[44px] ${expanded ? '' : 'justify-center'}`}
          title="Sign out"
        >
          <LogOut size={18} />
          {expanded && <span className="whitespace-nowrap">Sign out</span>}
        </button>
      </div>
    </aside>
  )
}

function MobileBottomNav() {
  const location = useLocation()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong safe-bottom border-t border-white/30">
      <div className="flex items-center justify-around px-2 py-1">
        {MOBILE_NAV.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 rounded-xl transition-all ${
                isActive 
                  ? 'text-gray-900' 
                  : 'text-gray-400'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              {isActive && (
                <span className="text-[10px] font-semibold mt-0.5">{label}</span>
              )}
            </NavLink>
          )
        })}
        {/* Settings in mobile nav */}
        <NavLink
          to="/settings"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 rounded-xl transition-all ${
            location.pathname === '/settings' ? 'text-gray-900' : 'text-gray-400'
          }`}
        >
          <Settings size={22} strokeWidth={location.pathname === '/settings' ? 2.5 : 1.5} />
          {location.pathname === '/settings' && (
            <span className="text-[10px] font-semibold mt-0.5">Settings</span>
          )}
        </NavLink>
      </div>
    </nav>
  )
}

const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

function App() {
  const { user, loading } = useAuth()
  const authenticated = IS_LOCAL || !!user

  if (!IS_LOCAL && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <img src="/logo.png" alt="RhinoBoy" className="w-16 h-16 mx-auto mb-4 object-contain animate-pulse" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return <LoginScreen />
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen">
        <DesktopSidebar user={user} />
        <TabletSidebar user={user} />
        <main className="flex-1 overflow-auto pb-20 md:pb-0 md:m-3 md:ml-0">
          <div className="h-full">
            <Routes>
              <Route path="/" element={<FileBrowser />} />
              <Route path="/cron" element={<CronJobs />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/status" element={<Status />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </main>
        <MobileBottomNav />
      </div>
    </BrowserRouter>
  )
}

export default App
