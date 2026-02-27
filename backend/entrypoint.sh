#!/bin/sh
set -e
echo "Running database migrations..."
cd /app/backend
/app/node_modules/.bin/drizzle-kit migrate --config=drizzle.config.ts
echo "Starting NestJS..."
exec node /app/backend/dist/main.js
