#!/bin/sh
set -eu

config=dist/server/wrangler.docker.json

node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js \
  d1 migrations apply DB --config "$config" --local --persist-to /data/state

# Keep the original HTTPS scheme when the ingress proxies a browser request.
exec node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js \
  dev --config "$config" --local --persist-to /data/state \
  --ip 0.0.0.0 --port 8080 --local-protocol https --inspector-port 0
