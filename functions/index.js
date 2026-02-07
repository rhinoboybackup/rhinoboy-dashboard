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

// Export as Firebase function
export const api = onRequest({ region: 'us-east1' }, app);
