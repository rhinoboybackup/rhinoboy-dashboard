module.exports = {
  apps: [{
    name: 'rhinoboy-dashboard',
    script: 'server.js',
    cwd: '/Users/rhinoboybot_virtual/.openclaw/workspace/projects/rhinoboy-dashboard/app',
    
    // Auto-restart settings
    watch: false,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 1000,
    
    // Environment
    env: {
      NODE_ENV: 'development',
      PORT: 3001,
      GATEWAY_URL: 'http://localhost:18789',
      GATEWAY_TOKEN: '5bc6c24c99d131366bf6f3b2a71a0c68ba407fada0b5cf10',
      WORKSPACE: '/Users/rhinoboybot_virtual/.openclaw/workspace'
    },
    
    // Logging
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: '/Users/rhinoboybot_virtual/.openclaw/workspace/logs/dashboard-error.log',
    out_file: '/Users/rhinoboybot_virtual/.openclaw/workspace/logs/dashboard-out.log',
    merge_logs: true,
    
    // Memory management - restart if exceeds 500MB
    max_memory_restart: '500M',
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
