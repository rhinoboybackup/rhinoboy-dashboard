# Deploying RhinoBoy Dashboard

## Local Development with PM2 (Recommended)

PM2 keeps the server alive — auto-restarts on crash, memory limits, logging.

```bash
# Start with PM2
npm run pm2:start

# Check status
npm run pm2:status

# View logs
npm run pm2:logs

# Restart
npm run pm2:restart

# Stop
npm run pm2:stop
```

### Auto-start on boot (macOS)

Run this once to enable auto-start:
```bash
sudo env PATH=$PATH:/opt/homebrew/Cellar/node@22/22.22.0/bin /opt/homebrew/lib/node_modules/pm2/bin/pm2 startup launchd -u rhinoboybot_virtual --hp /Users/rhinoboybot_virtual
```

---

The dashboard is a React frontend + Express API server that connects to an OpenClaw gateway.

## Prerequisites

- Node.js 20+
- An OpenClaw gateway running somewhere accessible
- Gateway URL and authentication token

## Quick Start (Any Server)

```bash
# Clone/copy the app directory
cd rhinoboy-dashboard/app

# Install dependencies
npm install

# Build frontend
npm run build

# Set environment variables
export GATEWAY_URL="http://your-openclaw-server:18789"
export GATEWAY_TOKEN="your-gateway-token"
export WORKSPACE="/path/to/workspace"

# Start production server
npm start
```

The dashboard will be available at `http://localhost:3000`

---

## Docker Deployment

### Build and Run

```bash
# Build the image
docker build -t rhinoboy-dashboard .

# Run with environment variables
docker run -d \
  -p 3000:3000 \
  -e GATEWAY_URL="http://your-openclaw-server:18789" \
  -e GATEWAY_TOKEN="your-token" \
  -e WORKSPACE="/workspace" \
  -v /your/local/workspace:/workspace \
  --name rhinoboy \
  rhinoboy-dashboard
```

### Docker Compose (Recommended)

```bash
# Create .env from example
cp .env.example .env
# Edit .env with your values

# Start
docker-compose up -d
```

---

## Platform-Specific Guides

### Railway

1. Push to GitHub
2. Connect repo to Railway
3. Set environment variables:
   - `GATEWAY_URL`
   - `GATEWAY_TOKEN`
   - `WORKSPACE=/workspace`
4. Railway auto-detects Dockerfile

### Render

1. Create new Web Service
2. Connect GitHub repo
3. Set:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Add environment variables

### Fly.io

```bash
# Install flyctl
fly launch

# Set secrets
fly secrets set GATEWAY_URL="https://..." GATEWAY_TOKEN="..."

# Deploy
fly deploy
```

### Vercel (Frontend Only)

Vercel works for the frontend, but you'd need to deploy the API separately.

```bash
# Deploy frontend
vercel

# API must be deployed elsewhere (Railway, Render, etc.)
```

### VPS (Ubuntu/Debian)

```bash
# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Clone and setup
git clone <your-repo>
cd rhinoboy-dashboard/app
npm install
npm run build

# Create systemd service
sudo tee /etc/systemd/system/rhinoboy.service << EOF
[Unit]
Description=RhinoBoy Dashboard
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/rhinoboy-dashboard/app
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=GATEWAY_URL=http://localhost:18789
Environment=GATEWAY_TOKEN=your-token
Environment=WORKSPACE=/opt/workspace

[Install]
WantedBy=multi-user.target
EOF

# Start service
sudo systemctl enable rhinoboy
sudo systemctl start rhinoboy

# Reverse proxy with nginx
sudo apt install nginx
# Add nginx config for your domain
```

---

## Connecting to Remote OpenClaw

If your OpenClaw gateway is on a different machine:

1. **Expose the gateway** - OpenClaw listens on port 18789 by default
2. **Secure the connection** - Use a reverse proxy with HTTPS
3. **Set GATEWAY_URL** - Point to your exposed gateway

Example with ngrok (for testing):
```bash
# On the machine running OpenClaw
ngrok http 18789

# Use the ngrok URL as GATEWAY_URL
export GATEWAY_URL="https://abc123.ngrok.io"
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | Server port |
| `NODE_ENV` | No | development | `production` for deployed instances |
| `GATEWAY_URL` | Yes | localhost:18789 | OpenClaw gateway URL |
| `GATEWAY_TOKEN` | Yes | - | Gateway auth token |
| `WORKSPACE` | No | - | Path for file browser |

---

## Security Notes

1. **Never expose GATEWAY_TOKEN** - Keep it in environment variables
2. **Use HTTPS** - Always use TLS in production
3. **Restrict access** - Add authentication if exposing publicly
4. **Firewall** - Limit who can reach the gateway port

---

## Troubleshooting

### "Cannot connect to gateway"
- Check GATEWAY_URL is correct
- Ensure OpenClaw is running
- Check firewall allows the connection

### "Unauthorized"
- Verify GATEWAY_TOKEN matches your OpenClaw config
- Check token hasn't expired

### "File browser empty"
- Set WORKSPACE to a valid directory
- Ensure the process has read permissions
