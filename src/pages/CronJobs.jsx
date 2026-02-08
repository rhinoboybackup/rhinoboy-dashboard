import { useState, useEffect } from 'react'
import { Clock, Play, Pause, Trash2, Plus, RefreshCw, Check, X } from 'lucide-react'

function CronJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/tools/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'cron', args: { action: 'list', includeDisabled: true } })
      })
      if (!response.ok) throw new Error('Failed to fetch jobs')
      const data = await response.json()
      setJobs(data.jobs || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJobs() }, [])

  const runJob = async (jobId) => {
    try {
      await fetch('/api/tools/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'cron', args: { action: 'run', jobId } })
      })
      fetchJobs()
    } catch (err) { setError(err.message) }
  }

  const toggleJob = async (jobId, enabled) => {
    try {
      await fetch('/api/tools/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'cron', args: { action: 'update', jobId, patch: { enabled: !enabled } } })
      })
      fetchJobs()
    } catch (err) { setError(err.message) }
  }

  const deleteJob = async (jobId) => {
    if (!confirm('Delete this cron job?')) return
    try {
      await fetch('/api/tools/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'cron', args: { action: 'remove', jobId } })
      })
      fetchJobs()
    } catch (err) { setError(err.message) }
  }

  const formatSchedule = (schedule) => {
    if (!schedule) return '—'
    if (schedule.kind === 'cron') return schedule.expr
    if (schedule.kind === 'every') return `Every ${Math.round(schedule.everyMs / 60000)}m`
    if (schedule.kind === 'at') return `At ${new Date(schedule.at).toLocaleString()}`
    return JSON.stringify(schedule)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Cron Jobs</h1>
          <p className="text-gray-500 text-sm mt-1">Scheduled tasks and automations</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchJobs}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white/50 rounded-xl transition-colors min-h-[44px]"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-900/90 text-white rounded-xl hover:bg-gray-800 transition-colors min-h-[44px]">
            <Plus size={16} />
            <span className="hidden sm:inline">New Job</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50/80 text-red-700 rounded-2xl border border-red-100/50">{error}</div>
      )}

      {/* Mobile: Card layout */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="animate-spin text-gray-400" size={24} />
          </div>
        ) : jobs.length === 0 ? (
          <div className="glass rounded-2xl flex flex-col items-center justify-center h-48 text-gray-400">
            <Clock size={48} className="mb-4 opacity-50" />
            <p>No cron jobs configured</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id || job.jobId} className="glass rounded-2xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{job.name || 'Unnamed'}</div>
                  <div className="text-xs text-gray-500 truncate mt-1">
                    {job.payload?.text || job.payload?.message || '—'}
                  </div>
                </div>
                <button
                  onClick={() => toggleJob(job.id || job.jobId, job.enabled)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                    job.enabled ? 'bg-green-100/80 text-green-700' : 'bg-gray-100/80 text-gray-500'
                  }`}
                >
                  {job.enabled ? <Check size={12} /> : <X size={12} />}
                  {job.enabled ? 'Active' : 'Off'}
                </button>
              </div>
              <div className="text-sm text-gray-600 font-mono mb-3">{formatSchedule(job.schedule)}</div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Last: {job.lastRun ? new Date(job.lastRun).toLocaleDateString() : '—'}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => runJob(job.id || job.jobId)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <Play size={16} />
                  </button>
                  <button
                    onClick={() => deleteJob(job.id || job.jobId)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden md:block glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="animate-spin text-gray-400" size={24} />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Clock size={48} className="mb-4 opacity-50" />
            <p>No cron jobs configured</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-white/30 border-b border-white/20">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Run</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Run</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {jobs.map((job) => (
                <tr key={job.id || job.jobId} className="hover:bg-white/30">
                  <td className="px-4 py-4">
                    <button
                      onClick={() => toggleJob(job.id || job.jobId, job.enabled)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                        job.enabled ? 'bg-green-100/80 text-green-700' : 'bg-gray-100/80 text-gray-500'
                      }`}
                    >
                      {job.enabled ? <Check size={12} /> : <X size={12} />}
                      {job.enabled ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900">{job.name || 'Unnamed'}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{job.payload?.text || job.payload?.message || '—'}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 font-mono">{formatSchedule(job.schedule)}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{job.lastRun ? new Date(job.lastRun).toLocaleString() : '—'}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{job.nextRun ? new Date(job.nextRun).toLocaleString() : '—'}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => runJob(job.id || job.jobId)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" title="Run now">
                        <Play size={16} />
                      </button>
                      <button onClick={() => deleteJob(job.id || job.jobId)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default CronJobs
