#!/usr/bin/env bash
set -euo pipefail

repo="djmarland/hammerspace"
www_root="/var/www"
script_dir="$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")"

usage() {
	echo "Usage: $0 [beta|www] [commit-sha]" >&2
	exit 1
}

[[ $# -le 2 ]] || usage

environment="${1:-}"
if [[ -z "$environment" ]]; then
	PS3="Deploy to which environment? "
	select environment in beta www; do
		[[ -n "$environment" ]] && break
	done
fi

case "$environment" in
	beta) port=3000 ;;
	www) port=3001 ;;
	*) usage ;;
esac
domain="$environment.hammerspace.co.uk"
install_dir="$www_root/$domain"
pm2_app_name="$environment-hammerspace"

sha="${2:-}"
if [[ -z "$sha" ]]; then
	latest_url="$(curl -fsSIL -o /dev/null -w '%{url_effective}' "https://github.com/$repo/releases/latest")"
	sha="${latest_url##*/build-}"
	if [[ ! "$sha" =~ ^[0-9a-f]{40}$ ]]; then
		echo "Could not find the latest release (got $latest_url)" >&2
		exit 1
	fi
	read -r -p "Deploy latest release $sha to $domain? [y/N] " answer
	if [[ "$answer" != [yY]* ]]; then
		echo "Aborted." >&2
		exit 1
	fi
fi

if [[ ! "$sha" =~ ^[0-9a-f]{40}$ ]]; then
	echo "Expected a full 40-character commit SHA, got: $sha" >&2
	exit 1
fi

release_url="https://github.com/$repo/releases/download/build-$sha/$sha.tar.gz"
echo "Installing build $sha to $install_dir ($pm2_app_name)"
"$script_dir/vps-install.sh" "$release_url" "$install_dir" "$pm2_app_name"

echo "Waiting for $pm2_app_name to respond on port $port..."
for _ in {1..30}; do
	if curl -fsS -o /dev/null "http://127.0.0.1:$port/"; then
		echo "Deployed $sha to https://$domain/"
		exit 0
	fi
	sleep 1
done
echo "$pm2_app_name did not respond after 30 seconds. Check: pm2 logs $pm2_app_name" >&2
exit 1
