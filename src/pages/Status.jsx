import { useState, useEffect } from 'react'
import { Activity, Cpu, HardDrive, Clock, Zap, RefreshCw, CheckCircle, XCircle, Server, MessageSquare, Database } from 'lucide-react'

function StatusCard({ icon: Icon, title, value, subtitle, status }) {
  return (
    <div className="glass rounded-2xl p-5 md:p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${
            status === 'good' ? 'bg-green-100/80' :
            status === 'warning' ? 'bg-yellow-100/80' :
            status === 'error' ? 'bg-red-100/80' : 'bg-gray-100/80'
          }`}>
            <Icon size={20} className={
              status === 'good' ? 'text-green-600' :
              status === 'warning' ? 'text-yellow-600' :
              status === 'error' ? 'text-red-600' : 'text-gray-600'
            } />
          </div>
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-xl font-semibold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
        </div>
        {status && (
          <div className={`w-2 h-2 rounded-full ${
            status === 'good' ? 'bg-green-500' :
            status === 'warning' ? 'bg-yellow-500' :
            status === 'error' ? 'bg-red-500' : 'bg-gray-300'
          }`} />
        )}
      </div>
    </div>
  )
}

function Status() {
  const [statusText, setStatusText] = useState('')
  const [sessionData, setSessionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [services, setServices] = useState({
    gateway: { status: 'checking', name: 'OpenClaw Gateway' },
    api: { status: 'checking', name: 'Dashboard API' },
    files: { status: 'checking', name: 'File System' }
  })

  const fetchStatus = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const apiCheck = await fetch('/api/status')
      if (apiCheck.ok) {
        setServices(s => ({ ...s, api: { ...s.api, status: 'healthy' } }))
      }
      
      const statusRes = await fetch('/api/gateway/tools/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'session_status', input: {} })
      })
      
      if (statusRes.ok) {
        const data = await statusRes.json()
        const text = data?.statusText || data?.details?.statusText || data?.result?.details?.statusText || ''
        setStatusText(text)
        setServices(s => ({ ...s, gateway: { ...s.gateway, status: 'healthy' } }))
      } else {
        throw new Error('Gateway not responding')
      }
      
      const sessionsRes = await fetch('/api/gateway/tools/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'sessions_list', input: { limit: 1, messageLimit: 0 } })
      })
      
      if (sessionsRes.ok) {
        const sessData = await sessionsRes.json()
        const mainSession = sessData?.sessions?.[0] || sessData?.result?.details?.sessions?.[0]
        if (mainSession) setSessionData(mainSession)
      }
      
      const filesRes = await fetch('/api/files?path=')
      if (filesRes.ok) {
        setServices(s => ({ ...s, files: { ...s.files, status: 'healthy' } }))
      }
    } catch (err) {
      setError(err.message)
      setServices(s => ({ ...s, gateway: { ...s.gateway, status: 'unhealthy' } }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const parseStatusText = (text) => {
    const lines = text.split('\n')
    const info = {}
    for (const line of lines) {
      if (line.includes('OpenClaw')) {
        const match = line.match(/OpenClaw\s+([\d.]+(?:-\d+)?)\s*\(([^)]+)\)/)
        if (match) { info.version = match[1]; info.commit = match[2] }
      }
      if (line.includes('Time:')) info.time = line.split('Time:')[1]?.trim()
      if (line.includes('Model:')) { const m = line.match(/Model:\s*([^\s·]+)/); if (m) info.model = m[1] }
      if (line.includes('Tokens:')) {
        const m = line.match(/(\d+)\s*in\s*\/\s*(\d+)\s*out/)
        if (m) { info.tokensIn = parseInt(m[1]); info.tokensOut = parseInt(m[2]) }
      }
      if (line.includes('Context:')) {
        const m = line.match(/(\d+)k\/(\d+)k\s*\((\d+)%\)/)
        if (m) { info.contextUsed = parseInt(m[1]) * 1000; info.contextMax = parseInt(m[2]) * 1000; info.contextPercent = parseInt(m[3]) }
      }
      if (line.includes('Session:')) { const m = line.match(/Session:\s*([^\s•]+)/); if (m) info.session = m[1] }
      if (line.includes('Runtime:')) info.runtime = line.split('Runtime:')[1]?.trim()
    }
    return info
  }

  const parsedStatus = parseStatusText(statusText)

  const formatTokens = (num) => {
    if (!num) return '—'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toString()
  }

  const formatTime = (ts) => {
    if (!ts) return '—'
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">System Status</h1>
          <p className="text-gray-500 text-sm mt-1">
            {parsedStatus.version ? `OpenClaw ${parsedStatus.version}` : 'OpenClaw Gateway'}
            {parsedStatus.commit && <span className="text-gray-400"> ({parsedStatus.commit})</span>}
          </p>
        </div>
        <button
          onClick={fetchStatus}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white/50 rounded-xl transition-colors min-h-[44px]"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50/80 text-red-700 rounded-2xl flex items-center gap-3 border border-red-100/50">
          <XCircle size={20} />
          <div>
            <p className="font-medium">Connection Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <StatusCard icon={Activity} title="Gateway Status" value={services.gateway.status === 'healthy' ? 'Running' : 'Error'} status={services.gateway.status === 'healthy' ? 'good' : 'error'} />
        <StatusCard icon={Cpu} title="Model" value={sessionData?.model || parsedStatus.model || 'Unknown'} status="good" />
        <StatusCard icon={Database} title="Context Used" value={parsedStatus.contextPercent ? `${parsedStatus.contextPercent}%` : '—'} subtitle={parsedStatus.contextUsed ? `${formatTokens(parsedStatus.contextUsed)} / ${formatTokens(parsedStatus.contextMax)}` : undefined} status={parsedStatus.contextPercent > 90 ? 'warning' : 'good'} />
        <StatusCard icon={Zap} title="Total Tokens" value={formatTokens(sessionData?.totalTokens)} subtitle={sessionData?.updatedAt ? `Updated ${formatTime(sessionData.updatedAt)}` : undefined} status="good" />
      </div>

      {statusText && (
        <div className="glass rounded-2xl overflow-hidden mb-6">
          <div className="px-5 md:px-6 py-4 border-b border-white/20 flex items-center gap-2">
            <Server size={18} className="text-gray-400" />
            <h2 className="font-semibold text-gray-900">Live Status</h2>
          </div>
          <div className="p-4 md:p-6">
            <pre className="text-sm text-gray-700 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {statusText}
            </pre>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden mb-6">
        <div className="px-5 md:px-6 py-4 border-b border-white/20">
          <h2 className="font-semibold text-gray-900">Service Health</h2>
        </div>
        <div className="divide-y divide-white/20">
          {Object.values(services).map((service) => (
            <div key={service.name} className="px-5 md:px-6 py-4 flex items-center justify-between min-h-[52px]">
              <span className="text-sm text-gray-700">{service.name}</span>
              <div className="flex items-center gap-2">
                {service.status === 'healthy' ? (
                  <><CheckCircle size={16} className="text-green-500" /><span className="text-sm text-green-600">Healthy</span></>
                ) : service.status === 'checking' ? (
                  <><RefreshCw size={16} className="text-gray-400 animate-spin" /><span className="text-sm text-gray-500">Checking...</span></>
                ) : (
                  <><XCircle size={16} className="text-red-500" /><span className="text-sm text-red-600">Unhealthy</span></>
                )}
              </div>
            </div>
          ))}
          {sessionData?.channel && (
            <div className="px-5 md:px-6 py-4 flex items-center justify-between min-h-[52px]">
              <span className="text-sm text-gray-700">Active Channel</span>
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-500" />
                <span className="text-sm text-blue-600 capitalize">{sessionData.channel}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {sessionData && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-5 md:px-6 py-4 border-b border-white/20">
            <h2 className="font-semibold text-gray-900">Session Info</h2>
          </div>
          <div className="p-4 md:p-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {[
                ['Session Key', sessionData.key || parsedStatus.session],
                ['Model', sessionData.model],
                ['Channel', sessionData.channel],
                ['Context Limit', formatTokens(sessionData.contextTokens)],
                ['Total Tokens', formatTokens(sessionData.totalTokens)],
                ['Last Updated', sessionData.updatedAt ? new Date(sessionData.updatedAt).toLocaleString() : '—'],
              ].filter(([,v]) => v).map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-white/20">
                  <dt className="text-sm text-gray-500">{label}</dt>
                  <dd className="text-sm font-medium text-gray-900 text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  )
}

export default Status
