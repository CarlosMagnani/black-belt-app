#!/bin/sh
set -e

echo "Generating Prisma client..."
npx prisma generate

echo "Running migrations..."
npx prisma migrate deploy

echo "Starting server..."
exec npx tsx watch src/server.ts
