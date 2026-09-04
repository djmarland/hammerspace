# Hammerspace Blog

Hammerspace is a SvelteKit blog/CMS with PostgreSQL, Prisma, and passkey-based admin authentication. Development runs in Docker Compose; production is deployed to a VPS as a release zip built by GitHub Actions and run under PM2.

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

- **App**: SvelteKit 2 + Vite
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Auth**: JWT cookie sessions + WebAuthn passkeys
- **Reverse proxy**: Nginx
- **Package manager**: npm

### Project structure

```text
docker-compose.yml   # Local dev stack
Dockerfile           # App image
nginx.conf           # Reverse proxy config
prisma/              # Schema and migrations
scripts/             # Install/release helpers
src/routes/          # SvelteKit routes
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
docker compose exec node npm run admin:create-initial
```

Useful npm scripts:

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`
- `npm run generate`
- `npm run db:push`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run admin:create-initial`

## Environment variables

Copy `.env.example` and set these values for both development and production:

- `NODE_ENV`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_PORT`
- `APP_PORT`
- `DATABASE_URL`
- `AUTH_JWT_SECRET`
- `LOGIN_TOKEN_SECRET`
- `PUBLIC_RP_ID` (WebAuthn relying-party ID / domain)
- `PUBLIC_APP_URL`
- `PUBLIC_SITE_URL` (canonical public site URL)

Generate secrets with:

```bash
openssl rand -base64 32
```

## Production deployment

Production is a VPS install, not Docker-based.

### Release flow

1. Push a commit to `main`.
2. GitHub Actions runs `npm ci`, `npm run build`, and `npm run generate`, then re-runs `npm ci --omit=dev` to reduce `node_modules` to production dependencies only.
3. The workflow packages:
   - the built SvelteKit output
   - `prisma/`
   - the pruned production `node_modules/`
   - the VPS install scripts
   - `package.json`, `package-lock.json`, and `prisma.config.ts`
4. The zip is attached to a GitHub prerelease for that commit.

### VPS layout

Recommended paths:

- App: `/srv/hammerspace`
- Shared env file: `/srv/hammerspace/.env`
- PM2 app name: `hammerspace`

### Initial VPS install

1. Install Node.js 26+, npm, PostgreSQL client tools, unzip, curl, and PM2.
2. Create the app directory and deploy the release zip into it.
3. Place the production `.env` file at `/srv/hammerspace/.env`.
4. Download the release zip from the GitHub release page.
5. Run:

```bash
bash scripts/vps-first-install.sh <release-zip-url> /srv/hammerspace hammerspace /srv/hammerspace/.env
```

This unpacks the release, runs Prisma migrations, and starts the app.

### Update an existing VPS install

```bash
bash scripts/vps-install.sh <release-zip-url> /srv/hammerspace hammerspace /srv/hammerspace/.env
```

This replaces the release contents, runs `prisma migrate deploy`, and restarts PM2 with the new environment.

### PM2

Use PM2 to keep the Node process alive on the VPS.

Example ecosystem file:

```js
module.exports = {
	apps: [
		{
			name: "hammerspace",
			script: "npm",
			args: "run start",
			cwd: "/srv/hammerspace",
			env_file: "/srv/hammerspace/.env",
		},
	],
};
```

Useful PM2 commands:

```bash
pm2 start ecosystem.config.cjs
pm2 restart hammerspace --update-env
pm2 save
pm2 startup
```

### Database migrations

- Development: `npm run db:migrate`
- Production: `npx prisma migrate deploy`

Run migrations during every release install before restarting the app.

## CMS behavior

- Posts use tags only; there are no categories.
- Cover images must use absolute external URLs.
- Draft posts remain on their slug URL but are excluded from archives, search, tag pages, RSS, and the sitemap.
- `publishedAt` controls visibility.

## RSS feed

- Endpoint: `/feed.xml`
- Page size: 20 posts
- `description` uses the excerpt
- `content:encoded` uses the full post content

## Resources

- Prisma: https://www.prisma.io/docs/
- SvelteKit: https://svelte.dev/docs/kit
- PM2: https://pm2.keymetrics.io/
