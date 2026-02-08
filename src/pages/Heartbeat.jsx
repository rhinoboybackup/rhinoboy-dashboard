import { useState, useEffect } from 'react'
import { 
  Heart, RefreshCw, CheckCircle, XCircle, Clock, 
  GitCommit, Activity, TrendingUp, AlertCircle, Terminal
} from 'lucide-react'

export default function Heartbeat() {
  const [heartbeatContent, setHeartbeatContent] = useState('')
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [lastRun, setLastRun] = useState(null)

  useEffect(() => {
    fetchHeartbeatData()
    const interval = setInterval(fetchHeartbeatData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchHeartbeatData = async () => {
    try {
      setLoading(true)
      
      // Fetch HEARTBEAT.md content
      const contentRes = await fetch('/api/files/read?path=/HEARTBEAT.md')
      if (contentRes.ok) {
        const data = await contentRes.json()
        setHeartbeatContent(data.content || '')
      }
      
      // Fetch heartbeat logs
      const logsRes = await fetch('/api/heartbeat/logs')
      if (logsRes.ok) {
        const data = await logsRes.json()
        setLogs(data.logs || [])
        setLastRun(data.lastRun)
      }
      
      // Fetch heartbeat stats
      const statsRes = await fetch('/api/heartbeat/stats')
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to fetch heartbeat data:', err)
    } finally {
      setLoading(false)
    }
  }

  const runHeartbeat = async () => {
    try {
      setRunning(true)
      const response = await fetch('/api/heartbeat/run', { method: 'POST' })
      if (!response.ok) throw new Error('Heartbeat run failed')
      
      // Wait a moment then refresh data
      setTimeout(fetchHeartbeatData, 2000)
    } catch (err) {
      console.error('Failed to run heartbeat:', err)
    } finally {
      setRunning(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="glass-strong rounded-2xl p-6 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl text-white shadow-lg">
              <Heart size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Heartbeat</h1>
              <p className="text-sm text-gray-500 mt-0.5">Periodic health checks and maintenance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchHeartbeatData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/50 hover:bg-white/80 text-gray-700 rounded-xl border border-gray-200/50 transition-all min-h-[44px] disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={runHeartbeat}
              disabled={running}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900/90 hover:bg-gray-800 text-white rounded-xl transition-all min-h-[44px] disabled:opacity-50"
            >
              <Activity size={16} className={running ? 'animate-pulse' : ''} />
              {running ? 'Running...' : 'Run Now'}
            </button>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white/50 rounded-xl border border-gray-200/50">
            <div className="text-2xl font-bold text-gray-900">
              {lastRun ? new Date(lastRun).toLocaleTimeString() : '--:--'}
            </div>
            <div className="text-sm text-gray-500 mt-1">Last Run</div>
          </div>
          <div className="p-4 bg-white/50 rounded-xl border border-gray-200/50">
            <div className="text-2xl font-bold text-green-600">
              {stats?.successCount || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">Successful</div>
          </div>
          <div className="p-4 bg-white/50 rounded-xl border border-gray-200/50">
            <div className="text-2xl font-bold text-red-600">
              {stats?.errorCount || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">Errors</div>
          </div>
          <div className="p-4 bg-white/50 rounded-xl border border-gray-200/50">
            <div className="text-2xl font-bold text-blue-600">
              {stats?.avgDuration ? `${stats.avgDuration}s` : '--'}
            </div>
            <div className="text-sm text-gray-500 mt-1">Avg Duration</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* HEARTBEAT.md Content */}
        <div className="glass rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Terminal size={18} />
              HEARTBEAT.md
            </h3>
            <button
              onClick={() => window.location.href = '/#/?path=/HEARTBEAT.md'}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Edit
            </button>
          </div>
          
          {heartbeatContent ? (
            <div className="flex-1 overflow-auto">
              <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap bg-gray-50/50 p-4 rounded-xl border border-gray-200/50">
                {heartbeatContent}
              </pre>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No HEARTBEAT.md file found</p>
                <button
                  onClick={() => window.location.href = '/#/?path=/'}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                >
                  Create File
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Heartbeat Logs */}
        <div className="glass rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Activity size={18} />
              Recent Activity
            </h3>
            <span className="text-xs text-gray-500">
              {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
          
          <div className="flex-1 overflow-auto space-y-3">
            {logs.length > 0 ? (
              logs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white/50 rounded-xl border border-gray-200/50 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(log.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {log.action || 'Heartbeat Check'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {log.message && (
                        <p className="text-xs text-gray-600 mb-2">{log.message}</p>
                      )}
                      {log.changes && log.changes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {log.changes.map((change, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded"
                            >
                              <GitCommit size={12} />
                              {change}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center text-center py-12">
                <div>
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No recent activity</p>
                  <button
                    onClick={runHeartbeat}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Run Heartbeat Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
