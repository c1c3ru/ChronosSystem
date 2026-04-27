module.exports = {
  apps: [
    {
      name: 'chronos',
      script: 'node_modules/.bin/next',
      args: 'start -p 5000 -H 0.0.0.0',
      cwd: '/home/nac/ChronosSystem',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--dns-result-order=ipv4first',
      },
    },
  ],
}
