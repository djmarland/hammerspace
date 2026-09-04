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

build_dir="build"

if [[ ! -d "$build_dir" ]]; then
	echo "Build output not found. Run npm run build first." >&2
	exit 1
fi

if [[ ! -d node_modules ]]; then
	echo "node_modules not found. Run npm ci first." >&2
	exit 1
fi

cp -R "$build_dir" "$output_dir/build"
cp -R prisma "$output_dir/prisma"
cp package.json package-lock.json "$output_dir/"
cp prisma.config.ts "$output_dir/"
cp -R node_modules "$output_dir/node_modules"
mkdir -p "$output_dir/scripts"
cp scripts/vps-install.sh scripts/vps-first-install.sh "$output_dir/scripts/"
chmod +x "$output_dir/scripts/vps-install.sh" "$output_dir/scripts/vps-first-install.sh"

cat > "$output_dir/.release-info" <<EOF
release=${release_name}
created_at=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
EOF

tar -czf "${release_name}.tar.gz" -C "$(dirname "$output_dir")" "$(basename "$output_dir")"
