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
// Deploy layout (see scripts/package-release.sh and scripts/vps-install.sh):
// each release tarball unpacks flat into the install directory as:
//   <install-dir>/standalone/       Next.js `output: "standalone"` server
//                                    (server.js, .next/, its own pruned
//                                    node_modules/, public/) — this is what
//                                    PM2 actually runs.
//   <install-dir>/prisma/            schema + migrations
//   <install-dir>/node_modules/      pruned prod deps, present only so
//                                    `npx prisma migrate deploy` has the
//                                    `prisma` CLI to run (the app itself
//                                    doesn't need this — it's self-contained
//                                    under standalone/node_modules/)
//   <install-dir>/package.json, package-lock.json, prisma.config.ts
//   <install-dir>/.env, ecosystem.config.cjs   (preserved across releases)
//
// Secrets (DATABASE_URL, AUTH_JWT_SECRET, etc.) come from
// /var/www/beta.hammerspace.co.uk/.env, which the install scripts source
// into the shell before calling `pm2 start`/`pm2 restart`. That .env must
// also set UPLOAD_DIR=/var/www/assets.hammerspace.co.uk/uploaded and
// PUBLIC_ASSETS_URL=https://assets.hammerspace.co.uk/uploaded for uploaded
// assets to work. Note beta and prod share this same physical uploaded/
// directory (there's only one assets.hammerspace.co.uk vhost) while having
// separate databases — each environment's Asset rows only ever reference
// files it wrote itself.
//
// PORT is hardcoded here (not left to .env) so beta is guaranteed to run on
// 3000 regardless of what's in that shared .env file, and can never
// accidentally collide with the prod app's port. This must stay in sync
// with the `upstream` port in deploy/nginx/beta.hammerspace.co.uk.conf.
module.exports = {
	apps: [
		{
			name: "beta-hammerspace",
			script: "server.js",
			cwd: "/var/www/beta.hammerspace.co.uk/standalone",
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
