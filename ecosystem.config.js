module.exports = {
	apps: [
		{
			name: "MyApp", // Name of the first application
			script: "./index.js", // Entry point of the first application
			instances: 1, // Number of instances to run (can be set to 'max' for maximum CPU usage)
			env: {
				NODE_ENV: "development", // Environment variables
			},
			env_production: {
				NODE_ENV: "production",
			},
		},
		{
			name: "MyCdnApp", // Name of the second application
			script: "./cdn/index.js", // Entry point of the second application
			instances: 1, // Number of instances to run
			env: {
				NODE_ENV: "development", // Environment variables
			},
			env_production: {
				NODE_ENV: "production",
			},
		},
	],
};
