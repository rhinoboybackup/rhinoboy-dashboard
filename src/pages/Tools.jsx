import { useState, useEffect } from 'react'
import { 
  Wrench, RefreshCw, Plus, Check, X, AlertCircle, ExternalLink,
  Eye, EyeOff, Copy, Pencil, Trash2, Activity, TrendingUp,
  Zap, Clock, DollarSign, BarChart3, Settings2
} from 'lucide-react'

// Tool definitions with metadata
const TOOL_CATALOG = {
  replicate: {
    name: 'Replicate',
    description: 'ML model hosting - image gen, video, audio transcription',
    category: 'AI/ML',
    icon: '🤖',
    color: 'purple',
    keyField: 'api_token',
    docsUrl: 'https://replicate.com/docs',
    testEndpoint: 'https://api.replicate.com/v1/models',
    pricing: '~$0.003/min audio, varies by model'
  },
  google: {
    name: 'Google / Gemini',
    description: 'Gemini models, image generation, vision analysis',
    category: 'AI/ML',
    icon: '🔮',
    color: 'blue',
    keyField: 'api_key',
    docsUrl: 'https://ai.google.dev/docs',
    pricing: 'Free tier + pay-per-use'
  },
  xai: {
    name: 'xAI / Grok',
    description: 'Grok models, X/Twitter search, real-time data',
    category: 'AI/ML',
    icon: '𝕏',
    color: 'gray',
    keyField: 'api_key',
    docsUrl: 'https://docs.x.ai',
    pricing: 'Credits-based'
  },
  notion: {
    name: 'Notion',
    description: 'Workspace integration, page publishing, databases',
    category: 'Productivity',
    icon: '📝',
    color: 'gray',
    keyField: 'api_key',
    docsUrl: 'https://developers.notion.com',
    testEndpoint: 'https://api.notion.com/v1/users/me',
    pricing: 'Free with workspace'
  },
  brave: {
    name: 'Brave Search',
    description: 'Web search API for research and discovery',
    category: 'Search',
    icon: '🦁',
    color: 'orange',
    keyField: 'api_key',
    docsUrl: 'https://brave.com/search/api/',
    testEndpoint: 'https://api.search.brave.com/res/v1/web/search?q=test',
    pricing: 'Free tier: 2000 queries/mo'
  },
  firecrawl: {
    name: 'Firecrawl',
    description: 'Web scraping and content extraction',
    category: 'Data',
    icon: '🔥',
    color: 'red',
    keyField: 'api_key',
    docsUrl: 'https://firecrawl.dev/docs',
    pricing: 'Credits-based'
  },
  supadata: {
    name: 'Supadata',
    description: 'Telegram researcher - channel/group data',
    category: 'Data',
    icon: '📊',
    color: 'cyan',
    keyField: 'api_key',
    docsUrl: 'https://supadata.ai',
    pricing: 'Subscription'
  },
  miro: {
    name: 'Miro',
    description: 'Whiteboard and collaboration',
    category: 'Productivity',
    icon: '🎨',
    color: 'yellow',
    keyField: 'api_key',
    docsUrl: 'https://developers.miro.com',
    pricing: 'Free with workspace'
  },
  openai: {
    name: 'OpenAI',
    description: 'GPT models, DALL-E, Whisper',
    category: 'AI/ML',
    icon: '🧠',
    color: 'green',
    keyField: 'api_key',
    docsUrl: 'https://platform.openai.com/docs',
    pricing: 'Pay-per-token'
  },
  anthropic: {
    name: 'Anthropic',
    description: 'Claude models - already configured in OpenClaw',
    category: 'AI/ML',
    icon: '🅰️',
    color: 'amber',
    keyField: 'api_key',
    docsUrl: 'https://docs.anthropic.com',
    pricing: 'Pay-per-token',
    systemManaged: true
  },
  elevenlabs: {
    name: 'ElevenLabs',
    description: 'Text-to-speech, voice cloning',
    category: 'AI/ML',
    icon: '🔊',
    color: 'indigo',
    keyField: 'api_key',
    docsUrl: 'https://elevenlabs.io/docs',
    pricing: 'Character-based'
  },
  telegram: {
    name: 'Telegram Bot',
    description: 'Messaging channel - configured in OpenClaw',
    category: 'Channels',
    icon: '✈️',
    color: 'blue',
    keyField: 'token',
    systemManaged: true
  }
}

const colorMap = {
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  cyan: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' }
}

function ToolCard({ id, config, meta, usage, onEdit, onDelete, onTest }) {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const colors = colorMap[meta?.color] || colorMap.gray
  const keyValue = config?.[meta?.keyField] || config?.api_key || config?.api_token || ''

  const obfuscate = (val) => {
    if (!val || val.length < 8) return '••••••••'
    return val.slice(0, 4) + '•'.repeat(Math.min(val.length - 8, 16)) + val.slice(-4)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(keyValue)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const result = await onTest(id)
      setTestResult(result)
    } catch (err) {
      setTestResult({ ok: false, error: err.message })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className={`bg-white rounded-2xl border ${testResult?.ok === false ? 'border-red-200' : 'border-gray-200'} overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center text-2xl`}>
              {meta?.icon || '🔧'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{meta?.name || id}</h3>
              <p className="text-sm text-gray-500">{meta?.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {config && !meta?.systemManaged && (
              <>
                <button
                  onClick={() => onEdit(id)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => onDelete(id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Key display */}
      {config && keyValue && (
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono text-gray-600 truncate">
              {visible ? keyValue : obfuscate(keyValue)}
            </code>
            <button
              onClick={() => setVisible(!visible)}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              title={visible ? 'Hide' : 'Show'}
            >
              {visible ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              title="Copy"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* Usage stats */}
      {usage && (
        <div className="px-5 py-3 border-b border-gray-100">
          <div className="grid grid-cols-3 gap-4">
            {usage.calls !== undefined && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Calls</p>
                <p className="text-lg font-semibold text-gray-900">{usage.calls.toLocaleString()}</p>
              </div>
            )}
            {usage.tokens !== undefined && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Tokens</p>
                <p className="text-lg font-semibold text-gray-900">{formatNumber(usage.tokens)}</p>
              </div>
            )}
            {usage.cost !== undefined && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Cost</p>
                <p className="text-lg font-semibold text-gray-900">${usage.cost.toFixed(2)}</p>
              </div>
            )}
          </div>
          {usage.lastUsed && (
            <p className="text-xs text-gray-400 mt-2">
              Last used: {new Date(usage.lastUsed).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {config ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <Check size={12} />
              Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Not configured
            </span>
          )}
          {meta?.systemManaged && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              System
            </span>
          )}
          {testResult && (
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              testResult.ok ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
            }`}>
              {testResult.ok ? <Check size={12} /> : <AlertCircle size={12} />}
              {testResult.ok ? 'Verified' : 'Failed'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {meta?.docsUrl && (
            <a
              href={meta.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              title="Documentation"
            >
              <ExternalLink size={14} />
            </a>
          )}
          {config && meta?.testEndpoint && (
            <button
              onClick={handleTest}
              disabled={testing}
              className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Test'}
            </button>
          )}
        </div>
      </div>

      {/* Pricing info */}
      {meta?.pricing && (
        <div className="px-5 py-2 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            <DollarSign size={10} className="inline mr-1" />
            {meta.pricing}
          </p>
        </div>
      )}
    </div>
  )
}

function AddToolModal({ onClose, onAdd, existingKeys }) {
  const [selectedTool, setSelectedTool] = useState(null)
  const [key, setKey] = useState('')
  const [notes, setNotes] = useState('')

  const availableTools = Object.entries(TOOL_CATALOG)
    .filter(([id, meta]) => !existingKeys.includes(id) && !meta.systemManaged)

  const handleAdd = () => {
    if (!selectedTool || !key.trim()) return
    const meta = TOOL_CATALOG[selectedTool]
    onAdd(selectedTool, {
      [meta.keyField || 'api_key']: key.trim(),
      notes: notes.trim() || meta.description,
      added: new Date().toISOString().split('T')[0]
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Add Tool</h2>
          <p className="text-sm text-gray-500 mt-1">Connect a new API service</p>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {!selectedTool ? (
            <div className="grid gap-2">
              {availableTools.map(([id, meta]) => {
                const colors = colorMap[meta.color] || colorMap.gray
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedTool(id)}
                    className="flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
                  >
                    <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center text-xl`}>
                      {meta.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{meta.name}</p>
                      <p className="text-sm text-gray-500">{meta.description}</p>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {meta.category}
                    </span>
                  </button>
                )
              })}
              {availableTools.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  All known tools are already configured
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedTool(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Choose different tool
              </button>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className={`w-12 h-12 ${colorMap[TOOL_CATALOG[selectedTool].color]?.bg || 'bg-gray-100'} rounded-xl flex items-center justify-center text-2xl`}>
                  {TOOL_CATALOG[selectedTool].icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{TOOL_CATALOG[selectedTool].name}</p>
                  <p className="text-sm text-gray-500">{TOOL_CATALOG[selectedTool].description}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm font-mono bg-white border border-gray-300 rounded-xl focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
                  placeholder={`Enter ${TOOL_CATALOG[selectedTool].name} API key...`}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
                  placeholder="What will you use this for?"
                />
              </div>

              {TOOL_CATALOG[selectedTool].docsUrl && (
                <a
                  href={TOOL_CATALOG[selectedTool].docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink size={14} />
                  Get an API key from {TOOL_CATALOG[selectedTool].name}
                </a>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          {selectedTool && (
            <button
              onClick={handleAdd}
              disabled={!key.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              Add Tool
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function EditToolModal({ id, config, meta, onClose, onSave }) {
  const [key, setKey] = useState(config?.[meta?.keyField] || config?.api_key || config?.api_token || '')
  const [notes, setNotes] = useState(config?.notes || '')

  const handleSave = () => {
    onSave(id, {
      ...config,
      [meta?.keyField || 'api_key']: key.trim(),
      notes: notes.trim()
    })
  }

  const colors = colorMap[meta?.color] || colorMap.gray

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center text-2xl`}>
              {meta?.icon || '🔧'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit {meta?.name || id}</h2>
              <p className="text-sm text-gray-500">{meta?.description}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-4 py-2.5 text-sm font-mono bg-white border border-gray-300 rounded-xl focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
            />
          </div>

          {config?.added && (
            <p className="text-xs text-gray-400">
              Added on {config.added}
            </p>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

function formatNumber(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function ToolsPage() {
  const [keys, setKeys] = useState({})
  const [usage, setUsage] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTool, setEditingTool] = useState(null)
  const [filter, setFilter] = useState('all')

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch keys
      const keysRes = await fetch('/api/keys')
      if (keysRes.ok) {
        const data = await keysRes.json()
        setKeys(data.keys || {})
      }

      // Fetch usage data (if we have it)
      try {
        const usageRes = await fetch('/api/tools/usage')
        if (usageRes.ok) {
          const data = await usageRes.json()
          setUsage(data.usage || {})
        }
      } catch (e) {
        // Usage tracking not implemented yet
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const saveKeys = async (newKeys) => {
    try {
      const res = await fetch('/api/keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: newKeys })
      })
      if (!res.ok) throw new Error('Failed to save')
      setKeys(newKeys)
      setSuccess('Saved successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleAdd = (id, config) => {
    saveKeys({ ...keys, [id]: config })
    setShowAddModal(false)
  }

  const handleEdit = (id, config) => {
    saveKeys({ ...keys, [id]: config })
    setEditingTool(null)
  }

  const handleDelete = (id) => {
    if (!confirm(`Remove ${TOOL_CATALOG[id]?.name || id}?`)) return
    const newKeys = { ...keys }
    delete newKeys[id]
    saveKeys(newKeys)
  }

  const handleTest = async (id) => {
    const meta = TOOL_CATALOG[id]
    const config = keys[id]
    if (!meta?.testEndpoint || !config) return { ok: false, error: 'No test available' }

    try {
      const keyValue = config[meta.keyField] || config.api_key || config.api_token
      const headers = { 'Authorization': `Bearer ${keyValue}` }
      
      // Special case for Notion
      if (id === 'notion') {
        headers['Notion-Version'] = '2022-06-28'
      }

      const res = await fetch(meta.testEndpoint, { headers, method: 'GET' })
      return { ok: res.ok, status: res.status }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  }

  // Build list of all tools (configured + available)
  const allTools = Object.entries(TOOL_CATALOG).map(([id, meta]) => ({
    id,
    meta,
    config: keys[id],
    usage: usage[id]
  }))

  // Filter
  const filteredTools = allTools.filter(tool => {
    if (filter === 'connected') return tool.config
    if (filter === 'available') return !tool.config && !tool.meta.systemManaged
    return true
  })

  // Group by category
  const categories = [...new Set(allTools.map(t => t.meta.category))]
  const connectedCount = allTools.filter(t => t.config).length

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tools</h1>
          <p className="text-gray-500 mt-1">
            {connectedCount} of {allTools.length} tools connected
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} />
          Add Tool
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 text-sm rounded-xl border border-green-100">
          {success}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { id: 'all', label: 'All Tools' },
          { id: 'connected', label: 'Connected' },
          { id: 'available', label: 'Available' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === tab.id
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin text-gray-400" size={24} />
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map(category => {
            const categoryTools = filteredTools.filter(t => t.meta.category === category)
            if (categoryTools.length === 0) return null

            return (
              <section key={category}>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                  {category}
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryTools.map(tool => (
                    <ToolCard
                      key={tool.id}
                      id={tool.id}
                      config={tool.config}
                      meta={tool.meta}
                      usage={tool.usage}
                      onEdit={() => setEditingTool(tool.id)}
                      onDelete={() => handleDelete(tool.id)}
                      onTest={handleTest}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddToolModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
          existingKeys={Object.keys(keys)}
        />
      )}

      {editingTool && (
        <EditToolModal
          id={editingTool}
          config={keys[editingTool]}
          meta={TOOL_CATALOG[editingTool]}
          onClose={() => setEditingTool(null)}
          onSave={handleEdit}
        />
      )}
    </div>
  )
}

export default ToolsPage
