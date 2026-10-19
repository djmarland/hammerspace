#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 3 || $# -gt 4 ]]; then
	echo "Usage: $0 <release-tarball-url> <install-dir> <pm2-app-name> [env-file]" >&2
	exit 1
fi

release_tarball_url="$1"
install_dir="$2"
pm2_app_name="$3"
tmp_dir="/tmp/hammerspace-install-$pm2_app_name"
tarball_path="$tmp_dir/release.tar.gz"
rm -rf "$tmp_dir"
trap 'rm -rf "$tmp_dir"' EXIT
mkdir -p "$tmp_dir/unpacked"

curl -fsSL "$release_tarball_url" -o "$tarball_path"
mkdir -p "$install_dir"
install_dir="$(cd "$install_dir" && pwd)"
env_file="${4:-$install_dir/.env}"
tar -xzf "$tarball_path" -C "$tmp_dir/unpacked"

release_root="$(find "$tmp_dir/unpacked" -mindepth 1 -maxdepth 1 -type d | head -n 1)"
if [[ -z "${release_root:-}" ]]; then
	echo "Release tarball did not contain a top-level directory" >&2
	exit 1
fi

find "$install_dir" -mindepth 1 -maxdepth 1 ! -name .env ! -name ecosystem.config.cjs -exec rm -rf {} +
cp -R "$release_root"/. "$install_dir"/

cd "$install_dir"
if [[ ! -f package.json ]]; then
	echo "Release contents are missing package.json" >&2
	exit 1
fi

if [[ ! -f "$env_file" ]]; then
	echo "Missing environment file: $env_file" >&2
	exit 1
fi

set -a
. "$env_file"
set +a

# The SQLite database must live outside the install directory: everything in
# it except .env and ecosystem.config.cjs is deleted on every release (see
# the `find ... -exec rm -rf` above). It must also be absolute, because PM2
# runs the app from standalone/ while Prisma runs from the install root.
case "${DATABASE_PATH:-}" in
	"")
		echo "DATABASE_PATH is not set in $env_file" >&2
		exit 1
		;;
	"$install_dir"/*)
		echo "DATABASE_PATH ($DATABASE_PATH) must be outside $install_dir, which is wiped on every release" >&2
		exit 1
		;;
	/*) ;;
	*)
		echo "DATABASE_PATH ($DATABASE_PATH) must be an absolute path" >&2
		exit 1
		;;
esac
mkdir -p "$(dirname "$DATABASE_PATH")"

for attempt in {1..5}; do
	if npx prisma migrate deploy 2>&1 | tee "$tmp_dir/migrate.log"; then
		break
	fi
	if [[ $attempt -eq 5 ]] || ! grep -q "database is locked" "$tmp_dir/migrate.log"; then
		exit 1
	fi
	echo "Database is locked; stopping $pm2_app_name and retrying in 5 seconds..." >&2
	pm2 stop "$pm2_app_name" >/dev/null 2>&1 || true
	sleep 5
done

if [[ -f "$install_dir/ecosystem.config.cjs" ]]; then
	pm2 restart "$pm2_app_name" --update-env || pm2 start ecosystem.config.cjs --only "$pm2_app_name"
else
	# Fallback for a first-time install with no ecosystem.config.cjs yet.
	# The release unpacks the Next.js `output: "standalone"` server into
	# <install-dir>/standalone/server.js (see scripts/package-release.sh).
	pm2 restart "$pm2_app_name" --update-env || pm2 start node --name "$pm2_app_name" --cwd "$install_dir/standalone" -- server.js
fi
