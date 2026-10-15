# Hammerspace Blog

Hammerspace is a Next.js blog/CMS with SQLite, Prisma, and passkey-based admin authentication. Development runs in Docker Compose; production is deployed to a VPS as a release zip built by GitHub Actions and run under PM2.

## Quick start

### Prerequisites

- Docker and Docker Compose
- Node.js 26+ for local scripting if needed

### Development

```bash
cp .env.example .env.local
docker compose up -d
docker compose logs -f node
```

The app is available at:

- Public site: http://localhost
- App direct: http://localhost:3000
- Admin: http://localhost/admin

### Stop

```bash
docker compose down
```

## Architecture

- **App**: Next.js 16 + React 19
- **Language**: TypeScript
- **Database**: SQLite (via `better-sqlite3`), one file per environment
- **ORM**: Prisma
- **Auth**: JWT cookie sessions + WebAuthn passkeys
- **Reverse proxy**: Nginx
- **Package manager**: npm

### Project structure

```text
docker-compose.yml   # Local dev stack
Dockerfile           # App image
nginx.conf           # Local dev reverse proxy config
deploy/              # VPS nginx + PM2 configs for beta and prod
prisma/              # Schema and migrations
scripts/             # Install/release helpers
src/app/             # Next.js App Router routes
src/lib/             # Application helpers
.github/workflows/   # CI and release automation
```

## Local commands

Run scripts through Docker Compose:

```bash
docker compose exec node npm run build
docker compose exec node npm run lint
docker compose exec node npm run db:push
docker compose exec node npm run db:migrate
docker compose exec node npm run --silent admin:create-initial | sqlite3 data/hammerspace.db
```

Useful npm scripts:

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run generate`
- `npm run db:push`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run admin:create-initial`

## Environment variables

Copy `.env.example` and set these values for both development and production:

- `NODE_ENV`
- `APP_PORT`
- `DATABASE_PATH` (absolute path to the SQLite database file; in production
  this must be outside the install directory, e.g. `/var/lib/hammerspace/www.db`)
- `AUTH_JWT_SECRET`
- `LOGIN_TOKEN_SECRET`
- `PUBLIC_RP_ID` (WebAuthn relying-party ID / domain)
- `PUBLIC_APP_URL`
- `PUBLIC_SITE_URL` (canonical public site URL)
- `UPLOAD_DIR` (filesystem path uploaded assets are written to - the
  `assets.hammerspace.co.uk` nginx vhost's root + `/uploaded` in production;
  see `docker-compose.yml`'s `assets_data` volume for local dev)
- `PUBLIC_ASSETS_URL` (public base URL those files are served from - the
  local dev nginx's `/uploaded/` location, or `https://assets.hammerspace.co.uk/uploaded`
  in production/beta)

Generate secrets with:

```bash
openssl rand -base64 32
```

## Production deployment

Production is a VPS install, not Docker-based.

### Release flow

1. Push a commit to `main`.
2. GitHub Actions runs `npm ci`, `npm run generate`, and `npm run build` (`next build`, producing `output: "standalone"`), then re-runs `npm ci --omit=dev --ignore-scripts` to reduce `node_modules` to production dependencies only.
3. `scripts/package-release.sh` copies `.next/static/` and the top-level `public/` into `.next/standalone/` (Next.js does not include either in the standalone output — see the [output docs](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)), then packages:
   - `.next/standalone/`, renamed `standalone/` — the self-contained Next.js server (`server.js` + its own pruned `node_modules/`), plus the copied-in static assets and `public/`
   - `prisma/`
   - the pruned production `node_modules/` — not used to run the app (which is self-contained under `standalone/node_modules/`), only so `npx prisma migrate deploy` has the `prisma` CLI on the VPS
   - the VPS install scripts
   - `package.json`, `package-lock.json`, and `prisma.config.ts`
4. The tar is attached to a GitHub prerelease for that commit.

### VPS layout

Two environments run side by side on the same VPS, each as its own release directory, `.env`, PM2 app, and nginx site:

| Environment | Domain                 | Install dir                       | PM2 app name       | App port |
| ----------- | ---------------------- | --------------------------------- | ------------------ | -------- |
| Beta        | beta.hammerspace.co.uk | `/var/www/beta.hammerspace.co.uk` | `beta-hammerspace` | 3000     |
| Production  | www.hammerspace.co.uk  | `/var/www/www.hammerspace.co.uk`  | `www-hammerspace`  | 3001     |

Config-as-code for both is kept in [`deploy/`](deploy/):

```text
deploy/
├── pm2/
│   ├── ecosystem.beta.config.cjs   # copy to /var/www/beta.hammerspace.co.uk/ecosystem.config.cjs
│   └── ecosystem.prod.config.cjs   # copy to /var/www/www.hammerspace.co.uk/ecosystem.config.cjs
└── nginx/
    ├── cache.conf                        # proxy_cache_path zones, include in http {}
    ├── beta.hammerspace.co.uk.conf       # site config for sites-available/
    └── www.hammerspace.co.uk.conf        # site config for sites-available/
```

Each release unpacks flat into its install directory, so an installed environment looks like:

```text
/var/www/beta.hammerspace.co.uk/
├── standalone/          # Next.js standalone server (server.js, .next/, its own node_modules/, public/) — what PM2 runs
├── prisma/              # schema + migrations
├── node_modules/        # pruned prod deps, present only for the `prisma` CLI (`npx prisma migrate deploy`)
├── package.json, package-lock.json, prisma.config.ts
├── .env                 # preserved across releases
└── ecosystem.config.cjs # preserved across releases
```

Everything else in the install directory is deleted on every release, so each environment's SQLite database lives outside it, in `/var/lib/hammerspace/` (`beta.db` / `www.db`), pointed to by `DATABASE_PATH` in that environment's `.env`. The install scripts refuse to run if `DATABASE_PATH` is unset, relative, or inside the install directory.

`scripts/vps-install.sh` / `scripts/vps-first-install.sh` never delete an existing `ecosystem.config.cjs` inside the install directory, and will use it (via `pm2 start ecosystem.config.cjs --only <name>`) if present, falling back to a plain `pm2 start node --name <name> --cwd <install-dir>/standalone -- server.js` otherwise.

### Initial VPS install

1. Install Node.js 26+, npm, the `sqlite3` CLI, unzip, curl, nginx, and PM2.
2. Create both app directories and the database directory, e.g.:

   ```bash
   sudo mkdir -p /var/www/beta.hammerspace.co.uk /var/www/www.hammerspace.co.uk /var/lib/hammerspace
   sudo chown "$USER" /var/www/beta.hammerspace.co.uk /var/www/www.hammerspace.co.uk /var/lib/hammerspace
   ```

3. Copy the matching ecosystem file into each install dir:

   ```bash
   cp deploy/pm2/ecosystem.beta.config.cjs /var/www/beta.hammerspace.co.uk/ecosystem.config.cjs
   cp deploy/pm2/ecosystem.prod.config.cjs /var/www/www.hammerspace.co.uk/ecosystem.config.cjs
   ```

4. Place each environment's `.env` file at `/var/www/beta.hammerspace.co.uk/.env` and `/var/www/www.hammerspace.co.uk/.env` respectively. Each `.env` must set its own `DATABASE_PATH` (`/var/lib/hammerspace/beta.db` / `/var/lib/hammerspace/www.db`) and `PUBLIC_APP_URL`/`PUBLIC_SITE_URL`/`PUBLIC_RP_ID` (matching that environment's domain). Do **not** set `PORT` in `.env` — it's hardcoded in each `ecosystem.config.cjs` (3000 for beta, 3001 for prod) so the two apps can never accidentally collide.
5. Set up nginx (see below).
6. Download the release zip from the GitHub release page and, for each environment, run:

   ```bash
   bash scripts/vps-first-install.sh <release-zip-url> /var/www/beta.hammerspace.co.uk beta-hammerspace /var/www/beta.hammerspace.co.uk/.env
   bash scripts/vps-first-install.sh <release-zip-url> /var/www/www.hammerspace.co.uk www-hammerspace /var/www/www.hammerspace.co.uk/.env
   ```

   This unpacks the release, runs Prisma migrations (creating the SQLite database if it doesn't exist), and starts the app under PM2 using the environment's `ecosystem.config.cjs`.

   Then switch each database to WAL mode, which lets the site keep reading while the admin writes. This is stored in the database file, so it only needs doing once:

   ```bash
   sqlite3 /var/lib/hammerspace/beta.db 'PRAGMA journal_mode=WAL;'
   sqlite3 /var/lib/hammerspace/www.db 'PRAGMA journal_mode=WAL;'
   ```

7. Persist PM2 across reboots:

   ```bash
   pm2 save
   pm2 startup
   ```

### Update an existing VPS install

```bash
bash scripts/vps-install.sh <release-zip-url> /var/www/beta.hammerspace.co.uk beta-hammerspace /var/www/beta.hammerspace.co.uk/.env
bash scripts/vps-install.sh <release-zip-url> /var/www/www.hammerspace.co.uk www-hammerspace /var/www/www.hammerspace.co.uk/.env
```

This replaces the release contents (keeping `.env` and `ecosystem.config.cjs`), runs `prisma migrate deploy`, and restarts PM2 with the new environment.

### nginx

1. Create the cache directories (nginx does not create these itself, and `nginx -t`/start will fail with `mkdir() ... failed (2: No such file or directory)` until they exist) and copy the cache zone definitions so they load inside the `http {}` block:

   ```bash
   sudo mkdir -p /var/cache/nginx/hammerspace-beta /var/cache/nginx/hammerspace-prod
   sudo chown -R www-data:www-data /var/cache/nginx   # use 'nginx' instead of www-data on RHEL/Amazon Linux
   sudo cp deploy/nginx/cache.conf /etc/nginx/conf.d/hammerspace-cache.conf
   ```

2. Copy the site configs and enable them:

   ```bash
   sudo cp deploy/nginx/beta.hammerspace.co.uk.conf /etc/nginx/sites-available/beta.hammerspace.co.uk
   sudo cp deploy/nginx/www.hammerspace.co.uk.conf /etc/nginx/sites-available/www.hammerspace.co.uk
   sudo ln -s /etc/nginx/sites-available/beta.hammerspace.co.uk /etc/nginx/sites-enabled/
   sudo ln -s /etc/nginx/sites-available/www.hammerspace.co.uk /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

3. Add TLS with certbot for each domain once the HTTP site is working:

   ```bash
   sudo certbot --nginx -d beta.hammerspace.co.uk
   sudo certbot --nginx -d www.hammerspace.co.uk -d hammerspace.co.uk
   sudo certbot --nginx -d assets.hammerspace.co.uk
   ```

Each site config proxies to its own upstream port (3000 for beta, 3001 for prod), matching the `PORT` hardcoded in that environment's `ecosystem.config.cjs`, so the two PM2 processes never collide. `assets.hammerspace.co.uk` isn't a proxy - it serves uploaded files straight off disk (see "Uploaded assets" below).

### Uploaded assets

Both `beta` and `www` write uploaded files to the same shared directory, served statically by the `assets.hammerspace.co.uk` vhost - this is a one-time setup step, not part of the per-release install flow:

```bash
sudo mkdir -p /var/www/assets.hammerspace.co.uk/uploaded
sudo chown -R <app-user>:<app-user> /var/www/assets.hammerspace.co.uk
```

Set `UPLOAD_DIR=/var/www/assets.hammerspace.co.uk/uploaded` and
`PUBLIC_ASSETS_URL=https://assets.hammerspace.co.uk/uploaded` in **both**
`/var/www/beta.hammerspace.co.uk/.env` and `/var/www/www.hammerspace.co.uk/.env`.
The two environments intentionally share this one physical directory (there's
only one assets vhost) while keeping separate databases - each environment's
`Asset` rows only ever reference files it wrote itself.

### PM2

Each environment has its own `ecosystem.config.cjs` (see `deploy/pm2/`), naming the PM2 app (`beta-hammerspace` / `www-hammerspace`) and pointing `cwd` at that environment's `standalone/` directory with `script: "server.js"`. Actual secrets and settings (`DATABASE_PATH`, `AUTH_JWT_SECRET`, etc.) live in each environment's `.env`, which the install scripts source into the shell before starting/restarting PM2.

Useful PM2 commands:

```bash
pm2 list
pm2 logs beta-hammerspace
pm2 logs www-hammerspace
pm2 restart beta-hammerspace --update-env
pm2 restart www-hammerspace --update-env
pm2 save
pm2 startup
```

### Database migrations

- Development: `npm run db:migrate`
- Production: `npx prisma migrate deploy`

Run migrations during every release install before restarting the app.

### Backups

Each environment's whole database is the one file at `DATABASE_PATH`. Don't just `cp` it while the app is running (in WAL mode, recent writes may still be in the `-wal` file); use SQLite's online backup instead, e.g. from a nightly cron job:

```bash
sqlite3 /var/lib/hammerspace/www.db ".backup '/var/backups/hammerspace/www-$(date +%F).db'"
```

### Postgres → SQLite cutover (one-off)

Environments installed before the switch to SQLite still have their data in Postgres. Move each one over once, beta first, then www:

1. Create `/var/lib/hammerspace` (see "Initial VPS install") and install the `sqlite3` CLI.
2. In the environment's `.env`, rename `DATABASE_URL` to `SOURCE_DATABASE_URL` and add `DATABASE_PATH`, e.g. `DATABASE_PATH=/var/lib/hammerspace/beta.db`.
3. Install the first SQLite release as usual with `scripts/vps-install.sh`. This creates an empty, migrated database and restarts the app on it, so the site is briefly empty.
4. Copy the data across, then restart:

   ```bash
   cd /var/www/beta.hammerspace.co.uk
   set -a; . .env; set +a
   node scripts/migrate-postgres-to-sqlite.ts
   sqlite3 "$DATABASE_PATH" 'PRAGMA journal_mode=WAL;'
   pm2 restart beta-hammerspace --update-env
   ```

   The script refuses to run if the SQLite database already has data, and prints how many rows it copied per table.

5. Check the site, the admin login and a passkey sign-in.

Once both environments are verified, Postgres can be uninstalled, and the copy script, `pg` dependency and `SOURCE_DATABASE_URL` removed.

### Creating the initial admin user

`npm run admin:create-initial` doesn't touch the database itself — it only needs Node's built-in `crypto` and your `.env` values (`LOGIN_TOKEN_SECRET`/`AUTH_JWT_SECRET`/`AUTH_SECRET` and `PUBLIC_APP_URL`), so it works even on a production install where only the built app is deployed (no Prisma generated client required). It prints an `INSERT` statement for the `User` table to stdout, and the one-time admin login URL to stderr.

Development (via Docker Compose):

```bash
docker compose exec node npm run --silent admin:create-initial | sqlite3 data/hammerspace.db
```

Production (on the VPS, from the install directory):

```bash
set -a; . .env; set +a
npm run --silent admin:create-initial | sqlite3 "$DATABASE_PATH"
```

The login URL is printed to the terminal — copy it to log in as the new admin. Re-running the script will always print a new user/token, so only insert the SQL once.

## RSS feed

- Endpoint: `/feed.xml`
- Page size: 20 posts
- `content:encoded` uses the full post content

## Resources

- Prisma: https://www.prisma.io/docs/
- Next.js: https://nextjs.org/docs
- PM2: https://pm2.keymetrics.io/
