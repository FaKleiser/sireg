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
python3 - "$preview" > "$preview/port" 2> "$preview/server.log" <<'PYTHON' &
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

handler = partial(SimpleHTTPRequestHandler, directory=sys.argv[1])
with ThreadingHTTPServer(("127.0.0.1", 0), handler) as server:
    print(server.server_port, flush=True)
    server.serve_forever()
PYTHON
server=$!
for _ in 1 2 3 4 5; do
  if [ -s "$preview/port" ] || ! kill -0 "$server" 2>/dev/null; then
    break
  fi
  sleep 1
done
if [ ! -s "$preview/port" ] || ! kill -0 "$server" 2>/dev/null; then
  cat "$preview/server.log"
  exit 1
fi
origin="http://127.0.0.1:$(cat "$preview/port")"
node dist/cli.js check \
  --sitemap "$origin/sireg/sitemap.xml" \
  --origin "$origin" \
  --expect-status 200 --max-redirects 0 \
  --report console --html "$preview/report.html"

test -s "$preview/report.html"
python3 website/verify-links.py
