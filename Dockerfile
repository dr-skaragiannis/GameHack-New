# syntax=docker/dockerfile:1

# ── build ───────────────────────────────────────────────────────────────────
# Vite and the type definitions are dev dependencies, so the bundle is produced
# in a throwaway stage and only dist/ crosses into the runtime image.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── runtime ─────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY server ./server
COPY --from=build /app/dist ./dist

# Accounts, scrypt password hashes, recovery-key hashes and password-reset
# tokens all live in this one file. It MUST be a mounted volume: the container
# filesystem is discarded on every deploy, and with it every credential.
ENV AUTH_DATA_FILE=/var/data/accounts.json
RUN mkdir -p /var/data && chown -R node:node /var/data
VOLUME ["/var/data"]

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "const p=process.env.PORT||3000;fetch('http://127.0.0.1:'+p+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server/index.mjs"]
