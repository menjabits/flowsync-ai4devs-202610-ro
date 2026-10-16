#!/usr/bin/env bash
# PostToolUse: formatea con Prettier los archivos de frontend/src que edita el agente.
file=$(jq -r '.tool_input.file_path // empty')
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"

case "$file" in
  "$root"/frontend/src/*) ;;
  *) exit 0 ;;
esac
[ -f "$file" ] || exit 0

cd "$root/frontend" && ./node_modules/.bin/prettier --write --ignore-unknown --log-level warn "$file" >&2
exit 0
