#!/bin/bash
# Bump version, commit, tag, and push.
# Usage: ./scripts/bump-version.sh [major|minor|patch]
#   Defaults to patch if no argument given.

set -euo pipefail

BUMP_TYPE="${1:-patch}"
PLUGIN_JSON=".claude-plugin/plugin.json"
MARKETPLACE_JSON=".claude-plugin/marketplace.json"
PACKAGE_JSON="package.json"

current_version=$(jq -r '.version' "$PLUGIN_JSON")
IFS='.' read -r major minor patch <<< "$current_version"

case "$BUMP_TYPE" in
  major) major=$((major + 1)); minor=0; patch=0 ;;
  minor) minor=$((minor + 1)); patch=0 ;;
  patch) patch=$((patch + 1)) ;;
  *) echo "Usage: $0 [major|minor|patch]"; exit 1 ;;
esac

new_version="$major.$minor.$patch"

jq --arg v "$new_version" '.version = $v' "$PLUGIN_JSON" > tmp.json && mv tmp.json "$PLUGIN_JSON"
jq --arg v "$new_version" '.metadata.version = $v | .plugins[0].version = $v' "$MARKETPLACE_JSON" > tmp.json && mv tmp.json "$MARKETPLACE_JSON"
jq --arg v "$new_version" '.version = $v' "$PACKAGE_JSON" > tmp.json && mv tmp.json "$PACKAGE_JSON"

git add "$PLUGIN_JSON" "$MARKETPLACE_JSON" "$PACKAGE_JSON"
git commit -m "chore: bump version to $new_version"
git tag "v$new_version"
git push && git push --tags

echo "$current_version → $new_version (tagged v$new_version)"
