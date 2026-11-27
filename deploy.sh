#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"

# A reviewed release supplies immutable images, existing runtime configuration,
# persistent mounts, and a verified backup. Never initialize production here.
OVERRIDE="${SAFE_DEPLOY_OVERRIDE:-docker-compose.production-safe.yml}"
BACKUP="${VERIFIED_BACKUP_DIRECTORY:-}"
if [ ! -f .env ] || [ ! -f "$OVERRIDE" ] || [ -z "$BACKUP" ]; then
    echo "Deployment refused: existing .env, safe Compose override, and VERIFIED_BACKUP_DIRECTORY are required."
    exit 1
fi
if [ ! -s "$BACKUP/database.sql.gz" ] || [ ! -s "$BACKUP/media.tar.gz" ] || [ ! -f "$BACKUP/database-restore-verified" ]; then
    echo "Deployment refused: database/media backups and a successful isolated restore check are required."
    exit 1
fi
(cd "$BACKUP" && sha256sum --check backups.sha256)

# Update only Langit application processes. Do not stop/recreate databases,
# Redis, shared networks, web servers, or containers belonging to other sites.
docker compose -p langitcreativepro -f docker-compose.yml -f "$OVERRIDE" \
    up -d --no-deps --no-build app queue cron

# Merge compiled assets without deleting old hashes still used by open pages.
mkdir -p public/build
docker cp langit_app:/var/www/html/public/build/. public/build/
docker compose -p langitcreativepro -f docker-compose.yml -f "$OVERRIDE" ps
echo "Code release activated. No migrations, seeders, key rotation, or data cleanup were executed."
