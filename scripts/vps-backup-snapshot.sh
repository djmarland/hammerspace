#!/usr/bin/env bash
set -euo pipefail

db_dir="${1:-/var/www/db}"
snapshot_dir="$db_dir/snapshots"
mkdir -p "$snapshot_dir"

shopt -s nullglob
databases=("$db_dir"/*.db)
if [[ ${#databases[@]} -eq 0 ]]; then
	echo "No databases found in $db_dir" >&2
	exit 1
fi

for db in "${databases[@]}"; do
	name="$(basename "$db")"
	tmp="$snapshot_dir/.tmp-$name"
	rm -f "$tmp" "$tmp-wal" "$tmp-shm"
	sqlite3 "$db" ".backup '$tmp'"
	sqlite3 "$tmp" "PRAGMA journal_mode=DELETE" >/dev/null
	result="$(sqlite3 "$tmp" "PRAGMA integrity_check")"
	rm -f "$tmp-wal" "$tmp-shm"
	if [[ "$result" != "ok" ]]; then
		rm -f "$tmp"
		echo "Integrity check failed for the snapshot of $db: $result" >&2
		exit 1
	fi
	mv -f "$tmp" "$snapshot_dir/$name"
	echo "Snapshotted $db"
done

date -u +%Y-%m-%dT%H:%M:%SZ > "$snapshot_dir/.LAST_SUCCESS.tmp"
mv -f "$snapshot_dir/.LAST_SUCCESS.tmp" "$snapshot_dir/LAST_SUCCESS"
