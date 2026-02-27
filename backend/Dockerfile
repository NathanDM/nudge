# Stage 1: build TypeScript
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN npm ci
COPY backend/ ./backend/
RUN npm run build -w backend

# Stage 2: production
FROM node:20-alpine
RUN apk add --no-cache dumb-init
WORKDIR /app

# Copy full node_modules (devDeps kept because drizzle-kit is a devDep
# required at runtime for migrations — it's at node_modules/.bin/drizzle-kit)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./backend/dist

# Migration files are NOT compiled by TypeScript — must copy explicitly
COPY backend/src/infrastructure/database/migrations ./backend/src/infrastructure/database/migrations
COPY backend/drizzle.config.ts ./backend/drizzle.config.ts

COPY package.json ./
COPY backend/package.json ./backend/
COPY backend/entrypoint.sh ./backend/entrypoint.sh
RUN chmod +x ./backend/entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["./backend/entrypoint.sh"]
