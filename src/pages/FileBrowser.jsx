import { useState, useEffect } from 'react'
import { File, Folder, ChevronRight, ChevronDown, Save, RefreshCw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import AIEditor from '../components/AIEditor'

// Core workspace files
const WORKSPACE_FILES = [
  { name: 'SOUL.md', path: 'SOUL.md', type: 'file', icon: '👻' },
  { name: 'USER.md', path: 'USER.md', type: 'file', icon: '👤' },
  { name: 'MEMORY.md', path: 'MEMORY.md', type: 'file', icon: '🧠' },
  { name: 'IDENTITY.md', path: 'IDENTITY.md', type: 'file', icon: '🦏' },
  { name: 'AGENTS.md', path: 'AGENTS.md', type: 'file', icon: '🤖' },
  { name: 'TOOLS.md', path: 'TOOLS.md', type: 'file', icon: '🔧' },
  { name: 'HEARTBEAT.md', path: 'HEARTBEAT.md', type: 'file', icon: '💓' },
  { 
    name: 'memory/', 
    path: 'memory', 
    type: 'folder',
    icon: '📁',
    children: [] // Will be populated dynamically
  },
  { 
    name: 'skills/', 
    path: 'skills', 
    type: 'folder',
    icon: '⚡',
    children: []
  },
]

function FileTree({ files, selectedFile, onSelect, level = 0 }) {
  const [expanded, setExpanded] = useState({})

  const toggleFolder = (path) => {
    setExpanded(prev => ({ ...prev, [path]: !prev[path] }))
  }

  return (
    <ul className="space-y-0.5">
      {files.map((file) => (
        <li key={file.path}>
          {file.type === 'folder' ? (
            <div>
              <button
                onClick={() => toggleFolder(file.path)}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                style={{ paddingLeft: `${level * 12 + 8}px` }}
              >
                {expanded[file.path] ? (
                  <ChevronDown size={14} className="text-gray-400" />
                ) : (
                  <ChevronRight size={14} className="text-gray-400" />
                )}
                <span>{file.icon}</span>
                <span className="font-medium">{file.name}</span>
              </button>
              {expanded[file.path] && file.children && (
                <FileTree
                  files={file.children}
                  selectedFile={selectedFile}
                  onSelect={onSelect}
                  level={level + 1}
                />
              )}
            </div>
          ) : (
            <button
              onClick={() => onSelect(file)}
              className={`flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md transition-colors ${
                selectedFile?.path === file.path
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
              <span className="w-4" /> {/* Spacer for alignment */}
              <span>{file.icon || '📄'}</span>
              <span>{file.name}</span>
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}

function FileBrowser() {
  const [files, setFiles] = useState(WORKSPACE_FILES)
  const [selectedFile, setSelectedFile] = useState(null)
  const [content, setContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState(null)

  // Load file content
  const loadFile = async (file) => {
    if (file.type === 'folder') return
    
    setLoading(true)
    setError(null)
    setSelectedFile(file)
    
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(file.path)}`)
      
      if (!response.ok) throw new Error('Failed to load file')
      
      const data = await response.json()
      const fileContent = data.content || ''
      setContent(fileContent)
      setOriginalContent(fileContent)
      setIsEditing(false)
    } catch (err) {
      setError(err.message)
      setContent('')
    } finally {
      setLoading(false)
    }
  }

  // Save file content
  const saveFile = async () => {
    if (!selectedFile) return
    
    setSaving(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(selectedFile.path)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      
      if (!response.ok) throw new Error('Failed to save file')
      
      setOriginalContent(content)
      setIsEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = content !== originalContent

  return (
    <div className="flex h-full">
      {/* File Tree Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-white overflow-y-auto">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Workspace</h2>
          <p className="text-xs text-gray-500 mt-1">~/.openclaw/workspace</p>
        </div>
        <div className="p-2">
          <FileTree
            files={files}
            selectedFile={selectedFile}
            onSelect={loadFile}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedFile ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-lg">{selectedFile.icon || '📄'}</span>
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedFile.name}</h2>
                  <p className="text-xs text-gray-500">{selectedFile.path}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setContent(originalContent)
                        setIsEditing(false)
                      }}
                      className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveFile}
                      disabled={!hasChanges || saving}
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        hasChanges
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Save size={14} />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="animate-spin text-gray-400" size={24} />
                </div>
              ) : error ? (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                  {error}
                </div>
              ) : isEditing ? (
                <div className="h-full min-h-[400px] border border-gray-200 rounded-lg overflow-hidden">
                  <AIEditor
                    value={content}
                    onChange={setContent}
                    onSave={saveFile}
                    fileName={selectedFile?.name}
                    workspaceContext="SOUL.md, USER.md, MEMORY.md, IDENTITY.md, skills/, memory/"
                    saving={saving}
                  />
                </div>
              ) : (
                <div className="markdown-content prose prose-gray max-w-none">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <File size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select a file to view</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileBrowser
