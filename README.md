# Hammerspace Blog

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed

### Start Development Environment

```bash
# Copy environment file
cp .env.example .env.local

# Set the canonical public host used for RSS, sitemap, and posts post canonicals
# Example: NEXT_PUBLIC_SITE_URL=http://localhost

# Start all services (Node, PostgreSQL, Nginx)
docker compose up -d

# View logs
docker compose logs -f node
```

The app will be available at:

- **Public Blog**: http://localhost or http://localhost:80
- **App Direct**: http://localhost:3000
- **Admin Dashboard**: http://localhost/admin (after setting up users)

### Stop Services

```bash
docker compose down
```

## 🏗️ Architecture

### Tech Stack

- **Frontend/Backend**: Next.js 15 (App Router) with TypeScript
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Authentication**: Custom JWT cookie sessions + WebAuthn passkeys
- **Styling**: CSS Modules
- **Reverse Proxy**: Nginx with SWR caching
- **Package Manager**: npm

### Directory Structure

```
hammerspace/
├── docker-compose.yml       # Orchestration configuration
├── Dockerfile              # Node.js app image
├── nginx.conf              # Reverse proxy and caching rules
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home/blog listing
│   │   ├── admin/          # Admin routes (protected)
│   │   ├── api/auth/       # Auth + WebAuthn routes
│   │   └── posts/          # Individual post pages
│   ├── actions/            # Server Actions
│   │   └── posts.ts        # Post CRUD operations
│   ├── components/         # React components
│   ├── lib/
│   │   └── db.ts          # Prisma client singleton
│   └── styles/            # CSS Modules
├── package.json           # Dependencies
├── next.config.js         # Next.js config
├── tsconfig.json          # TypeScript config
└── copilot-skills.md      # Copilot CLI instructions
```

## 📋 Running Commands

All commands should be run via Docker. See `copilot-skills.md` for detailed instructions.

### Common Tasks

```bash
# Apply database schema changes
docker compose exec node npx prisma db push

# Create a migration
docker compose exec node npx prisma migrate dev

# Seed database (if available)
docker compose exec node npm run db:seed

# Access database shell
docker compose exec postgres psql -U postgres -d hammerspace

# Rebuild Docker image
docker compose up --build

# View application logs
docker compose logs -f node

# One-off command
docker compose run --rm node npm run <command>
```

## 🔒 Authentication

### Admin Setup

1. Create the initial admin user (fails if an admin already exists):

```bash
docker compose exec node npm run admin:create-initial
```

2. Open the printed one-time login URL, for example:

```text
http://localhost:3000/admin/login?token=<high-entropy-token>
```

3. The login page will authenticate via token and route you to passkey setup.
4. After passkey creation, the stored login token hash is cleared and cannot be used again.

## ✍️ CMS behaviour

- Posts use tags only; there are no categories.
- Cover images must use absolute external URLs.
- Draft posts are intentionally available on their real `/posts/[slug]` URL, but are excluded from archives, search, tag pages, RSS, and the sitemap.
- Published posts have a non-null `publishedAt` date and appear in public lists once the date is in the past.
- Only `publishedAt` drives visibility; there is no separate scheduled or archived state in the database.

## 🚀 Caching Strategy

### Public Blog (Stale-While-Revalidate)

- Response cache: **60 seconds max-age**
- Stale content served for: **60 seconds**
- Benefits: Fast responses, automatic background refresh

Configured in `nginx.conf` for `/` route.

### Admin Area (No Caching)

- Configured in `nginx.conf` for `/admin` route
- Always fresh content for authenticated users

### API Routes (No Caching)

- Configured in `nginx.conf` for `/api` route

### Static Assets (30-day cache)

- CSS, JS, images, fonts cached for 30 days with `immutable` flag

## 📝 Features Implemented

### Phase 1: Docker Infrastructure ✅

- Docker Compose setup (Node, PostgreSQL, Nginx)
- Dockerfile with npm and Prisma
- Nginx reverse proxy with caching configuration
- Environment configuration with `.env.example`
- Copilot skills documentation

### Phase 2: Next.js Application ✅

- TypeScript configuration
- CSS Modules setup
- App Router structure
- Layout system
- Minimal styling for demonstration

### Phase 3: Database & ORM ✅

- Prisma schema (User and Post models)
- PostgreSQL integration
- Automatic migrations on startup

### Phase 4: Authentication ✅

- Passkey-first admin authentication
- One-time bootstrap token login
- JWT cookie session management
- WebAuthn challenge verification

### Phase 5-7: Pending

- Public blog pages with SWR caching
- SEO metadata and sitemap
- Admin dashboard with CRUD
- Full testing and documentation

## 📡 RSS Feed

Published posts are available via a paginated RSS feed:

- **Endpoint**: `http://localhost:3000/feed.xml`
- **Pagination**: page 1 is `/feed.xml`, then increment `page` (`?page=2`, `?page=3`, ...)
- **Page size**: 20 posts per page
- **Item content**:
  - `description` contains the post excerpt
  - `content:encoded` contains the full post content

## 🛠️ Development

### Hot Reload

- Source code changes auto-reload in development
- Database schema changes require `npx prisma db push`
- Next.js automatically handles HMR (Hot Module Replacement)

### Adding Dependencies

```bash
# Via Docker
docker compose exec node npm install <package-name>

# Or update package.json and restart
docker compose restart node
```

### Debugging

View detailed logs:

```bash
docker compose logs -f
```

Access specific service logs:

```bash
docker compose logs -f node      # App logs
docker compose logs -f postgres  # Database logs
docker compose logs -f nginx     # Reverse proxy logs
```

## 📦 Environment Variables

See `.env.example` for all available options. Key variables:

```
# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=hammerspace
DATABASE_URL=postgresql://...

# Auth
AUTH_JWT_SECRET=<generate with: openssl rand -base64 32>
LOGIN_TOKEN_SECRET=<generate with: openssl rand -base64 32>

# Application
NODE_ENV=development
APP_PORT=3000
NEXT_PUBLIC_SITE_URL=http://localhost
```

## 🔒 Production Considerations

Before deploying to production:

1. **Authentication**
   - Generate strong `AUTH_JWT_SECRET` and `LOGIN_TOKEN_SECRET`
   - Keep bootstrap token URLs private and single-use
   - Require passkey registration immediately after token bootstrap login

2. **Database**
   - Use managed PostgreSQL (RDS, Supabase, etc.)
   - Enable SSL connections
   - Set up regular backups
   - Use strong passwords

3. **Environment**
   - Use secure secret management
   - Set `NODE_ENV=production`
   - Configure proper `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_RP_ID`, and `NEXT_PUBLIC_SITE_URL`
   - Use real domain names

4. **Caching**
   - Adjust ISR times based on content update frequency
   - Consider CDN for static assets
   - Monitor cache hit rates in Nginx

5. **Security**
   - Enable HTTPS
   - Set up CORS if needed
   - Validate and sanitize user inputs
   - Use environment variables for secrets

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [SimpleWebAuthn Documentation](https://simplewebauthn.dev/)
- [Nginx Documentation](https://nginx.org/en/docs/)

## 📄 License

This project is provided as-is for demonstration purposes.
