import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'fs';
import { join, relative, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;
const WORKSPACE = process.env.WORKSPACE || '/Users/rhinoboybot_virtual/.openclaw/workspace';
const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:18789';
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN || '5bc6c24c99d131366bf6f3b2a71a0c68ba407fada0b5cf10';
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS - allow Firebase Hosting and localhost
app.use(cors({
  origin: [
    'https://rhinoboybot-bashboard.web.app',
    'https://rhinoboybot-bashboard.firebaseapp.com',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://100.82.83.86:3001'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// In production, serve static files from dist/
if (NODE_ENV === 'production') {
  const distPath = join(__dirname, 'dist');
  app.use(express.static(distPath));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, env: NODE_ENV, gateway: GATEWAY_URL });
});

// Read a file - handle path via query param
app.get('/api/files', (req, res) => {
  try {
    const relativePath = req.query.path || '';
    const filePath = join(WORKSPACE, relativePath);
    
    if (!filePath.startsWith(WORKSPACE)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (!existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      const files = readdirSync(filePath).map(name => {
        const fullPath = join(filePath, name);
        const s = statSync(fullPath);
        return {
          name,
          path: relative(WORKSPACE, fullPath),
          type: s.isDirectory() ? 'folder' : 'file',
          size: s.size,
          modified: s.mtime
        };
      });
      return res.json({ type: 'directory', files });
    }
    const content = readFileSync(filePath, 'utf-8');
    res.json({ type: 'file', content, path: relative(WORKSPACE, filePath) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Write a file
app.put('/api/files', (req, res) => {
  try {
    const relativePath = req.query.path || '';
    const filePath = join(WORKSPACE, relativePath);
    
    if (!filePath.startsWith(WORKSPACE)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Create parent directory if needed
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    writeFileSync(filePath, req.body.content, 'utf-8');
    res.json({ ok: true, path: relative(WORKSPACE, filePath) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Gateway Tools Invoke - primary endpoint for tool invocation
async function handleToolsInvoke(req, res) {
  try {
    const { tool, args, input } = req.body;
    const toolArgs = args || input || {};
    
    console.log(`[tools/invoke] ${tool}`, JSON.stringify(toolArgs).slice(0, 100));
    
    const response = await fetch(`${GATEWAY_URL}/tools/invoke`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
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
      console.error(`[tools/invoke] Error:`, data);
      res.status(400).json(data);
    }
  } catch (err) {
    console.error(`[tools/invoke] Exception:`, err.message);
    res.status(500).json({ error: err.message });
  }
}

app.post('/api/tools/invoke', handleToolsInvoke);
app.post('/api/gateway/tools/invoke', handleToolsInvoke);

// Cron jobs endpoint
app.get('/api/cron/jobs', async (req, res) => {
  try {
    const response = await fetch(`${GATEWAY_URL}/tools/invoke`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
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

// AI Transform endpoint
app.post('/api/ai/transform', async (req, res) => {
  try {
    const { prompt, maxTokens = 1000 } = req.body;
    
    const response = await fetch(`${GATEWAY_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`AI request failed: ${err}`);
    }
    
    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || '';
    res.json({ ok: true, result });
  } catch (err) {
    console.error('AI transform error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Gateway status
app.get('/api/gateway/status', async (req, res) => {
  try {
    const response = await fetch(`${GATEWAY_URL}/status`, {
      headers: { 'Authorization': `Bearer ${GATEWAY_TOKEN}` }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message, ok: false });
  }
});

// General status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    ok: true,
    workspace: WORKSPACE,
    gateway: GATEWAY_URL,
    env: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API Keys management
const KEYS_FILE = join(WORKSPACE, 'config/keys.json');

app.get('/api/keys', (req, res) => {
  try {
    if (!existsSync(KEYS_FILE)) {
      return res.json({ keys: {} });
    }
    const keys = JSON.parse(readFileSync(KEYS_FILE, 'utf-8'));
    res.json({ keys });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/keys', (req, res) => {
  try {
    const { keys } = req.body;
    const dir = dirname(KEYS_FILE);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2), 'utf-8');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tool usage tracking
const USAGE_FILE = join(WORKSPACE, 'config/tool-usage.json');

app.get('/api/tools/usage', (req, res) => {
  try {
    if (!existsSync(USAGE_FILE)) {
      return res.json({ usage: {} });
    }
    const usage = JSON.parse(readFileSync(USAGE_FILE, 'utf-8'));
    res.json({ usage });
  } catch (err) {
    res.json({ usage: {} });
  }
});

app.post('/api/tools/usage/track', (req, res) => {
  try {
    const { tool, tokens, cost } = req.body;
    let usage = {};
    if (existsSync(USAGE_FILE)) {
      usage = JSON.parse(readFileSync(USAGE_FILE, 'utf-8'));
    }
    if (!usage[tool]) {
      usage[tool] = { calls: 0, tokens: 0, cost: 0 };
    }
    usage[tool].calls += 1;
    usage[tool].tokens += tokens || 0;
    usage[tool].cost += cost || 0;
    usage[tool].lastUsed = new Date().toISOString();
    
    const dir = dirname(USAGE_FILE);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(USAGE_FILE, JSON.stringify(usage, null, 2), 'utf-8');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Skills API
app.get('/api/skills/list', (req, res) => {
  try {
    const skillsDir = join(WORKSPACE, 'skills');
    if (!existsSync(skillsDir)) {
      return res.json({ skills: [] });
    }
    
    const skills = [];
    const dirs = readdirSync(skillsDir);
    
    for (const dir of dirs) {
      const skillPath = join(skillsDir, dir);
      const stat = statSync(skillPath);
      if (!stat.isDirectory()) continue;
      
      const skillMdPath = join(skillPath, 'SKILL.md');
      let description = 'No description available';
      let triggers = [];
      let category = 'utility';
      
      if (existsSync(skillMdPath)) {
        const content = readFileSync(skillMdPath, 'utf-8');
        // Extract description from first paragraph or heading
        const descMatch = content.match(/(?:^|\n)(?:#[^\n]+\n+)?([^\n#]+)/);
        if (descMatch) {
          description = descMatch[1].trim().substring(0, 200);
        }
        
        // Extract triggers
        const triggersMatch = content.match(/(?:triggers?|keywords?|usage):\s*([^\n]+)/i);
        if (triggersMatch) {
          triggers = triggersMatch[1].split(/[,;]/).map(t => t.trim()).filter(Boolean);
        }
        
        // Detect category from content
        if (content.match(/security|audit|firewall/i)) category = 'security';
        else if (content.match(/design|ui|ux|interface/i)) category = 'design';
        else if (content.match(/deploy|build|infrastructure/i)) category = 'infrastructure';
        else if (content.match(/cron|schedule|automat/i)) category = 'automation';
      }
      
      skills.push({
        name: dir,
        location: `skills/${dir}`,
        description,
        triggers,
        category,
        status: existsSync(skillMdPath) ? 'active' : 'inactive',
        lastModified: stat.mtime,
        icon: getSkillIcon(dir)
      });
    }
    
    res.json({ skills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function getSkillIcon(skillName) {
  const icons = {
    'culture-radar': '📡',
    'prd-designer': '📋',
    'healthcheck': '🔒',
    'weather': '🌤️',
    'firebase-deploy': '🔥',
    'cloudflare-browser': '☁️',
    'liquid-glass': '💎',
    'firebase-security-infrastructure': '🛡️'
  };
  return icons[skillName] || '⚡';
}

// Heartbeat API
const HEARTBEAT_LOG_FILE = join(WORKSPACE, 'memory/heartbeat.log');

app.get('/api/heartbeat/logs', (req, res) => {
  try {
    if (!existsSync(HEARTBEAT_LOG_FILE)) {
      return res.json({ logs: [], lastRun: null });
    }
    
    const content = readFileSync(HEARTBEAT_LOG_FILE, 'utf-8');
    const lines = content.split('\n').filter(Boolean).reverse().slice(0, 50);
    
    const logs = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch {
        const match = line.match(/(\d{4}-\d{2}-\d{2}T[\d:]+Z?)\s+(SUCCESS|ERROR|INFO):\s+(.+)/);
        if (match) {
          return {
            timestamp: match[1],
            status: match[2].toLowerCase(),
            message: match[3],
            action: 'Heartbeat'
          };
        }
        return { timestamp: new Date().toISOString(), status: 'info', message: line };
      }
    });
    
    const lastRun = logs.length > 0 ? logs[0].timestamp : null;
    res.json({ logs, lastRun });
  } catch (err) {
    res.json({ logs: [], lastRun: null });
  }
});

app.get('/api/heartbeat/stats', (req, res) => {
  try {
    if (!existsSync(HEARTBEAT_LOG_FILE)) {
      return res.json({ successCount: 0, errorCount: 0, avgDuration: 0 });
    }
    
    const content = readFileSync(HEARTBEAT_LOG_FILE, 'utf-8');
    const lines = content.split('\n').filter(Boolean);
    
    let successCount = 0;
    let errorCount = 0;
    let totalDuration = 0;
    let durationCount = 0;
    
    for (const line of lines) {
      if (line.includes('SUCCESS')) successCount++;
      if (line.includes('ERROR')) errorCount++;
      
      const durationMatch = line.match(/duration:\s*(\d+\.?\d*)/i);
      if (durationMatch) {
        totalDuration += parseFloat(durationMatch[1]);
        durationCount++;
      }
    }
    
    const avgDuration = durationCount > 0 ? (totalDuration / durationCount).toFixed(2) : 0;
    
    res.json({ successCount, errorCount, avgDuration });
  } catch (err) {
    res.json({ successCount: 0, errorCount: 0, avgDuration: 0 });
  }
});

app.post('/api/heartbeat/run', async (req, res) => {
  try {
    const response = await fetch(`${GATEWAY_URL}/tools/invoke`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tool: 'cron',
        args: { action: 'wake', text: 'Manual heartbeat check', mode: 'now' }
      })
    });
    
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// In production, serve index.html for all non-API routes (SPA fallback)
if (NODE_ENV === 'production') {
  const indexHtml = readFileSync(join(__dirname, 'dist', 'index.html'), 'utf-8');
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      res.type('html').send(indexHtml);
    } else {
      next();
    }
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🦏 RhinoBoy Dashboard running on http://0.0.0.0:${PORT}`);
  console.log(`   Environment: ${NODE_ENV}`);
  console.log(`   Workspace: ${WORKSPACE}`);
  console.log(`   Gateway: ${GATEWAY_URL}`);
});
