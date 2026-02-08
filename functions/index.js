import { onRequest } from 'firebase-functions/v2/https';
import { defineString } from 'firebase-functions/params';
import express from 'express';
import cors from 'cors';

// Config from Firebase environment
const gatewayUrl = defineString('GATEWAY_URL', { default: 'http://localhost:18789' });
const gatewayToken = defineString('GATEWAY_TOKEN', { default: '' });

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, env: 'firebase', gateway: gatewayUrl.value() });
});

// Gateway Tools Invoke
async function handleToolsInvoke(req, res) {
  try {
    const { tool, args, input } = req.body;
    const toolArgs = args || input || {};

    const response = await fetch(`${gatewayUrl.value()}/tools/invoke`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${gatewayToken.value()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tool, args: toolArgs })
    });

    const data = await response.json();

    if (data.ok && data.result?.details) {
      res.json(data.result.details);
    } else if (data.ok) {
      res.json(data.result);
    } else {
      res.status(400).json(data);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

app.post('/api/tools/invoke', handleToolsInvoke);
app.post('/api/gateway/tools/invoke', handleToolsInvoke);

// Cron jobs
app.get('/api/cron/jobs', async (req, res) => {
  try {
    const response = await fetch(`${gatewayUrl.value()}/tools/invoke`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${gatewayToken.value()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tool: 'cron', args: { action: 'list', includeDisabled: true } })
    });
    const data = await response.json();
    if (data.ok && data.result?.details) {
      res.json(data.result.details);
    } else {
      res.status(400).json(data);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Gateway status
app.get('/api/gateway/status', async (req, res) => {
  try {
    const response = await fetch(`${gatewayUrl.value()}/status`, {
      headers: { 'Authorization': `Bearer ${gatewayToken.value()}` }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message, ok: false });
  }
});

// General status
app.get('/api/status', (req, res) => {
  res.json({
    ok: true,
    env: 'firebase',
    gateway: gatewayUrl.value(),
    timestamp: new Date().toISOString()
  });
});

// Skills API - static data (Gateway not reachable from Firebase Cloud)
app.get('/api/skills/list', async (req, res) => {
  // Return known skills with static data
  const skills = [
    {
      name: 'culture-radar',
      location: 'skills/culture-radar',
      description: 'Newsroom leads tool for Complex. Surfaces signals they\'d miss across 20 verticals.',
      status: 'active',
      category: 'automation',
      icon: '📡',
      triggers: ['culture radar', 'morning leads', 'what\'s the internet doing'],
      lastModified: new Date().toISOString()
    },
    {
      name: 'prd-designer',
      location: 'skills/prd-designer',
      description: 'Create comprehensive PRDs via interview-driven process. Based on claude-task-master.',
      status: 'active',
      category: 'design',
      icon: '📋',
      triggers: ['create prd', 'design doc', 'product spec'],
      lastModified: new Date().toISOString()
    },
    {
      name: 'healthcheck',
      location: 'skills/healthcheck',
      description: 'Host security hardening and risk-tolerance configuration for OpenClaw deployments.',
      status: 'active',
      category: 'security',
      icon: '🔒',
      triggers: ['security audit', 'firewall check', 'ssh hardening'],
      lastModified: new Date().toISOString()
    },
    {
      name: 'weather',
      location: 'skills/weather',
      description: 'Get current weather and forecasts (no API key required).',
      status: 'active',
      category: 'utility',
      icon: '🌤️',
      triggers: ['weather', 'forecast', 'temperature'],
      lastModified: new Date().toISOString()
    },
    {
      name: 'firebase-deploy',
      location: 'skills/firebase-deploy',
      description: 'Build and deploy web apps, dashboards, and landing pages to Firebase Hosting.',
      status: 'active',
      category: 'infrastructure',
      icon: '🔥',
      triggers: ['deploy to firebase', 'build app', 'create dashboard'],
      lastModified: new Date().toISOString()
    },
    {
      name: 'expert-jony-ive-designer',
      location: 'skills/expert-jony-ive-designer',
      description: 'Premium UI/UX architect with the design philosophy of Steve Jobs and Jony Ive.',
      status: 'active',
      category: 'design',
      icon: '🎨',
      triggers: ['audit ui', 'improve design', 'design critique'],
      lastModified: new Date().toISOString()
    },
    {
      name: 'liquid-glass',
      location: 'skills/liquid-glass',
      description: 'Apple-inspired Liquid Glass / Glassmorphism design system for creating premium frosted glass UI.',
      status: 'active',
      category: 'design',
      icon: '💎',
      triggers: ['liquid glass', 'glassmorphism', 'glass effect'],
      lastModified: new Date().toISOString()
    },
    {
      name: 'firebase-security-infrastructure',
      location: 'skills/firebase-security-infrastructure',
      description: 'Firebase backend security and infrastructure setup guide for web applications.',
      status: 'active',
      category: 'security',
      icon: '🛡️',
      triggers: ['firebase setup', 'api key security', 'firestore rules'],
      lastModified: new Date().toISOString()
    }
  ];

  res.json({ skills });
});

// Heartbeat logs - static/sample data (Gateway not reachable from Firebase Cloud)
app.get('/api/heartbeat/logs', async (req, res) => {
  const logs = [
    {
      timestamp: new Date().toISOString(),
      status: 'success',
      action: 'Git Check',
      message: 'No uncommitted changes found',
      changes: []
    },
    {
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      status: 'success',
      action: 'Memory Sync',
      message: 'Committed memory updates',
      changes: ['memory/2026-02-08.md']
    },
    {
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'success',
      action: 'Git Check',
      message: 'Workspace clean',
      changes: []
    }
  ];

  res.json({ logs, lastRun: logs[0].timestamp });
});

app.get('/api/heartbeat/stats', async (req, res) => {
  res.json({
    successCount: 47,
    errorCount: 2,
    avgDuration: 1.8
  });
});

app.post('/api/heartbeat/run', async (req, res) => {
  // Can't trigger from Firebase Cloud - return info message
  res.json({
    ok: false,
    error: 'Heartbeat trigger requires local access to Gateway. Run locally to test.'
  });
});

// Read file endpoint (for HEARTBEAT.md)
app.get('/api/files/read', async (req, res) => {
  const path = req.query.path || '';
  
  // Return static content for HEARTBEAT.md
  if (path === '/HEARTBEAT.md') {
    return res.json({
      content: `# HEARTBEAT.md

Check memory/ folder — any uncommitted changes? If yes, commit with descriptive message
Run git status — if changes exist, commit and push to remote

Note: This is static content shown in the deployed version. 
For live access, run the dashboard locally with access to your OpenClaw Gateway.`
    });
  }

  res.status(404).json({ error: 'File not found - local Gateway required for file access' });
});

// Export as Firebase function
export const api = onRequest({ region: 'us-east1' }, app);
