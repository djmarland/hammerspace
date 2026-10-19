#!/usr/bin/env bash
set -euo pipefail

repo="djmarland/hammerspace"
ssh_host="${HAMMERSPACE_SSH_HOST:-hammerspace}"
remote_deploy="/var/www/deploy.sh"

usage() {
	echo "Usage: $0 [beta|www] [commit]" >&2
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
	beta | www) ;;
	*) usage ;;
esac
domain="$environment.hammerspace.co.uk"

git fetch --quiet origin main
if [[ -n "${2:-}" ]]; then
	sha="$(git rev-parse --verify --quiet "$2^{commit}")" || {
		echo "Unknown commit: $2" >&2
		exit 1
	}
else
	sha="$(git rev-parse origin/main)"
	unpushed="$(git rev-list --count origin/main..HEAD)"
	if [[ "$unpushed" -gt 0 ]]; then
		echo "Note: HEAD has $unpushed commit(s) not on origin/main; they won't be deployed."
	fi
fi

if ! gh release view "build-$sha" --repo "$repo" >/dev/null 2>&1; then
	run_id="$(gh run list --repo "$repo" --workflow release.yml --commit "$sha" --json databaseId --jq '.[0].databaseId // empty')"
	if [[ -z "$run_id" ]]; then
		echo "No release build found for $sha. Has it been pushed to main?" >&2
		exit 1
	fi
	echo "The release build for ${sha:0:7} hasn't finished yet. Waiting for it..."
	gh run watch "$run_id" --repo "$repo" --exit-status || {
		echo "The release build failed: https://github.com/$repo/actions/runs/$run_id" >&2
		exit 1
	}
	for _ in {1..10}; do
		gh release view "build-$sha" --repo "$repo" >/dev/null 2>&1 && break
		sleep 2
	done
fi

echo
echo "Deploying to $domain:"
git log -1 --format='  %h %s (%an, %ar)' "$sha"

current="$(ssh -n -o BatchMode=yes -o ConnectTimeout=5 "$ssh_host" "sed -n 's/^release=//p' /var/www/$domain/.release-info" 2>/dev/null || true)"
if [[ -n "$current" ]] && git cat-file -e "$current^{commit}" 2>/dev/null; then
	if [[ "$current" == "$sha" ]]; then
		echo "$domain is already running this build."
	else
		echo "Changes since the current release (${current:0:7}):"
		git log --format='  %h %s' "$current..$sha"
	fi
fi

echo
read -r -p "Continue? [y/N] " answer
if [[ "$answer" != [yY]* ]]; then
	echo "Aborted." >&2
	exit 1
fi

install_dir="/var/www/$domain"
release_url="https://github.com/$repo/releases/download/build-$sha/$sha.tar.gz"
remote_cmd="if [ -x $remote_deploy ]; then $remote_deploy $environment $sha;"
remote_cmd+=" else $install_dir/scripts/vps-install.sh $release_url $install_dir $environment-hammerspace; fi"
ssh -t "$ssh_host" "sudo -iu webapp bash -c $(printf %q "$remote_cmd")"
