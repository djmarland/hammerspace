<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project conventions

## Design system (Piko)

- Piko lives in `src/styles/globals.css`: CSS variables plus `piko-*` utility classes, no Tailwind. Components use CSS modules.
- Spacing (padding, margin, gap) must come from Piko tokens, never raw `rem`/`px`: `--piko-unit` and its variants (`-half`, `-quarter`, `-double`, `-triple`, `-quad`), `--piko-space-panel-padding`, `--piko-gap-*`.
- Colours: use the semantic tokens (`--piko-color-background`, `--piko-color-background-secondary`, `--piko-color-text`, …). They use `light-dark()`, so dark mode comes for free.
- Check the existing utilities before writing CSS: `piko-card`, `piko-vstack--*`, `piko-hstack--*`, `piko-prose`, `piko-t-*`. Piko's reset already zeroes `ol`/`ul` margin and padding and removes list markers.
- Piko is in a cascade layer, so unlayered module CSS overrides it.
- Visual effects should be CSS-only (e.g. scroll-driven animations), not JavaScript.

## Building and checks

- CI builds with a dummy `DATABASE_PATH` that has no tables. Any page that reads Prisma must be `export const dynamic = "force-dynamic"`, not `revalidate`, or the build fails while prerendering.
- Before committing: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run build` (Prettier uses tabs). Hooks: pre-commit runs `lint-staged`; pre-push runs typecheck and lint. CI runs all four on pull requests.

## Running locally

- The app runs in Docker, never directly on the host. From a fresh checkout: `cp .env.example .env.local`, then `docker compose up --build`. The app is at http://localhost:3000 and nginx at http://localhost. Do not run `npm run dev` on the host: the container has Linux builds of native modules such as `better-sqlite3`, plus the nginx proxy and the uploads volume.
- Run npm scripts inside the container, e.g. `docker compose exec node npm run db:push`.
- For design changes, check the homepage, `/posts` and a post page in light and dark mode, and at a narrow (stacked, below 56rem) width.
