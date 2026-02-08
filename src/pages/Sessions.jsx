import { useState, useEffect, useRef } from 'react'
import { MessageSquare, RefreshCw, Send, User, Bot, Clock, Zap, ChevronRight, ArrowLeft } from 'lucide-react'

function MessageContent({ content }) {
  if (!content) return null
  
  const lines = content.split('\n')
  const elements = []
  let inCodeBlock = false
  let codeLines = []
  
  lines.forEach((line, i) => {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="my-3 p-4 bg-gray-900 text-gray-100 rounded-xl text-sm font-mono overflow-x-auto">
            <code>{codeLines.join('\n')}</code>
          </pre>
        )
        codeLines = []
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }
      return
    }
    
    if (inCodeBlock) { codeLines.push(line); return }
    if (!line.trim()) { elements.push(<div key={i} className="h-3" />); return }
    
    if (line.startsWith('### ')) {
      elements.push(<h4 key={i} className="font-semibold text-gray-900 mt-4 mb-2">{line.slice(4)}</h4>)
      return
    }
    if (line.startsWith('## ')) {
      elements.push(<h3 key={i} className="font-semibold text-gray-900 text-lg mt-4 mb-2">{line.slice(3)}</h3>)
      return
    }
    if (line.startsWith('# ')) {
      elements.push(<h2 key={i} className="font-bold text-gray-900 text-xl mt-4 mb-2">{line.slice(2)}</h2>)
      return
    }
    
    if (line.match(/^[\-\*]\s/)) {
      elements.push(
        <div key={i} className="flex gap-2 my-1">
          <span className="text-gray-400 select-none">•</span>
          <span>{formatInlineText(line.slice(2))}</span>
        </div>
      )
      return
    }
    
    if (line.match(/^\d+\.\s/)) {
      const num = line.match(/^(\d+)\./)[1]
      elements.push(
        <div key={i} className="flex gap-2 my-1">
          <span className="text-gray-400 select-none w-5">{num}.</span>
          <span>{formatInlineText(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      )
      return
    }
    
    elements.push(<p key={i} className="my-1">{formatInlineText(line)}</p>)
  })
  
  if (inCodeBlock && codeLines.length > 0) {
    elements.push(
      <pre key="code-final" className="my-3 p-4 bg-gray-900 text-gray-100 rounded-xl text-sm font-mono overflow-x-auto">
        <code>{codeLines.join('\n')}</code>
      </pre>
    )
  }
  
  return <div className="text-[15px] leading-relaxed">{elements}</div>
}

function formatInlineText(text) {
  if (!text) return text
  const segments = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
  return segments.map((segment, i) => {
    if (segment.startsWith('`') && segment.endsWith('`')) {
      return <code key={i} className="px-1.5 py-0.5 bg-gray-100/80 text-gray-800 rounded text-sm font-mono">{segment.slice(1, -1)}</code>
    }
    if (segment.startsWith('**') && segment.endsWith('**')) {
      return <strong key={i} className="font-semibold">{segment.slice(2, -2)}</strong>
    }
    return segment
  })
}

function SessionCard({ session, isSelected, onClick }) {
  const formatTime = (ts) => {
    if (!ts) return ''
    const date = new Date(ts)
    const now = new Date()
    const diff = now - date
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 text-left transition-all min-h-[56px] ${
        isSelected 
          ? 'bg-gray-900/90 text-white rounded-xl mx-1' 
          : 'hover:bg-white/50 rounded-xl mx-1'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
          session.status === 'active' ? 'bg-green-500' : isSelected ? 'bg-gray-500' : 'bg-gray-300'
        }`} />
        <div className="flex-1 min-w-0">
          <div className={`font-medium truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
            {session.label}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              isSelected ? 'bg-white/20 text-gray-300' : 'bg-gray-100/80 text-gray-600'
            }`}>
              {session.channel || session.kind || 'main'}
            </span>
            {session.updatedAt && (
              <span className={`text-xs ${isSelected ? 'text-gray-400' : 'text-gray-400'}`}>
                {formatTime(session.updatedAt)}
              </span>
            )}
          </div>
        </div>
        <ChevronRight size={16} className={isSelected ? 'text-gray-400' : 'text-gray-300'} />
      </div>
    </button>
  )
}

function Sessions() {
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showChat, setShowChat] = useState(false) // mobile: show chat view
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchSessions = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/gateway/tools/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'sessions_list', input: { messageLimit: 3, limit: 20 } })
      })
      if (!response.ok) throw new Error('Failed to fetch sessions')
      const data = await response.json()
      const mapped = (data.sessions || []).map(s => ({
        ...s,
        sessionKey: s.key || s.sessionKey,
        label: s.displayName || s.label || s.key,
        status: s.abortedLastRun ? 'idle' : 'active'
      }))
      setSessions(mapped)
      if (mapped.length > 0 && !selectedSession) {
        setSelectedSession(mapped[0])
        fetchHistory(mapped[0].sessionKey)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async (sessionKey) => {
    setLoadingHistory(true)
    try {
      const response = await fetch('/api/gateway/tools/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'sessions_history', input: { sessionKey, limit: 50, includeTools: false } })
      })
      if (!response.ok) throw new Error('Failed to fetch history')
      const data = await response.json()
      const messages = (data.messages || data || []).map(msg => ({
        role: msg.role,
        content: typeof msg.content === 'string' 
          ? msg.content 
          : (msg.content?.find?.(c => c.type === 'text')?.text || ''),
        timestamp: msg.timestamp
      })).filter(msg => msg.content && msg.role !== 'system')
      setHistory(messages)
      setTimeout(scrollToBottom, 100)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    fetchSessions()
    const interval = setInterval(fetchSessions, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => { scrollToBottom() }, [history])

  const selectSession = (session) => {
    setSelectedSession(session)
    fetchHistory(session.sessionKey)
    setShowChat(true)
  }

  const sendMessage = async () => {
    if (!message.trim() || !selectedSession) return
    setSending(true)
    try {
      await fetch('/api/gateway/tools/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'sessions_send', input: { sessionKey: selectedSession.sessionKey, message: message.trim() } })
      })
      setMessage('')
      setTimeout(() => fetchHistory(selectedSession.sessionKey), 1000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (ts) => {
    if (!ts) return ''
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Mobile: show either list or chat
  const sessionsList = (
    <div className={`${showChat ? 'hidden md:flex' : 'flex'} w-full md:w-72 lg:w-80 flex-col glass-strong md:rounded-2xl md:m-0 h-full flex-shrink-0`}>
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Sessions</h2>
          <button
            onClick={fetchSessions}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">{sessions.length} active</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
        {loading && sessions.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="animate-spin text-gray-300" size={20} />
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-6 text-center">
            <MessageSquare size={24} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No active sessions</p>
          </div>
        ) : (
          sessions.map(session => (
            <SessionCard
              key={session.sessionKey}
              session={session}
              isSelected={selectedSession?.sessionKey === session.sessionKey}
              onClick={() => selectSession(session)}
            />
          ))
        )}
      </div>
    </div>
  )

  const chatArea = (
    <div className={`${!showChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col glass-strong md:rounded-2xl md:ml-3 h-full`}>
      {selectedSession ? (
        <>
          <div className="px-4 md:px-6 py-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowChat(false)}
                  className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedSession.label}</h2>
                  <p className="text-sm text-gray-500">
                    {selectedSession.model || 'claude'} · {selectedSession.channel || 'direct'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => fetchHistory(selectedSession.sessionKey)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <RefreshCw size={16} className={loadingHistory ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white/30">
            <div className="max-w-2xl mx-auto py-4 md:py-6 px-3 md:px-4">
              {loadingHistory ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="animate-spin text-gray-300" size={20} />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No messages yet</p>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-6">
                  {history.map((msg, i) => (
                    <div key={i} className={`flex gap-2 md:gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      {msg.role === 'assistant' ? (
                        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
                          <span className="text-white text-sm">🦏</span>
                        </div>
                      ) : (
                        <div 
                          className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center relative"
                          style={{
                            background: 'linear-gradient(145deg, #f0f0f0 0%, #d4d4d4 25%, #a8a8a8 50%, #c0c0c0 75%, #e8e8e8 100%)',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.8)',
                            border: '1px solid rgba(0,0,0,0.15)'
                          }}
                        >
                          <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 50%)', pointerEvents: 'none' }} />
                          <span className="relative text-[9px] font-bold tracking-tight" style={{ color: '#404040', textShadow: '0 1px 0 rgba(255,255,255,0.6)' }}>+ME</span>
                        </div>
                      )}
                      
                      <div className={`flex-1 min-w-0 ${msg.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                        <div className={`rounded-2xl px-3 md:px-4 py-3 ${
                          msg.role === 'assistant'
                            ? 'glass'
                            : 'bg-gray-900/90 text-white'
                        }`} style={{ maxWidth: msg.role === 'user' ? '85%' : '100%' }}>
                          {msg.role === 'assistant' ? (
                            <MessageContent content={msg.content} />
                          ) : (
                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>
                        {msg.timestamp && (
                          <p className="text-xs text-gray-400 mt-1.5 px-1">{formatTime(msg.timestamp)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-white/20 bg-white/50">
            <div className="max-w-2xl mx-auto p-3 md:p-4">
              <div className="flex gap-2 md:gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Send a message..."
                  className="flex-1 px-4 py-3 bg-white/70 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 text-[16px] placeholder:text-gray-400"
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim() || sending}
                  className="px-4 md:px-5 py-3 bg-gray-900/90 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
                >
                  {sending ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={28} className="text-gray-400" />
            </div>
            <p className="font-medium text-gray-900">Select a session</p>
            <p className="text-sm text-gray-500 mt-1">View chat history and send messages</p>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex h-full p-0 md:p-0">
      {sessionsList}
      {chatArea}
    </div>
  )
}

export default Sessions
