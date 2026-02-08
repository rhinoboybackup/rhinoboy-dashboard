// Typing Indicator / Shimmer Effect for Agent Responses

export function TypingIndicator({ message = 'Generating...' }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
        <span className="text-white text-sm">🦏</span>
      </div>
      <div className="flex-1 bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm text-gray-600">{message}</span>
        </div>
      </div>
    </div>
  );
}

export function ShimmerLoader({ lines = 3 }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 opacity-50">
        <span className="text-white text-sm">🦏</span>
      </div>
      <div className="flex-1 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer"
            style={{ 
              width: i === lines - 1 ? '60%' : '100%',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s ease-in-out infinite'
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function QueueStatus({ tasks = [] }) {
  if (tasks.length === 0) return null;

  return (
    <div className="glass-strong rounded-xl p-3 mb-4 border border-blue-200/50">
      <div className="flex items-center gap-2">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-8 h-8 bg-blue-500/20 rounded-full animate-ping" />
          <div className="relative w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{tasks.length}</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">Processing {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}...</div>
          <div className="text-xs text-gray-500 truncate">{tasks[0]?.description || 'Working...'}</div>
        </div>
      </div>
      {tasks.length > 1 && (
        <div className="mt-2 pt-2 border-t border-gray-200/50 space-y-1">
          {tasks.slice(1, 3).map((task, idx) => (
            <div key={idx} className="text-xs text-gray-500 flex items-center gap-2">
              <div className="w-1 h-1 bg-gray-400 rounded-full" />
              <span className="truncate">{task.description}</span>
            </div>
          ))}
          {tasks.length > 3 && (
            <div className="text-xs text-gray-400 pl-3">
              +{tasks.length - 3} more...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Add shimmer animation to global CSS
const shimmerStyles = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.animate-shimmer {
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
}
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = shimmerStyles;
  document.head.appendChild(styleSheet);
}
