import { useState, useEffect } from 'react'
import { 
  Wrench, RefreshCw, Plus, Check, X, AlertCircle, ExternalLink,
  Eye, EyeOff, Copy, Pencil, Trash2, Activity, TrendingUp,
  Zap, Clock, DollarSign, BarChart3, Settings2
} from 'lucide-react'

// Tag definitions with color coding
const TAG_STYLES = {
  // Capabilities
  coding: { bg: 'bg-blue-100/90', text: 'text-blue-700', label: 'Coding' },
  vision: { bg: 'bg-purple-100/90', text: 'text-purple-700', label: 'Vision' },
  reasoning: { bg: 'bg-amber-100/90', text: 'text-amber-700', label: 'Reasoning' },
  multimodal: { bg: 'bg-pink-100/90', text: 'text-pink-700', label: 'Multimodal' },
  audio: { bg: 'bg-green-100/90', text: 'text-green-700', label: 'Audio' },
  video: { bg: 'bg-indigo-100/90', text: 'text-indigo-700', label: 'Video' },
  image: { bg: 'bg-rose-100/90', text: 'text-rose-700', label: 'Image Gen' },
  search: { bg: 'bg-cyan-100/90', text: 'text-cyan-700', label: 'Search' },
  
  // Use cases
  conversation: { bg: 'bg-emerald-100/90', text: 'text-emerald-700', label: 'Chat' },
  'cost-effective': { bg: 'bg-teal-100/90', text: 'text-teal-700', label: '💰 Cost-effective' },
  production: { bg: 'bg-slate-100/90', text: 'text-slate-700', label: 'Production' },
  research: { bg: 'bg-violet-100/90', text: 'text-violet-700', label: 'Research' },
  creative: { bg: 'bg-fuchsia-100/90', text: 'text-fuchsia-700', label: 'Creative' },
  fast: { bg: 'bg-orange-100/90', text: 'text-orange-700', label: '⚡ Fast' },
  powerful: { bg: 'bg-red-100/90', text: 'text-red-700', label: '🔥 Powerful' }
}

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
    pricing: '~$0.003/min audio, varies by model',
    tags: ['audio', 'video', 'image', 'cost-effective', 'creative']
  },
  google: { 
    name: 'Google / Gemini', 
    description: 'Gemini models, image generation, vision analysis', 
    category: 'AI/ML', 
    icon: '🔮', 
    color: 'blue', 
    keyField: 'api_key', 
    docsUrl: 'https://ai.google.dev/docs', 
    pricing: 'Free tier + pay-per-use',
    tags: ['vision', 'multimodal', 'reasoning', 'conversation', 'cost-effective', 'fast']
  },
  xai: { 
    name: 'xAI / Grok', 
    description: 'Grok models, X/Twitter search, real-time data', 
    category: 'AI/ML', 
    icon: '𝕏', 
    color: 'gray', 
    keyField: 'api_key', 
    docsUrl: 'https://docs.x.ai', 
    pricing: 'Credits-based',
    tags: ['reasoning', 'search', 'conversation', 'research']
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
    pricing: 'Free with workspace',
    tags: []
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
    pricing: 'Free tier: 2000 queries/mo',
    tags: ['search', 'research', 'cost-effective']
  },
  firecrawl: { 
    name: 'Firecrawl', 
    description: 'Web scraping and content extraction', 
    category: 'Data', 
    icon: '🔥', 
    color: 'red', 
    keyField: 'api_key', 
    docsUrl: 'https://firecrawl.dev/docs', 
    pricing: 'Credits-based',
    tags: ['research']
  },
  supadata: { 
    name: 'Supadata', 
    description: 'Telegram researcher - channel/group data', 
    category: 'Data', 
    icon: '📊', 
    color: 'cyan', 
    keyField: 'api_key', 
    docsUrl: 'https://supadata.ai', 
    pricing: 'Subscription',
    tags: ['research']
  },
  miro: { 
    name: 'Miro', 
    description: 'Whiteboard and collaboration', 
    category: 'Productivity', 
    icon: '🎨', 
    color: 'yellow', 
    keyField: 'api_key', 
    docsUrl: 'https://developers.miro.com', 
    pricing: 'Free with workspace',
    tags: ['creative']
  },
  openai: { 
    name: 'OpenAI', 
    description: 'GPT models, DALL-E, Whisper', 
    category: 'AI/ML', 
    icon: '🧠', 
    color: 'green', 
    keyField: 'api_key', 
    docsUrl: 'https://platform.openai.com/docs', 
    pricing: 'Pay-per-token',
    tags: ['coding', 'reasoning', 'conversation', 'image', 'audio', 'production', 'powerful']
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
    systemManaged: true,
    tags: ['coding', 'reasoning', 'vision', 'conversation', 'production', 'powerful']
  },
  elevenlabs: { 
    name: 'ElevenLabs', 
    description: 'Text-to-speech, voice cloning', 
    category: 'AI/ML', 
    icon: '🔊', 
    color: 'indigo', 
    keyField: 'api_key', 
    docsUrl: 'https://elevenlabs.io/docs', 
    pricing: 'Character-based',
    tags: ['audio', 'creative']
  },
  telegram: { 
    name: 'Telegram Bot', 
    description: 'Messaging channel - configured in OpenClaw', 
    category: 'Channels', 
    icon: '✈️', 
    color: 'blue', 
    keyField: 'token', 
    systemManaged: true,
    tags: []
  }
}

const colorMap = {
  purple: { bg: 'bg-purple-100/80', text: 'text-purple-700', border: 'border-purple-200' },
  blue: { bg: 'bg-blue-100/80', text: 'text-blue-700', border: 'border-blue-200' },
  gray: { bg: 'bg-gray-100/80', text: 'text-gray-700', border: 'border-gray-200' },
  orange: { bg: 'bg-orange-100/80', text: 'text-orange-700', border: 'border-orange-200' },
  red: { bg: 'bg-red-100/80', text: 'text-red-700', border: 'border-red-200' },
  cyan: { bg: 'bg-cyan-100/80', text: 'text-cyan-700', border: 'border-cyan-200' },
  yellow: { bg: 'bg-yellow-100/80', text: 'text-yellow-700', border: 'border-yellow-200' },
  green: { bg: 'bg-green-100/80', text: 'text-green-700', border: 'border-green-200' },
  amber: { bg: 'bg-amber-100/80', text: 'text-amber-700', border: 'border-amber-200' },
  indigo: { bg: 'bg-indigo-100/80', text: 'text-indigo-700', border: 'border-indigo-200' }
}

function TagPill({ tag }) {
  const style = TAG_STYLES[tag]
  if (!style) return null
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  )
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

  // Split tags into capabilities and use cases
  const capabilityTags = meta?.tags?.filter(t => ['coding', 'vision', 'reasoning', 'multimodal', 'audio', 'video', 'image', 'search'].includes(t)) || []
  const useCaseTags = meta?.tags?.filter(t => ['conversation', 'cost-effective', 'production', 'research', 'creative', 'fast', 'powerful'].includes(t)) || []

  return (
    <div className="glass rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      {/* Header */}
      <div className="p-4 md:p-5 border-b border-white/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-11 h-11 md:w-12 md:h-12 flex-shrink-0 ${colors.bg} rounded-xl flex items-center justify-center text-2xl shadow-sm`}>
              {meta?.icon || '🔧'}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-base md:text-lg truncate">{meta?.name || id}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">{meta?.description}</p>
            </div>
          </div>
          {config && !meta?.systemManaged && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => onEdit(id)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-xl transition-all min-w-[44px] min-h-[44px] flex items-center justify-center">
                <Pencil size={16} />
              </button>
              <button onClick={() => onDelete(id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50/50 rounded-xl transition-all min-w-[44px] min-h-[44px] flex items-center justify-center">
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tags Section */}
      {(capabilityTags.length > 0 || useCaseTags.length > 0) && (
        <div className="px-4 md:px-5 py-3 bg-white/20 border-b border-white/20 space-y-2">
          {capabilityTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {capabilityTags.map(tag => <TagPill key={tag} tag={tag} />)}
            </div>
          )}
          {useCaseTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {useCaseTags.map(tag => <TagPill key={tag} tag={tag} />)}
            </div>
          )}
        </div>
      )}

      {/* API Key Section */}
      {config && keyValue && (
        <div className="px-4 md:px-5 py-3 bg-white/30 border-b border-white/20">
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono text-gray-600 truncate">
              {visible ? keyValue : obfuscate(keyValue)}
            </code>
            <button 
              onClick={() => setVisible(!visible)} 
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              {visible ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button 
              onClick={handleCopy} 
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* Usage Stats */}
      {usage && (
        <div className="px-4 md:px-5 py-3 border-b border-white/20">
          <div className="grid grid-cols-3 gap-4">
            {usage.calls !== undefined && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Calls</p>
                <p className="text-lg font-semibold text-gray-900">{usage.calls.toLocaleString()}</p>
              </div>
            )}
            {usage.tokens !== undefined && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Tokens</p>
                <p className="text-lg font-semibold text-gray-900">{formatNumber(usage.tokens)}</p>
              </div>
            )}
            {usage.cost !== undefined && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Cost</p>
                <p className="text-lg font-semibold text-gray-900">${usage.cost.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="px-4 md:px-5 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {config ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50/80 px-2.5 py-1 rounded-full">
              <Check size={12} />Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100/80 px-2.5 py-1 rounded-full">
              Not configured
            </span>
          )}
          {meta?.systemManaged && (
            <span className="text-xs text-gray-400 bg-gray-100/80 px-2.5 py-1 rounded-full">
              System
            </span>
          )}
          {testResult && (
            <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${testResult.ok ? 'text-green-600 bg-green-50/80' : 'text-red-600 bg-red-50/80'}`}>
              {testResult.ok ? <Check size={12} /> : <AlertCircle size={12} />}
              {testResult.ok ? 'Verified' : 'Failed'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {meta?.docsUrl && (
            <a 
              href={meta.docsUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ExternalLink size={14} />
            </a>
          )}
          {config && meta?.testEndpoint && (
            <button 
              onClick={handleTest} 
              disabled={testing} 
              className="text-xs font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 px-3 py-2 rounded-lg hover:bg-white/50 transition-colors min-h-[44px]"
            >
              {testing ? 'Testing...' : 'Test'}
            </button>
          )}
        </div>
      </div>

      {/* Pricing Info */}
      {meta?.pricing && (
        <div className="px-4 md:px-5 py-2 bg-white/30 border-t border-white/20">
          <p className="text-xs text-gray-500">
            <DollarSign size={10} className="inline mr-1" />{meta.pricing}
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

  const availableTools = Object.entries(TOOL_CATALOG).filter(([id, meta]) => !existingKeys.includes(id) && !meta.systemManaged)

  const handleAdd = () => {
    if (!selectedTool || !key.trim()) return
    const meta = TOOL_CATALOG[selectedTool]
    onAdd(selectedTool, { [meta.keyField || 'api_key']: key.trim(), notes: notes.trim() || meta.description, added: new Date().toISOString().split('T')[0] })
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4" onClick={onClose}>
      <div className="bg-white/95 backdrop-blur-xl rounded-t-3xl md:rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100/50">
          <h2 className="text-xl font-semibold text-gray-900">Add Tool</h2>
          <p className="text-sm text-gray-500 mt-1">Connect a new API service</p>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {!selectedTool ? (
            <div className="grid gap-3">
              {availableTools.map(([id, meta]) => {
                const colors = colorMap[meta.color] || colorMap.gray
                return (
                  <button 
                    key={id} 
                    onClick={() => setSelectedTool(id)} 
                    className="flex items-center gap-3 p-4 text-left hover:bg-gray-50/80 rounded-2xl transition-all border border-gray-200/50 min-h-[72px] hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className={`w-12 h-12 flex-shrink-0 ${colors.bg} rounded-xl flex items-center justify-center text-2xl shadow-sm`}>
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{meta.name}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{meta.description}</p>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100/80 px-2.5 py-1 rounded-full hidden sm:inline flex-shrink-0">
                      {meta.category}
                    </span>
                  </button>
                )
              })}
              {availableTools.length === 0 && (
                <p className="text-center text-gray-500 py-8">All known tools are already configured</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <button 
                onClick={() => setSelectedTool(null)} 
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors min-h-[44px]"
              >
                ← Choose different tool
              </button>
              <div className="flex items-center gap-3 p-5 bg-gray-50/80 rounded-2xl">
                <div className={`w-14 h-14 flex-shrink-0 ${colorMap[TOOL_CATALOG[selectedTool].color]?.bg || 'bg-gray-100'} rounded-2xl flex items-center justify-center text-3xl shadow-sm`}>
                  {TOOL_CATALOG[selectedTool].icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-lg">{TOOL_CATALOG[selectedTool].name}</p>
                  <p className="text-sm text-gray-500">{TOOL_CATALOG[selectedTool].description}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <input 
                  type="text" 
                  value={key} 
                  onChange={(e) => setKey(e.target.value)} 
                  className="w-full px-4 py-3 text-[16px] font-mono bg-white border border-gray-300 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 outline-none transition-all" 
                  placeholder={`Enter ${TOOL_CATALOG[selectedTool].name} API key...`} 
                  autoFocus 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                <input 
                  type="text" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  className="w-full px-4 py-3 text-[16px] bg-white border border-gray-300 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 outline-none transition-all" 
                  placeholder="What will you use this for?" 
                />
              </div>
              {TOOL_CATALOG[selectedTool].docsUrl && (
                <a 
                  href={TOOL_CATALOG[selectedTool].docsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline min-h-[44px]"
                >
                  <ExternalLink size={14} />
                  Get an API key from {TOOL_CATALOG[selectedTool].name}
                </a>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100/50 flex items-center justify-end gap-3 safe-bottom">
          <button 
            onClick={onClose} 
            className="px-5 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors min-h-[48px] rounded-xl hover:bg-gray-100/50"
          >
            Cancel
          </button>
          {selectedTool && (
            <button 
              onClick={handleAdd} 
              disabled={!key.trim()} 
              className="px-5 py-3 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm min-h-[48px]"
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
    onSave(id, { ...config, [meta?.keyField || 'api_key']: key.trim(), notes: notes.trim() })
  }

  const colors = colorMap[meta?.color] || colorMap.gray

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4" onClick={onClose}>
      <div className="bg-white/95 backdrop-blur-xl rounded-t-3xl md:rounded-3xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100/50">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 flex-shrink-0 ${colors.bg} rounded-2xl flex items-center justify-center text-3xl shadow-sm`}>
              {meta?.icon || '🔧'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-gray-900">Edit {meta?.name || id}</h2>
              <p className="text-sm text-gray-500">{meta?.description}</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
            <input 
              type="text" 
              value={key} 
              onChange={(e) => setKey(e.target.value)} 
              className="w-full px-4 py-3 text-[16px] font-mono bg-white border border-gray-300 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 outline-none transition-all" 
              autoFocus 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <input 
              type="text" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              className="w-full px-4 py-3 text-[16px] bg-white border border-gray-300 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 outline-none transition-all" 
            />
          </div>
          {config?.added && (
            <p className="text-xs text-gray-400">Added on {config.added}</p>
          )}
        </div>
        <div className="p-6 border-t border-gray-100/50 flex items-center justify-end gap-3 safe-bottom">
          <button 
            onClick={onClose} 
            className="px-5 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors min-h-[48px] rounded-xl hover:bg-gray-100/50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={!key.trim()} 
            className="px-5 py-3 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm min-h-[48px]"
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
      const keysRes = await fetch('/api/keys')
      if (keysRes.ok) { 
        const data = await keysRes.json()
        setKeys(data.keys || {}) 
      }
      try { 
        const usageRes = await fetch('/api/tools/usage')
        if (usageRes.ok) { 
          const data = await usageRes.json()
          setUsage(data.usage || {}) 
        } 
      } catch (e) {}
    } catch (err) { 
      setError(err.message) 
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { fetchData() }, [])

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
      if (id === 'notion') headers['Notion-Version'] = '2022-06-28'
      const res = await fetch(meta.testEndpoint, { headers, method: 'GET' })
      return { ok: res.ok, status: res.status }
    } catch (err) { 
      return { ok: false, error: err.message } 
    }
  }

  const allTools = Object.entries(TOOL_CATALOG).map(([id, meta]) => ({ 
    id, 
    meta, 
    config: keys[id], 
    usage: usage[id] 
  }))
  
  const filteredTools = allTools.filter(tool => {
    if (filter === 'connected') return tool.config
    if (filter === 'available') return !tool.config && !tool.meta.systemManaged
    return true
  })
  
  const categories = [...new Set(allTools.map(t => t.meta.category))]
  const connectedCount = allTools.filter(t => t.config).length

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto safe-bottom">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">Tools</h1>
          <p className="text-gray-500 mt-1.5 text-sm md:text-base">
            {connectedCount} of {allTools.length} tools connected
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)} 
          className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium bg-gray-900/90 text-white rounded-xl hover:bg-gray-800 transition-all shadow-sm hover:shadow-md min-h-[48px] sm:w-auto w-full"
        >
          <Plus size={18} />
          <span>Add Tool</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-50/80 text-red-700 text-sm rounded-2xl border border-red-100/50 flex items-center justify-between backdrop-blur-sm">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="text-red-500 hover:text-red-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50/80 text-green-700 text-sm rounded-2xl border border-green-100/50 backdrop-blur-sm">
          {success}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
        {[
          { id: 'all', label: 'All Tools' }, 
          { id: 'connected', label: 'Connected' }, 
          { id: 'available', label: 'Available' }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setFilter(tab.id)} 
            className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all whitespace-nowrap min-h-[44px] ${
              filter === tab.id 
                ? 'bg-gray-900/90 text-white shadow-sm' 
                : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin text-gray-400" size={32} />
        </div>
      ) : (
        /* Tools Grid */
        <div className="space-y-10">
          {categories.map(category => {
            const categoryTools = filteredTools.filter(t => t.meta.category === category)
            if (categoryTools.length === 0) return null
            return (
              <section key={category}>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 px-1">
                  {category}
                </h2>
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
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
