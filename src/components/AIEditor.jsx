import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, Minimize2, Maximize2, MessageSquare, Save, Loader2 } from 'lucide-react'

const AI_ACTIONS = [
  { id: 'shorten', label: 'Shorten', prompt: 'Make this more concise while preserving the key points:' },
  { id: 'lengthen', label: 'Expand', prompt: 'Expand this with more detail and context:' },
  { id: 'improve', label: 'Improve', prompt: 'Improve the clarity and quality of this text:' },
  { id: 'fix', label: 'Fix', prompt: 'Fix any grammar, spelling, or formatting issues in:' },
]

export default function AIEditor({ 
  value, 
  onChange, 
  onSave,
  fileName,
  workspaceContext,
  saving = false,
  lastSaved = null
}) {
  const textareaRef = useRef(null)
  const [selection, setSelection] = useState({ start: 0, end: 0, text: '' })
  const [showAIBar, setShowAIBar] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [showCustomPrompt, setShowCustomPrompt] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  // Track selection
  const handleSelect = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = value.substring(start, end)
    
    setSelection({ start, end, text })
    setShowAIBar(text.length > 0)
  }

  // Autosave with debounce
  useEffect(() => {
    if (!autoSaveEnabled || !hasUnsavedChanges) return
    
    const timer = setTimeout(() => {
      onSave?.()
      setHasUnsavedChanges(false)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [value, autoSaveEnabled, hasUnsavedChanges, onSave])

  // Track changes
  const handleChange = (e) => {
    onChange(e.target.value)
    setHasUnsavedChanges(true)
  }

  // Call AI for text transformation
  const callAI = async (prompt, selectedText) => {
    setAiLoading(true)
    try {
      const context = workspaceContext ? `Context: This is from ${fileName} in a workspace that contains: ${workspaceContext}\n\n` : ''
      
      const response = await fetch('/api/ai/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${context}${prompt}\n\n"${selectedText}"`,
          maxTokens: 1000
        })
      })
      
      if (!response.ok) throw new Error('AI request failed')
      
      const data = await response.json()
      return data.result || data.text || selectedText
    } catch (err) {
      console.error('AI error:', err)
      return selectedText
    } finally {
      setAiLoading(false)
    }
  }

  // Apply AI action
  const applyAction = async (action) => {
    if (!selection.text) return
    
    const result = await callAI(action.prompt, selection.text)
    
    // Replace selection with result
    const newValue = value.substring(0, selection.start) + result + value.substring(selection.end)
    onChange(newValue)
    setHasUnsavedChanges(true)
    setShowAIBar(false)
    
    // Update cursor position
    setTimeout(() => {
      const textarea = textareaRef.current
      if (textarea) {
        textarea.focus()
        textarea.setSelectionRange(selection.start, selection.start + result.length)
      }
    }, 0)
  }

  // Custom prompt
  const applyCustomPrompt = async () => {
    if (!customPrompt.trim() || !selection.text) return
    
    const result = await callAI(customPrompt, selection.text)
    
    const newValue = value.substring(0, selection.start) + result + value.substring(selection.end)
    onChange(newValue)
    setHasUnsavedChanges(true)
    setShowAIBar(false)
    setShowCustomPrompt(false)
    setCustomPrompt('')
  }

  // Insert at cursor (for AI suggestions without selection)
  const insertAtCursor = async (prompt) => {
    setAiLoading(true)
    try {
      const context = workspaceContext ? `Context: This is ${fileName}. Workspace contains: ${workspaceContext}\n\n` : ''
      const cursorPos = textareaRef.current?.selectionStart || value.length
      const surroundingText = value.substring(Math.max(0, cursorPos - 200), Math.min(value.length, cursorPos + 200))
      
      const response = await fetch('/api/ai/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${context}${prompt}\n\nSurrounding text for context:\n"${surroundingText}"\n\nGenerate content to insert at the cursor position.`,
          maxTokens: 500
        })
      })
      
      if (!response.ok) throw new Error('AI request failed')
      
      const data = await response.json()
      const result = data.result || data.text || ''
      
      const newValue = value.substring(0, cursorPos) + result + value.substring(cursorPos)
      onChange(newValue)
      setHasUnsavedChanges(true)
    } catch (err) {
      console.error('AI error:', err)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="relative h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-gray-600">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="w-3.5 h-3.5 rounded"
            />
            Autosave
          </label>
          {hasUnsavedChanges && (
            <span className="text-amber-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              Unsaved
            </span>
          )}
          {saving && (
            <span className="text-blue-600 flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" />
              Saving...
            </span>
          )}
          {lastSaved && !hasUnsavedChanges && !saving && (
            <span className="text-gray-400">
              Saved {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
        </div>
        <button
          onClick={() => onSave?.()}
          disabled={!hasUnsavedChanges || saving}
          className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-40"
        >
          <Save size={12} />
          Save
        </button>
      </div>

      {/* Editor */}
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onSelect={handleSelect}
          onMouseUp={handleSelect}
          onKeyUp={handleSelect}
          className="w-full h-full p-4 font-mono text-sm border-0 focus:outline-none focus:ring-0 resize-none bg-white"
          spellCheck={false}
          placeholder="Start typing..."
        />

        {/* AI Floating Bar */}
        {showAIBar && selection.text && (
          <div className="absolute left-4 right-4 bottom-4 bg-white rounded-xl shadow-lg border border-gray-200 p-2 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <Sparkles size={16} className="text-blue-500 ml-2" />
            
            {AI_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => applyAction(action)}
                disabled={aiLoading}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                {action.label}
              </button>
            ))}
            
            <div className="h-6 w-px bg-gray-200" />
            
            {showCustomPrompt ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyCustomPrompt()}
                  placeholder="Custom instruction..."
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={applyCustomPrompt}
                  disabled={!customPrompt.trim() || aiLoading}
                  className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Apply
                </button>
                <button
                  onClick={() => {
                    setShowCustomPrompt(false)
                    setCustomPrompt('')
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCustomPrompt(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MessageSquare size={14} />
                Custom
              </button>
            )}
            
            {aiLoading && (
              <Loader2 size={16} className="animate-spin text-blue-500 ml-2" />
            )}
            
            <button
              onClick={() => setShowAIBar(false)}
              className="p-1.5 text-gray-400 hover:text-gray-600 ml-auto"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
