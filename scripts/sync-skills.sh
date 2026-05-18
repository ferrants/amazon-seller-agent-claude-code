#!/usr/bin/env bash
# sync-skills.sh — Upsert Marketplace Ad Pros skills into .claude/skills/.
#
# Pulls https://marketplaceadpros.com/skills/all.zip and unpacks it on top of
# the project's .claude/skills/ directory. Existing skills are overwritten
# from the bundle; any local-only skill directories are left untouched.
#
# Usage:
#   bash scripts/sync-skills.sh           # upsert from remote bundle
#   bash scripts/sync-skills.sh --dry-run # show what would change
#   SKILLS_URL=… bash scripts/sync-skills.sh  # override source

set -euo pipefail

SKILLS_URL="${SKILLS_URL:-https://marketplaceadpros.com/skills/all.zip}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_DIR="$REPO_ROOT/.claude/skills"
DRY_RUN=0

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    -h|--help)
      sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
  esac
done

need() { command -v "$1" >/dev/null 2>&1 || { echo "missing dependency: $1" >&2; exit 1; }; }
need curl
need unzip

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

echo "→ fetching $SKILLS_URL"
curl -fsSL "$SKILLS_URL" -o "$tmpdir/all.zip"

echo "→ extracting to staging"
mkdir -p "$tmpdir/unpack"
unzip -q "$tmpdir/all.zip" -d "$tmpdir/unpack"

mkdir -p "$SKILLS_DIR"

# Each top-level directory in the zip is one skill.
mapfile -t skills < <(find "$tmpdir/unpack" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort)

if [[ ${#skills[@]} -eq 0 ]]; then
  echo "no skills found in bundle — aborting" >&2
  exit 1
fi

echo
echo "skills in bundle (${#skills[@]}):"
for s in "${skills[@]}"; do
  if [[ -d "$SKILLS_DIR/$s" ]]; then
    echo "  update  $s"
  else
    echo "  add     $s"
  fi
done

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo
  echo "dry run — nothing written"
  exit 0
fi

echo
for s in "${skills[@]}"; do
  # Use ${var:?} guards so an empty SKILLS_DIR or skill name can never
  # expand to `rm -rf /` (shellcheck SC2115).
  rm -rf "${SKILLS_DIR:?SKILLS_DIR is unset}/${s:?skill name is empty}"
  cp -R "$tmpdir/unpack/$s" "$SKILLS_DIR/$s"
done

echo "✓ synced ${#skills[@]} skills into $SKILLS_DIR"
echo
echo "next: open this repo in Claude Code. Skills auto-load; run /mcp to authenticate."
