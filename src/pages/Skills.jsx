import { useState, useEffect } from 'react'
import { 
  Zap, RefreshCw, Play, FileText, ExternalLink, Clock, 
  CheckCircle, XCircle, AlertCircle, Folder, Code, Book
} from 'lucide-react'

export default function Skills() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSkill, setSelectedSkill] = useState(null)

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/skills/list')
      if (!response.ok) throw new Error('Failed to load skills')
      const data = await response.json()
      setSkills(data.skills || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openSkillFile = (skillPath) => {
    window.location.href = `/#/?path=${encodeURIComponent(skillPath)}`
  }

  const getStatusBadge = (status) => {
    const badges = {
      active: { icon: CheckCircle, bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
      inactive: { icon: XCircle, bg: 'bg-gray-100', text: 'text-gray-600', label: 'Inactive' },
      error: { icon: AlertCircle, bg: 'bg-red-100', text: 'text-red-700', label: 'Error' }
    }
    const badge = badges[status] || badges.inactive
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon size={14} />
        {badge.label}
      </span>
    )
  }

  const getCategoryBadge = (category) => {
    const categories = {
      automation: { bg: 'bg-purple-100', text: 'text-purple-700' },
      design: { bg: 'bg-pink-100', text: 'text-pink-700' },
      security: { bg: 'bg-red-100', text: 'text-red-700' },
      utility: { bg: 'bg-blue-100', text: 'text-blue-700' },
      infrastructure: { bg: 'bg-gray-100', text: 'text-gray-700' }
    }
    const cat = categories[category?.toLowerCase()] || categories.utility
    
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${cat.bg} ${cat.text}`}>
        {category || 'Utility'}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading skills...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="glass-strong rounded-2xl p-6 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white shadow-lg">
              <Zap size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Skills</h1>
              <p className="text-sm text-gray-500 mt-0.5">Available agent capabilities and tools</p>
            </div>
          </div>
          <button
            onClick={fetchSkills}
            className="flex items-center gap-2 px-4 py-2 bg-white/50 hover:bg-white/80 text-gray-700 rounded-xl border border-gray-200/50 transition-all min-h-[44px]"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50/80 border border-red-100 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/50 rounded-xl border border-gray-200/50">
            <div className="text-2xl font-bold text-gray-900">{skills.length}</div>
            <div className="text-sm text-gray-500 mt-1">Total Skills</div>
          </div>
          <div className="p-4 bg-white/50 rounded-xl border border-gray-200/50">
            <div className="text-2xl font-bold text-green-600">
              {skills.filter(s => s.status === 'active').length}
            </div>
            <div className="text-sm text-gray-500 mt-1">Active</div>
          </div>
          <div className="p-4 bg-white/50 rounded-xl border border-gray-200/50">
            <div className="text-2xl font-bold text-gray-400">
              {skills.filter(s => s.status !== 'active').length}
            </div>
            <div className="text-sm text-gray-500 mt-1">Inactive</div>
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className="glass rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedSkill(selectedSkill?.name === skill.name ? null : skill)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{skill.icon || '⚡'}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{skill.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(skill.status)}
                      {getCategoryBadge(skill.category)}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {skill.description || 'No description available'}
              </p>

              {/* Metadata */}
              <div className="space-y-2 mb-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Folder size={14} />
                  <code className="text-xs bg-gray-100/80 px-2 py-1 rounded">{skill.location}</code>
                </div>
                {skill.lastModified && (
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    Last modified: {new Date(skill.lastModified).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200/50">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openSkillFile(skill.location + '/SKILL.md')
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-900/90 hover:bg-gray-800 text-white text-sm rounded-lg transition-all min-h-[40px]"
                >
                  <Book size={14} />
                  View SKILL.md
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openSkillFile(skill.location)
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-white/50 hover:bg-white/80 text-gray-700 text-sm rounded-lg border border-gray-200/50 transition-all min-h-[40px]"
                >
                  <Folder size={14} />
                  Open Folder
                </button>
              </div>

              {/* Expanded Details */}
              {selectedSkill?.name === skill.name && skill.triggers && (
                <div className="mt-4 pt-4 border-t border-gray-200/50">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    Triggers
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {skill.triggers.map((trigger, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                      >
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {skills.length === 0 && !loading && (
          <div className="glass rounded-2xl p-12 text-center">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Skills Found</h3>
            <p className="text-sm text-gray-500 mb-4">
              Skills are located in the <code className="bg-gray-100 px-2 py-1 rounded text-xs">skills/</code> directory
            </p>
            <button
              onClick={() => window.location.href = '/#/?path=/skills'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900/90 hover:bg-gray-800 text-white rounded-xl transition-all"
            >
              <Folder size={16} />
              Browse Skills Folder
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
