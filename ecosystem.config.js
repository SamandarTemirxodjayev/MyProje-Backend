const path = require("path");

module.exports = {
	apps: [
		{
			name: "Server",
			script: "./index.js",

			instances: 1,
			exec_mode: "fork",
			watch: false,

			error_file: path.join(__dirname, "pm2_logs", "error.log"),
			out_file: path.join(__dirname, "pm2_logs", "out.log"),
			log_date_format: "YYYY-MM-DD HH:mm Z",

			autorestart: true,
		},
		{
			name: "CDN",
			script: "./cdn/index.js",

			instances: 1,
			exec_mode: "fork",
			watch: false,

			error_file: path.join(__dirname, "pm2_logs", "error.log"),
			out_file: path.join(__dirname, "pm2_logs", "out.log"),
			log_date_format: "YYYY-MM-DD HH:mm Z",

			autorestart: true,
		},
	],
};
