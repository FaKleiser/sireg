#!/bin/sh
set -eu

# Run from the repository root after building the CLI and the docs.
preview="$(mktemp -d)"
server=''
cleanup() {
  if [ -n "$server" ]; then
    kill "$server" 2>/dev/null || true
  fi
  rm -rf "$preview"
}
trap cleanup EXIT
trap 'exit 1' HUP INT TERM

# Keep the GitHub Pages project path in the local requests.
ln -s "$PWD/website/public" "$preview/sireg"
python3 -m http.server 8765 --bind 127.0.0.1 --directory "$preview" > "$preview/server.log" 2>&1 &
server=$!
if ! curl --fail --silent --show-error --retry 5 --retry-delay 1 --retry-connrefused \
  http://127.0.0.1:8765/sireg/sitemap.xml > /dev/null; then
  cat "$preview/server.log"
  exit 1
fi
node dist/cli.js check \
  --sitemap http://127.0.0.1:8765/sireg/sitemap.xml \
  --origin http://127.0.0.1:8765 \
  --expect-status 200 --no-progress \
  --report console --html "$preview/report.html"

test -s "$preview/report.html"
python3 website/verify-links.py
