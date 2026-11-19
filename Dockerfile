# syntax=docker/dockerfile:1
ARG NODE_IMAGE=node:24-bookworm-slim@sha256:dc26ae92c9fb15cf6b1d63e20f0944b2efe0f115b20e00be48fb23fceb061c54
FROM ${NODE_IMAGE} AS build

WORKDIR /app
ENV CI=true
RUN npm install --global pnpm@11.25.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN --mount=type=cache,target=/app/.sites-runtime/pnpm-store pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
RUN node -e '\
  const fs = require("node:fs"); \
  const config = JSON.parse(fs.readFileSync("dist/server/wrangler.json", "utf8")); \
  const database = config.d1_databases.find(({ binding }) => binding === "DB"); \
  if (!database) throw new Error("D1 binding DB is required"); \
  database.migrations_dir = "../../drizzle"; \
  config.dev.enable_containers = false; \
  fs.writeFileSync("dist/server/wrangler.docker.json", JSON.stringify(config));'

FROM ${NODE_IMAGE}

WORKDIR /app
ENV CI=true NODE_ENV=production SITES_RUNTIME_ROOT=/data/runtime
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY drizzle ./drizzle
COPY scripts/sites-env.mjs scripts/start-docker.sh ./scripts/

RUN install -d -o node -g node /data /app/dist/server/.wrangler
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s \
  CMD node -e 'require("node:https").get("https://127.0.0.1:8080/api/event", { rejectUnauthorized: false }, r => { r.resume(); process.exitCode = r.statusCode === 200 ? 0 : 1; }).on("error", () => { process.exitCode = 1; })'
CMD ["sh", "scripts/start-docker.sh"]
