const path = require('path');

const backendDir = path.join(__dirname, '..', 'backend');

module.exports = {
  apps: [
    {
      name: 'race-api',
      cwd: backendDir,
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
      error_file: path.join(backendDir, 'logs', 'pm2-error.log'),
      out_file: path.join(backendDir, 'logs', 'pm2-out.log'),
      merge_logs: true,
      time: true,
    },
  ],
};
