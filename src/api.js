// API configuration
// In development: proxied through Vite to localhost:3001
// In production: set VITE_API_URL at build time, or defaults to same-origin
export const API_BASE = import.meta.env.VITE_API_URL || '';

export async function apiCall(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}

export async function toolsInvoke(tool, input = {}) {
  return apiCall('/api/tools/invoke', {
    method: 'POST',
    body: JSON.stringify({ tool, input })
  });
}
