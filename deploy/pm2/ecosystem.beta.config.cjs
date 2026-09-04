// PM2 config for the beta environment (beta.hammerspace.co.uk).
//
// This file lives in git for reference, but the copy that actually controls
// the running process is the one on the VPS at:
//   /var/www/beta.hammerspace.co.uk/ecosystem.config.cjs
//
// scripts/vps-install.sh and scripts/vps-first-install.sh never overwrite
// ecosystem.config.cjs inside the install directory, so place this file
// there once during initial setup and it will be preserved across releases.
//
// Secrets (DATABASE_URL, AUTH_JWT_SECRET, etc.) come from
// /var/www/beta.hammerspace.co.uk/.env, which the install scripts source
// into the shell before calling `pm2 start`/`pm2 restart`.
//
// PORT is hardcoded here (not left to .env) so beta is guaranteed to run on
// 3000 regardless of what's in that shared .env file, and can never
// accidentally collide with the prod app's port. This must stay in sync
// with the `upstream` port in deploy/nginx/beta.hammerspace.co.uk.conf.
module.exports = {
	apps: [
		{
			name: "beta-hammerspace",
			script: "build/index.js",
			cwd: "/var/www/beta.hammerspace.co.uk",
			interpreter: "node",
			instances: 1,
			exec_mode: "fork",
			autorestart: true,
			max_memory_restart: "300M",
			env: {
				PORT: 3000,
			},
		},
	],
};
