#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
	echo "Usage: $0 <release-name> <output-dir>" >&2
	exit 1
fi

release_name="$1"
output_dir="$2"

rm -rf "$output_dir"
mkdir -p "$output_dir"

standalone_dir=".next/standalone"
static_dir=".next/static"

if [[ ! -d "$standalone_dir" ]]; then
	echo "Standalone build output not found at $standalone_dir. Run npm run build first." >&2
	exit 1
fi

if [[ ! -d "$static_dir" ]]; then
	echo "Static build output not found at $static_dir. Run npm run build first." >&2
	exit 1
fi

if [[ ! -d node_modules ]]; then
	echo "node_modules not found. Run npm ci first." >&2
	exit 1
fi

# `next build` with `output: "standalone"` produces a self-contained
# .next/standalone/ (server.js plus its own pruned node_modules), but it
# deliberately does NOT copy in .next/static/ (JS/CSS assets) or the
# top-level public/ directory — Next.js expects those to be copied in by
# hand. This is documented, not a bug:
# https://nextjs.org/docs/app/api-reference/config/next-config-js/output
mkdir -p "$standalone_dir/.next/static"
cp -R "$static_dir/." "$standalone_dir/.next/static/"
mkdir -p "$standalone_dir/public"
if [[ -d public ]]; then
	cp -R public/. "$standalone_dir/public/"
fi

# Ship the now-complete standalone server as "standalone/" at the release
# root. deploy/pm2/ecosystem.*.config.cjs and scripts/vps-install.sh /
# vps-first-install.sh expect it there (cwd = <install-dir>/standalone,
# script = server.js).
cp -R "$standalone_dir" "$output_dir/standalone"

cp -R prisma "$output_dir/prisma"
cp package.json package-lock.json "$output_dir/"
cp prisma.config.ts "$output_dir/"

# .next/standalone/node_modules is self-contained for *running the app*
# (Next's file tracer copies in exactly what server.js requires at
# runtime), but it does not include the `prisma` CLI package, since that's
# invoked separately on the VPS (`npx prisma migrate deploy` in
# scripts/vps-install.sh / vps-first-install.sh) rather than required by
# server.js. Ship a second, separate node_modules at the release root — the
# pruned production node_modules produced by `npm ci --omit=dev` just
# before this script runs — purely so that CLI command has something to
# resolve `prisma` against. It is not used to run the app itself.
cp -R node_modules "$output_dir/node_modules"

mkdir -p "$output_dir/scripts"
cp scripts/vps-install.sh scripts/vps-first-install.sh scripts/create-initial-admin.ts "$output_dir/scripts/"
chmod +x "$output_dir/scripts/vps-install.sh" "$output_dir/scripts/vps-first-install.sh"

cat > "$output_dir/.release-info" <<EOF
release=${release_name}
created_at=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
EOF

tar -czf "${release_name}.tar.gz" -C "$(dirname "$output_dir")" "$(basename "$output_dir")"
