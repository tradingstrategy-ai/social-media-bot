#!/bin/bash
# update-production.sh
#
# Deployment script for social-media-bot production server
#
# Usage:
#   ./scripts/update-production.sh          # Deploy latest version
#   ./scripts/update-production.sh v123     # Deploy specific version
#
# Must be run from the root of the social-media-bot deployment directory.
# Requires docker-compose.yml and logs/ directory to exist.

set -e

PROJECT_NAME="social-media-bot"
LOG_FILE="logs/deployments.log"
VERSION=${1:-latest}

echo "🚀 Starting $PROJECT_NAME deployment (version: $VERSION)..."

# Check if bot is currently running
if docker compose ps | grep -q "$PROJECT_NAME.*running"; then
    echo "❌ $PROJECT_NAME container is currently running. Aborting."
    echo "   Run 'docker compose down' first if you want to force deployment"
    exit 1
fi

# Log deployment start
echo "$(date): Starting deployment of $PROJECT_NAME:$VERSION" >> $LOG_FILE

# Set the image tag for docker compose
export IMAGE_TAG=$VERSION

echo "Pulling image version: $VERSION..."
docker compose pull

# Verify deployment and show version
echo "Verifying deployment..."
CONTAINER_VERSION=$(docker compose run --rm --entrypoint="" $PROJECT_NAME node -p "require('./package.json').version" 2>/dev/null)

if [[ -n "$CONTAINER_VERSION" ]]; then
    echo "$(date): $PROJECT_NAME:$VERSION deployment successful - version v$CONTAINER_VERSION" >> $LOG_FILE
    echo "✅ Deployment successful! Version: v$CONTAINER_VERSION"
else
    echo "$(date): $PROJECT_NAME:$VERSION deployment failed - could not get version" >> $LOG_FILE
    echo "❌ Deployment verification failed"
    exit 1
fi
