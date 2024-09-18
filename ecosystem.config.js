module.exports = {
	apps: [
		{
			name: "MyApp", // Name of the first application
			script: "./index.js", // Entry point of the first application
			instances: 1, // Number of instances to run (can be set to 'max' for maximum CPU usage)
			autorestart: true, // Enable auto-restarts on crashes
			watch: ["./index.js", "./routes"], // Only watch the necessary files
			ignore_watch: ["node_modules", "log"], // Ignore watching these folders to avoid unnecessary restarts
			max_memory_restart: "500M", // Restart if memory exceeds 500MB
			env: {
				NODE_ENV: "development", // Environment variables for development
				PORT: 3000, // Default port for development
			},
			env_production: {
				NODE_ENV: "production", // Environment variables for production
				PORT: 3000, // Default port for production
				watch: false, // Disable watch mode in production
			},
		},
		{
			name: "MyCdnApp", // Name of the second application
			script: "./cdn/index.js", // Entry point of the second application
			instances: 1, // Number of instances to run
			autorestart: true, // Enable auto-restarts on crashes
			watch: ["./cdn/index.js"], // Watch necessary files for the second app
			ignore_watch: ["node_modules", "log"], // Ignore watching these folders
			max_memory_restart: "500M", // Restart if memory exceeds 500MB
			env: {
				NODE_ENV: "development", // Environment variables for development
				PORT: 4000, // Port for CDN app in development
			},
			env_production: {
				NODE_ENV: "production", // Environment variables for production
				PORT: 4000, // Port for CDN app in production
				watch: false, // Disable watch mode in production
			},
		},
	],
};
