#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 3 || $# -gt 4 ]]; then
	echo "Usage: $0 <release-zip-url> <install-dir> <pm2-app-name> [env-file]" >&2
	exit 1
fi

release_zip_url="$1"
install_dir="$2"
pm2_app_name="$3"
env_file="${4:-$install_dir/.env}"
tmp_dir="$(mktemp -d)"
zip_path="$tmp_dir/release.zip"

curl -fsSL "$release_zip_url" -o "$zip_path"
mkdir -p "$install_dir"
unzip -q "$zip_path" -d "$tmp_dir/unpacked"

release_root="$(find "$tmp_dir/unpacked" -mindepth 1 -maxdepth 1 -type d | head -n 1)"
if [[ -z "${release_root:-}" ]]; then
	echo "Release zip did not contain a top-level directory" >&2
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

npx prisma migrate deploy
pm2 restart "$pm2_app_name" --update-env || pm2 start node --name "$pm2_app_name" -- build/index.js

rm -rf "$tmp_dir"
