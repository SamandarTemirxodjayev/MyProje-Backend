module.exports = {
  apps: [
    {
      name: 'MyApp', // Name of the first application
      script: './index.js', // Entry point of the first application
      instances: 1, // Number of instances to run (can be set to 'max' for maximum CPU usage)
      autorestart: true,
      watch: true, // Enable watch mode if you want PM2 to restart on file changes
      env: {
        NODE_ENV: 'development', // Environment variables
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'MyCdnApp', // Name of the second application
      script: './cdn/index.js', // Entry point of the second application
      instances: 1, // Number of instances to run
      autorestart: true,
      watch: true, // Enable watch mode if needed
      env: {
        NODE_ENV: 'development', // Environment variables
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
