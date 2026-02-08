import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Save, RefreshCw, Key, Globe, Bell, Shield, Eye, EyeOff, Check, X, Plus, Trash2, Copy, Pencil } from 'lucide-react'

function KeyRow({ name, data, onUpdate, onDelete }) {
  const [visible, setVisible] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(data.api_key || data.api_token || '')
  const [editNotes, setEditNotes] = useState(data.notes || '')
  const [copied, setCopied] = useState(false)

  const keyValue = data.api_key || data.api_token || ''
  const keyField = data.api_key ? 'api_key' : 'api_token'

  const obfuscate = (val) => {
    if (!val || val.length < 8) return '••••••••'
    return val.slice(0, 4) + '•'.repeat(Math.min(val.length - 8, 24)) + val.slice(-4)
  }

  const handleSave = () => { onUpdate(name, { ...data, [keyField]: editValue, notes: editNotes }); setEditing(false) }
  const handleCancel = () => { setEditValue(keyValue); setEditNotes(data.notes || ''); setEditing(false) }
  const handleCopy = async () => { await navigator.clipboard.writeText(keyValue); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  return (
    <div className="group">
      <div className="flex items-start gap-4 py-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-gray-900 capitalize">{name}</h3>
            {data.added && <span className="text-xs text-gray-400">Added {data.added}</span>}
          </div>
          
          {editing ? (
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">API Key</label>
                <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-full px-3 py-3 text-[16px] font-mono bg-white border border-gray-300 rounded-xl focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none" autoFocus />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                <input type="text" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="w-full px-3 py-3 text-[16px] bg-white border border-gray-300 rounded-xl focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 min-h-[44px]"><Check size={14} />Save</button>
                <button onClick={handleCancel} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100/80 rounded-xl hover:bg-gray-200 min-h-[44px]"><X size={14} />Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                <code className="text-sm font-mono text-gray-600 bg-white/50 px-2 py-1 rounded">{visible ? keyValue : obfuscate(keyValue)}</code>
                <button onClick={() => setVisible(!visible)} className="p-2 text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center">{visible ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                <button onClick={handleCopy} className="p-2 text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center">{copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}</button>
              </div>
              {data.notes && <p className="mt-1 text-xs text-gray-400">{data.notes}</p>}
            </>
          )}
        </div>

        {!editing && (
          <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <button onClick={() => setEditing(true)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center"><Pencil size={16} /></button>
            <button onClick={() => onDelete(name)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50/50 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center"><Trash2 size={16} /></button>
          </div>
        )}
      </div>
    </div>
  )
}

function AddKeyForm({ onAdd, onCancel }) {
  const [name, setName] = useState('')
  const [key, setKey] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !key.trim()) return
    onAdd(name.toLowerCase().trim(), { api_key: key.trim(), notes: notes.trim(), added: new Date().toISOString().split('T')[0] })
    setName(''); setKey(''); setNotes('')
  }

  return (
    <form onSubmit={handleSubmit} className="py-4 space-y-3 border-t border-white/20">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Service Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-3 text-[16px] bg-white border border-gray-300 rounded-xl focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none" placeholder="e.g., openai" autoFocus />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-3 py-3 text-[16px] bg-white border border-gray-300 rounded-xl focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none" placeholder="What is this for?" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">API Key</label>
        <input type="text" value={key} onChange={(e) => setKey(e.target.value)} className="w-full px-3 py-3 text-[16px] font-mono bg-white border border-gray-300 rounded-xl focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none" placeholder="sk-..." />
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button type="submit" disabled={!name.trim() || !key.trim()} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 disabled:opacity-50 min-h-[44px]"><Check size={14} />Add Key</button>
        <button type="button" onClick={onCancel} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100/80 rounded-xl hover:bg-gray-200 min-h-[44px]"><X size={14} />Cancel</button>
      </div>
    </form>
  )
}

function SettingsPage() {
  const [config, setConfig] = useState(null)
  const [keys, setKeys] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [configRes, keysRes] = await Promise.all([
        fetch('/api/tools/invoke', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tool: 'gateway', input: { action: 'config.get' } }) }),
        fetch('/api/keys')
      ])
      if (configRes.ok) { const data = await configRes.json(); setConfig(data.config || data) }
      if (keysRes.ok) { const data = await keysRes.json(); setKeys(data.keys || {}) }
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const saveKeys = async (newKeys) => {
    setSaving(true); setError(null)
    try {
      const res = await fetch('/api/keys', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keys: newKeys }) })
      if (!res.ok) throw new Error('Failed to save keys')
      setKeys(newKeys); setSuccess('Keys saved successfully'); setTimeout(() => setSuccess(null), 3000)
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  const handleUpdateKey = (name, data) => saveKeys({ ...keys, [name]: data })
  const handleDeleteKey = (name) => { if (!confirm(`Delete the ${name} API key?`)) return; const newKeys = { ...keys }; delete newKeys[name]; saveKeys(newKeys) }
  const handleAddKey = (name, data) => { saveKeys({ ...keys, [name]: data }); setShowAddForm(false) }

  const restartGateway = async () => {
    if (!confirm('Restart the OpenClaw Gateway? This will briefly interrupt service.')) return
    setSaving(true); setError(null); setSuccess(null)
    try {
      await fetch('/api/tools/invoke', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tool: 'gateway', input: { action: 'restart', reason: 'Manual restart from dashboard' } }) })
      setSuccess('Gateway restart initiated')
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  const keyCount = Object.keys(keys).length

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Configure your OpenClaw instance</p>
        </div>
        <button onClick={restartGateway} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-gray-900/90 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors min-h-[44px]">
          <RefreshCw size={16} className={saving ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Restart Gateway</span>
        </button>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50/80 text-red-700 text-sm rounded-2xl border border-red-100/50">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-50/80 text-green-700 text-sm rounded-2xl border border-green-100/50">{success}</div>}

      {loading ? (
        <div className="flex items-center justify-center h-64"><RefreshCw className="animate-spin text-gray-400" size={24} /></div>
      ) : (
        <div className="space-y-6 md:space-y-8">
          <section className="glass rounded-2xl overflow-hidden">
            <div className="px-5 md:px-6 py-5 border-b border-white/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100/80 rounded-xl"><Key size={18} className="text-gray-600" /></div>
                <div><h2 className="font-semibold text-gray-900">API Keys</h2><p className="text-sm text-gray-500">{keyCount} {keyCount === 1 ? 'key' : 'keys'} configured</p></div>
              </div>
              {!showAddForm && (
                <button onClick={() => setShowAddForm(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white/50 rounded-xl hover:bg-white/70 min-h-[44px]"><Plus size={14} />Add Key</button>
              )}
            </div>
            <div className="px-5 md:px-6 divide-y divide-white/20">
              {Object.entries(keys).map(([name, data]) => (
                <KeyRow key={name} name={name} data={data} onUpdate={handleUpdateKey} onDelete={handleDeleteKey} />
              ))}
              {keyCount === 0 && !showAddForm && (
                <div className="py-12 text-center">
                  <Key size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No API keys configured</p>
                  <button onClick={() => setShowAddForm(true)} className="mt-3 text-sm font-medium text-gray-900 hover:underline min-h-[44px]">Add your first key</button>
                </div>
              )}
              {showAddForm && <AddKeyForm onAdd={handleAddKey} onCancel={() => setShowAddForm(false)} />}
            </div>
          </section>

          <section className="glass rounded-2xl overflow-hidden">
            <div className="px-5 md:px-6 py-5 border-b border-white/20 flex items-center gap-3">
              <div className="p-2 bg-gray-100/80 rounded-xl"><Globe size={18} className="text-gray-600" /></div>
              <div><h2 className="font-semibold text-gray-900">Channels</h2><p className="text-sm text-gray-500">Connected messaging platforms</p></div>
            </div>
            <div className="px-5 md:px-6 py-4">
              <div className="flex items-center justify-between min-h-[52px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.05-.2-.06-.05-.15-.03-.22-.02-.1.02-1.62 1.03-4.58 3.03-.43.3-.82.44-1.17.43-.39-.01-1.13-.22-1.68-.4-.68-.22-1.22-.34-1.17-.72.02-.2.31-.39.88-.58 3.45-1.5 5.75-2.49 6.89-2.96 3.28-1.36 3.96-1.6 4.41-1.6.1 0 .32.02.46.13.12.09.15.21.17.33-.01.06-.01.24-.02.38z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Telegram</p>
                    <p className="text-sm text-gray-500">@{config?.telegram?.username || 'rhinoboybot'}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100/80 text-green-700 text-xs font-medium rounded-full">Connected</span>
              </div>
            </div>
          </section>

          <section className="glass rounded-2xl overflow-hidden">
            <div className="px-5 md:px-6 py-5 border-b border-white/20 flex items-center gap-3">
              <div className="p-2 bg-gray-100/80 rounded-xl"><Shield size={18} className="text-gray-600" /></div>
              <div><h2 className="font-semibold text-gray-900">Security</h2><p className="text-sm text-gray-500">Access control settings</p></div>
            </div>
            <div className="px-5 md:px-6 py-4">
              <div className="flex items-center justify-between min-h-[52px]">
                <div><p className="font-medium text-gray-900">Allowed Users</p><p className="text-sm text-gray-500">Only these Telegram IDs can interact</p></div>
                <code className="px-3 py-1.5 bg-white/50 rounded-xl text-sm font-mono text-gray-700">457216478</code>
              </div>
            </div>
          </section>

          <details className="glass rounded-2xl overflow-hidden">
            <summary className="px-5 md:px-6 py-5 cursor-pointer hover:bg-white/30 transition-colors">
              <span className="font-semibold text-gray-900">Raw Configuration</span>
              <span className="text-sm text-gray-500 ml-2">View JSON</span>
            </summary>
            <div className="px-5 md:px-6 pb-6">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm">{JSON.stringify(config, null, 2)}</pre>
            </div>
          </details>
        </div>
      )}
    </div>
  )
}

export default SettingsPage
