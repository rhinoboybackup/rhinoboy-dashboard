import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { Files, Clock, Settings, Activity, MessageSquare, Wrench } from 'lucide-react'
import FileBrowser from './pages/FileBrowser'
import CronJobs from './pages/CronJobs'
import Sessions from './pages/Sessions'
import Tools from './pages/Tools'
import Status from './pages/Status'
import SettingsPage from './pages/Settings'

const NAV_ITEMS = [
  { to: '/', icon: Files, label: 'Files' },
  { to: '/cron', icon: Clock, label: 'Cron Jobs' },
  { to: '/sessions', icon: MessageSquare, label: 'Sessions' },
  { to: '/tools', icon: Wrench, label: 'Tools' },
  { to: '/status', icon: Activity, label: 'Status' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

function Sidebar() {
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
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="text-xs text-gray-400">
          <p>OpenClaw Gateway</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </aside>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
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
