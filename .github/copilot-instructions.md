This file instructs how to work with this project's development environment.

## Environment Setup

This project uses **Docker Compose** (`docker compose` NOT `docker-compose`) to manage all development services:

- **Node.js/Next.js** - Application server (port 3000)
- **PostgreSQL** - Database
- **Nginx** - Reverse proxy and caching layer

## Running Commands

**IMPORTANT**: All application commands MUST be run via Docker Compose (`docker compose`), not locally.

### Starting the development environment

```bash
docker compose up -d
```

### Stopping the environment

```bash
docker compose down
```

### Viewing logs

```bash
docker compose logs -f node
```

## Script Execution

This project uses **npm** for package management. All scripts should be executed inside the running container (including npx commands).
When you need to run pnpm scripts:

1. **For development/testing** - Let the running container handle it:

   ```bash
   docker compose exec node npm run <script-name>
   ```

2. **For one-off tasks**:

   ```bash
   docker compose run --rm node npm run <script-name>
   ```

3. **Available scripts** (see package.json):
   - `npm run dev` - Start development server (already running)
   - `npm run build` - Build for production
   - `npm run start` - Start production server
   - `npm run lint` - Run linter
   - `npx prisma db push` - Sync Prisma schema with database
   - `npx prisma migrate dev` - Create and apply Prisma migrations
   - `npm run db:seed` - Seed database with initial data

## Database Management

Database operations are handled via Prisma:

```bash
# Apply schema changes
docker compose exec node npx prisma db push

# Create a new migration
docker compose exec node npx prisma migrate dev

# Access database directly (if needed)
docker compose exec postgres psql -U postgres -d hammerspace
```

## File Modifications

When you need to:

- **Modify package.json** - Changes apply on next `docker compose up` (dependencies reinstalled)
- **Modify Dockerfile** - Rebuild with `docker compose up --build`
- **Modify application code** - Auto-reloads in development (volume mounted)
- **Modify .env variables** - Restart container with `docker compose restart node`

## Key Points

- ✅ Do NOT try to run `npm install` locally
- ✅ Do NOT try to run `next dev` or other scripts locally
- ✅ All database operations go through Docker
- ✅ The app is available at http://localhost:3000
- ✅ The admin area requires authentication (see documentation)
- ✅ Nginx proxy is available at http://localhost (port 80)

## Project Structure

```
├── docker compose.yml    # Docker setup
├── Dockerfile            # Node/Next.js image
├── nginx.conf           # Caching configuration
├── prisma/              # Database schema
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # React components
│   ├── lib/             # Utilities
│   ├── actions/         # Server actions
│   └── styles/          # CSS Modules
└── package.json         # Dependencies
```

## Troubleshooting

- **Port already in use**: Change ports in docker compose.yml or .env
- **Database connection errors**: Check `docker compose logs postgres`
- **Build failures**: Run `docker compose up --build` to rebuild images
- **Module not found**: Run `docker compose exec node npm install`
