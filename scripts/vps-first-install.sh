#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 4 || $# -gt 5 ]]; then
	echo "Usage: $0 <release-zip-url> <install-dir> <pm2-app-name> <env-file> [ecosystem-file]" >&2
	exit 1
fi

release_zip_url="$1"
install_dir="$2"
pm2_app_name="$3"
env_file="$4"
ecosystem_file="${5:-$install_dir/ecosystem.config.cjs}"

bash "$install_dir/scripts/vps-install.sh" "$release_zip_url" "$install_dir" "$pm2_app_name" "$env_file"

cat > "$ecosystem_file" <<EOF
module.exports = {
  apps: [
    {
      name: "$pm2_app_name",
      script: "npm",
      args: "run start",
      cwd: "$install_dir",
      env_file: "$env_file",
    },
  ],
};
EOF

pm2 start "$ecosystem_file" --update-env
