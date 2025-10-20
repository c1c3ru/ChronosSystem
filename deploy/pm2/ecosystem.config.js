module.exports = {
  apps: [
    {
      name: 'chronos-backend',
      script: 'dist/main.js',
      cwd: '/home/deppi/ChronosSystem/backend',
      instances: 1, // ou 'max' para usar todos os cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      // Logs
      log_file: '/var/log/chronos/combined.log',
      out_file: '/var/log/chronos/out.log',
      error_file: '/var/log/chronos/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Restart policy
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',
      
      // Monitoring
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'dist'],
      
      // Advanced settings
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Health check
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
    }
  ],

  deploy: {
    production: {
      user: 'root',
      host: 'seu-servidor.com',
      ref: 'origin/main',
      repo: 'https://github.com/seu-usuario/ChronosSystem.git',
      path: '/var/www/chronos',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};
